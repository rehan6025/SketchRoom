import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common";
import { prismaClient } from "@repo/db";

// used render ka port here, otherwise for local , 8080
const RENDER_PORT = Number(process.env.PORT || 8080);
const wss = new WebSocketServer({ port: RENDER_PORT });
const SKIP_DB = process.env.NO_DB === "1" || process.env.NO_DB === "true";
const FLUSH_MS = Number(process.env.FLUSH_MS ?? 10);
const MAX_BATCH_SIZE = Number(process.env.MAX_BATCH_SIZE ?? 100);

interface User {
    ws: WebSocket;
    rooms: number[];
    userId: string;
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
            } catch {}
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

const users: User[] = [];

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

    users.push({
        userId,
        rooms: [],
        ws,
    });

    ws.on("message", async function message(data) {
        let parsedData;
        if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString());
        } else {
            parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
        }

        if (parsedData.type === "join_room") {
            const user = users.find((x) => x.ws === ws);
            user?.rooms.push(Number(parsedData.roomId));
            const rId = Number(parsedData.roomId);
            if (!roomMembers.has(rId)) roomMembers.set(rId, new Set());
            roomMembers.get(rId)!.add(ws);
            try {
                ws.send(
                    JSON.stringify({
                        type: "joined",
                        roomId: rId,
                    })
                );
            } catch {}
        }

        if (parsedData.type === "leave_room") {
            const user = users.find((x) => x.ws === ws);
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

        if (parsedData.type && parsedData.type.trim() === "chat") {
            const roomId: number = Number(parsedData.roomId);
            const message = parsedData.message;

            if (!SKIP_DB) {
                try {
                    await prismaClient.chat.create({
                        data: {
                            roomId: roomId,
                            message,
                            userId,
                        },
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

        if (parsedData.type && parsedData.type.trim() === "erase") {
            const roomId: number = Number(parsedData.roomId);
            const message = parsedData.message; // contains shape to erase

            // Parse the message to get the shapeId
            const parsedMessage = JSON.parse(message);
            const shapeId = parsedMessage.shapeId;

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

                    if (chatToDelete) {
                        await prismaClient.chat.delete({
                            where: {
                                id: chatToDelete.id,
                            },
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
    });

    ws.on("close", () => {
        // Cleanup from all rooms
        users.forEach((u) => {
            if (u.ws === ws) {
                u.rooms.forEach((rid) => {
                    const set = roomMembers.get(rid);
                    if (set) {
                        set.delete(ws);
                        if (set.size === 0) roomMembers.delete(rid);
                    }
                });
            }
        });
    });
});
