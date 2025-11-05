import { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";
import { Circle, Eraser, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "eraser";

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
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            };
        }
    }, [canvasRef, roomId, socket]);

    return (
        <div className="h-screen overflow-hidden">
            <canvas
                className={selectedTool === "pencil" ? "cursor-crosshair" : ""}
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
            ></canvas>

            <TopBar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
            />
        </div>
    );
}

function TopBar({
    selectedTool,
    setSelectedTool,
}: {
    selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
}) {
    return (
        <div className="text-white fixed left-2.5 top-2.5 flex gap-6 bg-gray-800 px-4 py-2 rounded-3xl ">
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
        </div>
    );
}
