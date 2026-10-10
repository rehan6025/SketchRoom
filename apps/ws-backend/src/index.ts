import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common";
import { prismaClient } from "@repo/db";

// used render ka port here, otherwise for local , 8080
const RENDER_PORT = Number(process.env.PORT || 8080);

const server = http.createServer((req, res) => {
    // Enable CORS so frontend can ping without CORS block
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    if (req.url === "/health" || req.url === "/ping" || req.url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "ws-backend" }));
        return;
    }
    res.writeHead(404);
    res.end();
});

const wss = new WebSocketServer({ server });

server.listen(RENDER_PORT, () => {
    console.log(`ws-backend listening on port ${RENDER_PORT}`);
});
const SKIP_DB = process.env.NO_DB?.trim() === "1" || process.env.NO_DB?.trim().toLowerCase() === "true";
const FLUSH_MS = Number(process.env.FLUSH_MS ?? 10);
const MAX_BATCH_SIZE = Number(process.env.MAX_BATCH_SIZE ?? 100);

interface User {
    ws: WebSocket;
    rooms: number[];
    userId: string;
    isAlive: boolean;
}

type OutgoingMessage = {
    type: "chat" | "erase";
    message: string;
    roomId: number;
};

const roomBuffers = new Map<number, OutgoingMessage[]>();
const roomMembers = new Map<number, Set<WebSocket>>();

let metricBatchFlushes = 0;
let metricMessagesBatched = 0;
let metricFramesSent = 0;

function flushRoom(roomId: number) {
    const batch = roomBuffers.get(roomId);
    if (!batch || batch.length === 0) {
        return;
    }

    const payload = JSON.stringify({ type: "batch", messages: batch });

    const members = roomMembers.get(roomId);
    if (members && members.size > 0) {
        members.forEach((sock) => {
            try {
                sock.send(payload);
                metricFramesSent += 1;
            } catch (err) {
                console.error("flushRoom: failed to send payload to a member", {
                    roomId,
                    err,
                });
            }
        });
    }

    roomBuffers.set(roomId, []);
    metricBatchFlushes += 1;
    metricMessagesBatched += batch.length;
}

setInterval(() => {
    for (const roomId of roomBuffers.keys()) {
        flushRoom(roomId);
    }
}, FLUSH_MS);

// Debug: surface runtime/environment details to help reproduce differences
console.log("ws-backend starting", {
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    port: RENDER_PORT,
    skipDbEnv: process.env.NO_DB,
    databaseUrlSet: !!process.env.DATABASE_URL,
});

// Try connecting Prisma early so we can fail fast and log useful errors
async function tryPrismaConnect() {
    if (SKIP_DB) {
        console.log("SKIP_DB enabled; skipping Prisma connect");
        return;
    }
    try {
        await prismaClient.$connect();
        console.log("Prisma connected successfully");
    } catch (e) {
        console.error("Prisma failed to connect at startup", e);
    }
}

// invoke but don't block startup
tryPrismaConnect();

//map instead of simple array to improve lookups,
const users = new Map<WebSocket, User>();

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (typeof decoded == "string") {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;
    } catch (e) {
        return null;
    }
}

