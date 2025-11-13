import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import {
    CreateUserSchema,
    SigninSchema,
    CreateRoomSchema,
    JWT_SECRET,
} from "@repo/common";
import { prismaClient } from "@repo/db";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs",
        });
        return;
    }
    try {
        const checkUser = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username,
            },
        });

        if (checkUser) {
            return res.status(409).json("User exists");
        }

        const hashedPass = await bcrypt.hash(parsedData.data.password, 10);

        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw
                password: hashedPass,
                name: parsedData.data.name,
            },
        });

        const token = jwt.sign(
            {
                userId: user?.id,
            },
            JWT_SECRET
        );

        return res.status(200).json({
            token,
        });
    } catch (e) {
        res.status(411).json({
            message: "User already exists with this username",
        });
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs",
        });
        return;
    }

    // TODO: Compare the hashed pws here
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
        },
    });

    if (!user) {
        return res.status(403).json({
            message: "Invalid credentials",
        });
    } else {
        const passMatch = await bcrypt.compare(
            parsedData.data.password,
            user.password
        );

        if (!passMatch) {
            return res.status(403).json({ message: "Invalid credentials" });
        }
    }

    const token = jwt.sign(
        {
            userId: user?.id,
        },
        JWT_SECRET
    );

    res.json({
        token,
    });
});

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs",
        });
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
            },
            include: {
                admin: { select: { name: true } },
                _count: { select: { chats: true } },
            },
        });

        res.json({
            roomId: room.id,
            room: {
                id: room.id,
                slug: room.slug,
                createdAt: room.createdAt,
                adminId: room.adminId,
                admin: {
                    name: room.admin.name,
                },
                _count: {
                    chats: room._count.chats,
                },
            },
        });
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name",
        });
    }
});

//delete room endpoint
app.get("/delete-room/:roomId", middleware, async (req, res) => {
    const roomId = Number(req.params.roomId);
    //@ts-ignore: Todo: fix this
    const userId = req.userId;
    try {
        //first find all chats in this room , delte them
        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId,
                adminId: userId,
            },
        });

        if (!room) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this room" });
        }

        await prismaClient.chat.deleteMany({
            where: {
                roomId: roomId,
            },
        });

        await prismaClient.room.delete({
            where: {
                id: roomId,
            },
        });

        res.status(204).json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(404).json({ message: "Error deleting room" });
    }
});

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId,
            },
            orderBy: {
                id: "desc",
            },
            take: 100,
        });

        const reversedMessages = messages.reverse();

        res.json({
            messages: reversedMessages,
        });
    } catch (e) {
        console.log("http:backend :: chats endpoint ::", e);
        res.json({
            messages: [],
        });
    }
});

app.get("/room/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;
        const room = await prismaClient.room.findFirst({
            where: {
                slug,
            },

            include: {
                admin: { select: { name: true } },
                _count: { select: { chats: true } },
            },
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json({
            roomId: room.id,
            room: {
                id: room.id,
                slug: room.slug,
                createdAt: room.createdAt,
                adminId: room.adminId,
                admin: {
                    name: room.admin.name,
                },
                _count: {
                    chats: room._count.chats,
                },
            },
        });
    } catch (error) {
        console.error("Room not found", error);
        return res.status(404).json({ message: "Room not found" });
    }
});

app.get("/userRooms", middleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;

    try {
        const rooms = await prismaClient.room.findMany({
            where: {
                adminId: userId,
            },
            select: {
                id: true,
                slug: true,
                createdAt: true,
                admin: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        chats: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(rooms);
    } catch (e) {
        console.error("Error fetching rooms:", e);
        res.status(500).json({ message: "Error fetching rooms" });
    }
});

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});
