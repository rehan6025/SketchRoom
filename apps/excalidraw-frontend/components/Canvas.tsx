import { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";
import {
    Circle,
    Eraser,
    Pencil,
    RectangleHorizontalIcon,
    Sun,
    Text,
} from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "eraser" | "text";

export function Canvas({
    roomId,
    socket,
}: {
    roomId: string;
    socket: WebSocket;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        const theme = localStorage.getItem("theme");
        const isDark = theme === "dark";
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket, isDark);
            setGame(g);

            return () => {
                g.destroy();
            };
        }
    }, [canvasRef, roomId, socket]);

    const handleTheme = () => {
        game?.changeTheme();
    };

    return (
        <div
            id="canvas-container"
            className="h-screen relative overflow-hidden"
        >
            <canvas
                className={selectedTool === "pencil" ? "cursor-crosshair" : ""}
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
            ></canvas>

            <TopBar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                handler={handleTheme}
            />
        </div>
    );
}

function TopBar({
    selectedTool,
    setSelectedTool,
    handler,
}: {
    selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
    handler: () => void;
}) {
    return (
        <div className="text-white fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-6 bg-cyan-900 px-4 py-2 rounded-3xl ">
            <IconButton
                activated={selectedTool === "pencil"}
                icon={<Pencil />}
                onClick={() => {
                    setSelectedTool("pencil");
                }}
            ></IconButton>
            <IconButton
                activated={selectedTool === "rect"}
                icon={<RectangleHorizontalIcon />}
                onClick={() => {
                    setSelectedTool("rect");
                }}
            ></IconButton>
            <IconButton
                activated={selectedTool === "circle"}
                icon={<Circle />}
                onClick={() => {
                    setSelectedTool("circle");
                }}
            ></IconButton>

            <IconButton
                activated={selectedTool === "eraser"}
                icon={<Eraser />}
                onClick={() => {
                    setSelectedTool("eraser");
                }}
            ></IconButton>

            <IconButton
                activated={selectedTool === "text"}
                icon={<Text />}
                onClick={() => {
                    setSelectedTool("text");
                }}
            ></IconButton>

            <button
                className={
                    "rounded-full pointer border p-2 bg-black hover:bg-gray-600 text-cyan-600"
                }
                onClick={handler}
            >
                <Sun />
            </button>
        </div>
    );
}