wss.on("connection", function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";
    const userId = checkUser(token);

    if (userId == null) {
        ws.close();
        return null;
    }

    const user: User = {
        userId,
        rooms: [],
        ws,
        isAlive: true,
    };

    users.set(ws, user);

    ws.on("pong", () => {
        user.isAlive = true;
    });

    ws.on("error", (err) => {
        console.error("WS ERROR:", err);
    });

    ws.on("message", async function message(data) {
        try {
            let parsedData;
            if (typeof data !== "string") {
                parsedData = JSON.parse(data.toString());
            } else {
                parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
            }

            console.log("ws: received message", {
                type: parsedData?.type,
                url: request.url,
            });

            if (parsedData.type === "join_room") {
                const user = users.get(ws);
                if (!user) return;
                user?.rooms.push(Number(parsedData.roomId));
                const rId = Number(parsedData.roomId);
                if (!roomMembers.has(rId)) roomMembers.set(rId, new Set());
                roomMembers.get(rId)!.add(ws);
                try {
                    ws.send(
                        JSON.stringify({
                            type: "joined",
                            roomId: rId,
                        }),
                    );
                } catch (err) {
                    console.log("error in join", err);
                }
            }

            if (parsedData.type === "leave_room") {
                const user = users.get(ws);
                if (!user) {
                    return;
                }
                const leaveId = Number(parsedData.room ?? parsedData.roomId);
                user.rooms = user.rooms.filter((x) => x !== leaveId);
                const set = roomMembers.get(leaveId);
                if (set) {
                    set.delete(ws);
                    if (set.size === 0) roomMembers.delete(leaveId);
                }
            }

            if (parsedData.type && parsedData?.type === "chat") {
                const roomId: number = Number(parsedData.roomId);
                const message = parsedData.message;
                console.log("ws: chat message", { roomId, userId });

                if (!SKIP_DB) {
                    try {
                        const created = await prismaClient.chat.create({
                            data: {
                                roomId: roomId,
                                message,
                                userId,
                            },
                        });
                        console.log("ws: chat.create success", {
                            id: created.id,
                        });
                    } catch (e) {
                        console.error("ws: chat.create failed", e);
                    }
                }

                const msg: OutgoingMessage = { type: "chat", message, roomId };
                if (!roomBuffers.has(roomId)) {
                    roomBuffers.set(roomId, []);
                }

                const buf = roomBuffers.get(roomId)!;
                buf.push(msg);
                if (buf.length >= MAX_BATCH_SIZE) flushRoom(roomId);
            }

            if (parsedData.type && parsedData?.type === "erase") {
                const roomId: number = Number(parsedData.roomId);
                const message = parsedData.message; // contains shape to erase

                // Parse the message to get the shapeId
                const parsedMessage = JSON.parse(message);
                const shapeId = parsedMessage.shapeId;

                console.log("ws: erase message", { roomId, shapeId, userId });

                if (!SKIP_DB) {
                    try {
                        const chatToDelete = await prismaClient.chat.findFirst({
                            where: {
                                roomId: roomId,
                                message: {
                                    contains: `"id":"${shapeId}"`,
                                },
                            },
                        });

                        console.log("ws: erase - found chatToDelete", {
                            chatToDeleteId: chatToDelete?.id,
                        });

                        if (chatToDelete) {
                            const deleted = await prismaClient.chat.delete({
                                where: {
                                    id: chatToDelete.id,
                                },
                            });
                            console.log("ws: erase - deleted chat", {
                                deletedId: deleted.id,
                            });
                        }
                    } catch (error) {
                        console.error("Error deleting chat:", error);
                    }
                }

                //ab broadcast
                const msg: OutgoingMessage = { type: "erase", message, roomId };
                if (!roomBuffers.has(roomId)) {
                    roomBuffers.set(roomId, []);
                }

                const buf = roomBuffers.get(roomId)!;
                buf.push(msg);
                if (buf.length >= MAX_BATCH_SIZE) flushRoom(roomId);
            }
        } catch (err) {
            console.error("MESSAGE HANDLER ERROR:", err);
        }
    });

    ws.on("close", () => {
        // Cleanup from all rooms
        const user = users.get(ws);
        if (!user) return;

        for (const roomId of user.rooms) {
            const members = roomMembers.get(roomId);
            if (!members) return;
            members.delete(ws);
            if (members.size === 0) {
                roomMembers.delete(roomId);
            }
        }

        users.delete(ws);
    });
});

const heartBeatInterval = 30000;
const heartBeatTimeout = 60;

setInterval(() => {
    wss.clients.forEach((ws) => {
        const user = users.get(ws);
        if (!user) return;

        if (!user.isAlive) {
            ws.terminate();
            return;
        }
        user.isAlive = false;
        try {
            ws.ping();
        } catch {}
    });
}, heartBeatInterval);

process.on("uncaughtException", (err) => {
    console.error("uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection:", reason);
});
