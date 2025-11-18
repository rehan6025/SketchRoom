import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { Tool } from "@/components/Canvas";

type Shape =
    | {
          type: "rect";
          x: number;
          y: number;
          width: number;
          height: number;
      }
    | {
          type: "circle";
          centerX: number;
          centerY: number;
          radius: number;
      }
    | null;

export async function initDraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket
) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shape[] = await getExistingShapes(roomId);

    if (!ctx) return;

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type == "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape.shape);
            clearCanvas(ctx, canvas, existingShapes);
        }
    };

    clearCanvas(ctx, canvas, existingShapes);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;

        //@ts-ignore
        const selectedTool = window.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {
            const shape: Shape = {
                type: "rect",
                x: startX,
                y: startY,
                width,
                height,
            };
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            const shape: Shape = {
                type: "circle",
                radius: radius,
                centerX: startX + radius,
                centerY: startY + radius,
            };
        }

        if (!shape) return;

        existingShapes.push(shape);

        socket.send(
            JSON.stringify({
                type: "chat",
                roomId: Number(roomId),
                message: JSON.stringify({ shape }),
            })
        );
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(ctx, canvas, existingShapes);
            ctx.strokeStyle = "rgba(255,255,255)";

            //@ts-ignore
            const selectedTool = window.selectedTool;
            if (selectedTool === "rect") {
                ctx.strokeRect(startX, startY, width, height);
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = startX + radius;
                const centerY = startY + radius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            }
        }
    });
}

function clearCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    existingShapes: Shape[]
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
        if (shape?.type === "rect") {
            ctx.strokeStyle = "rgba(255,255,255)";

            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape?.type === "circle") {
            const centerX = shape.centerX;
            const centerY = shape.centerY;
            const radius = shape.radius;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
    });
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}chats/${roomId}`);

    const messages = res.data.messages;

    const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    });

    return shapes;
}
