import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common";
import { prismaClient } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: number[];
  userId: string;
}

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
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      const leaveId = Number(parsedData.room ?? parsedData.roomId);
      user.rooms = user.rooms.filter((x) => x !== leaveId);
    }

    if (parsedData.type && parsedData.type.trim() === "chat") {
      const roomId: number = Number(parsedData.roomId);
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: roomId,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
    }

    if (parsedData.type && parsedData.type.trim() === "erase") {
      const roomId: number = Number(parsedData.roomId);
      const message = parsedData.message; // contains shape to erase

      // Parse the message to get the shapeId
      const parsedMessage = JSON.parse(message);
      const shapeId = parsedMessage.shapeId;

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

      //ab broadcast
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "erase",
              message: message,
              roomId,
            })
          );
        }
      });
    }
  });
});
