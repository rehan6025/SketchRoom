"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    Pencil,
    RectangleHorizontalIcon,
    Circle,
    Eraser,
    Type,
    RotateCcw,
    Users,
    Sparkles,
} from "lucide-react";

export type Tool = "pencil" | "rect" | "circle" | "eraser" | "text";

interface BaseShape {
    id: string;
    color?: string;
}

interface RectShape extends BaseShape {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CircleShape extends BaseShape {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
}

interface PencilShape extends BaseShape {
    type: "pencil";
    points: { x: number; y: number }[];
}

interface TextShape extends BaseShape {
    type: "text";
    text: string;
    x: number;
    y: number;
}

type Shape = RectShape | CircleShape | PencilShape | TextShape;

// Initial authentic system diagram shapes (centered for showcase window)
const getInitialShapes = (): Shape[] => [
    {
        id: "box-client",
        type: "rect",
        x: 145,
        y: 80,
        width: 145,
        height: 75,
        color: "#00adb5",
    },
    {
        id: "text-client-title",
        type: "text",
        text: "Client Canvas",
        x: 165,
        y: 115,
        color: "#00adb5",
    },
    {
        id: "text-client-sub",
        type: "text",
        text: "Next.js + WebSockets",
        x: 158,
        y: 137,
    },
    {
        id: "arrow-1",
        type: "pencil",
        color: "#00adb5",
        points: [
            { x: 290, y: 117 },
            { x: 315, y: 117 },
            { x: 345, y: 117 },
            { x: 337, y: 110 },
            { x: 345, y: 117 },
            { x: 337, y: 124 },
        ],
    },
    {
        id: "box-server",
        type: "rect",
        x: 350,
        y: 80,
        width: 145,
        height: 75,
        color: "#10b981",
    },
    {
        id: "text-server-title",
        type: "text",
        text: "WS Gateway",
        x: 375,
        y: 115,
        color: "#10b981",
    },
    {
        id: "text-server-sub",
        type: "text",
        text: "Pub/Sub Broadcast",
        x: 366,
        y: 137,
    },
    {
        id: "arrow-2",
        type: "pencil",
        color: "#10b981",
        points: [
            { x: 495, y: 117 },
            { x: 525, y: 117 },
            { x: 555, y: 117 },
            { x: 547, y: 110 },
            { x: 555, y: 117 },
            { x: 547, y: 124 },
        ],
    },
    {
        id: "circle-db",
        type: "circle",
        centerX: 605,
        centerY: 117,
        radius: 46,
        color: "#8b5cf6",
    },
    {
        id: "text-db-title",
        type: "text",
        text: "Room State",
        x: 570,
        y: 115,
        color: "#8b5cf6",
    },
    {
        id: "text-db-sub",
        type: "text",
        text: "< 50ms Sync",
        x: 570,
        y: 135,
    },
    {
        id: "hand-drawn-arrow-loop",
        type: "pencil",
        color: "#f59e0b",
        points: [
            { x: 422, y: 155 },
            { x: 422, y: 210 },
            { x: 310, y: 210 },
            { x: 215, y: 210 },
            { x: 215, y: 161 },
            { x: 208, y: 170 },
            { x: 215, y: 161 },
            { x: 222, y: 170 },
        ],
    },
    {
        id: "text-loop-note",
        type: "text",
        text: "Live Stroke Broadcast Loop",
        x: 275,
        y: 230,
        color: "#f59e0b",
    },
];

export default function HeroCanvasPreview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
    const [shapes, setShapes] = useState<Shape[]>(getInitialShapes);
    const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[] | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [cursorCoord, setCursorCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [hasDrawn, setHasDrawn] = useState(false);

    // Simulated Collaborator Cursors
    const [peerSarah, setPeerSarah] = useState({ x: 605, y: 125 });
    const [peerAlex, setPeerAlex] = useState({ x: 375, y: 105 });

    useEffect(() => {
        let t = 0;
        const interval = setInterval(() => {
            t += 0.04;
            setPeerSarah({
                x: 605 + Math.sin(t * 1.1) * 60 + Math.cos(t * 0.7) * 25,
                y: 125 + Math.cos(t * 1.3) * 40,
            });
            setPeerAlex({
                x: 375 + Math.cos(t * 0.9) * 55,
                y: 105 + Math.sin(t * 1.2) * 35,
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    // Canvas Rendering Loop (Recreation of Game.ts clearCanvas)
    const renderCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const isDark = document.documentElement.classList.contains("dark");
        const defaultStrokeColor = isDark ? "#ffffff" : "#18181b";
        const secondaryTextColor = isDark ? "#8a8f98" : "#71717a";

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw dot grid in canvas background
        const dotColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)";
        const DOT_SPACING = 24;
        ctx.fillStyle = dotColor;
        for (let x = 12; x < canvas.width; x += DOT_SPACING) {
            for (let y = 12; y < canvas.height; y += DOT_SPACING) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw Shapes from Game state
        shapes.forEach((shape) => {
            ctx.lineWidth = 2;
            ctx.strokeStyle = shape.color || defaultStrokeColor;
            ctx.fillStyle = shape.color || defaultStrokeColor;

            if (shape.type === "rect") {
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                ctx.beginPath();
                ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (shape.type === "pencil") {
                if (shape.points.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    ctx.stroke();
                }
            } else if (shape.type === "text") {
                ctx.font = "600 13px 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif";
                if (!shape.color) {
                    ctx.fillStyle = secondaryTextColor;
                    ctx.font = "400 11px 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif";
                }
                ctx.fillText(shape.text, shape.x, shape.y);
            }
        });

        // Draw active in-progress user stroke
        if (currentStroke && currentStroke.length > 1) {
            ctx.strokeStyle = "#00adb5";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
            for (let i = 1; i < currentStroke.length; i++) {
                ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
            }
            ctx.stroke();
        }

        // Draw active in-progress shape preview (rect or circle)
        if (dragStart && cursorCoord) {
            ctx.strokeStyle = "#00adb5";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            if (selectedTool === "rect") {
                const w = cursorCoord.x - dragStart.x;
                const h = cursorCoord.y - dragStart.y;
                ctx.strokeRect(dragStart.x, dragStart.y, w, h);
            } else if (selectedTool === "circle") {
                const w = cursorCoord.x - dragStart.x;
                const h = cursorCoord.y - dragStart.y;
                const radius = Math.max(Math.abs(w), Math.abs(h)) / 2;
                ctx.beginPath();
                ctx.arc(dragStart.x + w / 2, dragStart.y + h / 2, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }
    };

    // Re-render when shapes or drag state change
    useEffect(() => {
        renderCanvas();
    }, [shapes, currentStroke, dragStart, cursorCoord]);

    // Handle responsive canvas sizing & dark mode class toggle observer
    useEffect(() => {
        const updateSize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.clientWidth;
                canvas.height = Math.min(500, Math.max(380, window.innerHeight * 0.45));
                renderCanvas();
            }
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        // Observer to immediately re-render canvas on dark/light mode switch
        const observer = new MutationObserver(() => {
            renderCanvas();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            window.removeEventListener("resize", updateSize);
            observer.disconnect();
        };
    }, []);

    // Pointer Event Handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setDragStart({ x, y });
        setCursorCoord({ x, y });

        if (selectedTool === "pencil") {
            setCurrentStroke([{ x, y }]);
        } else if (selectedTool === "eraser") {
            eraseAt(x, y);
        } else if (selectedTool === "text") {
            const userText = prompt("Enter text for canvas:", "Realtime Idea");
            if (userText && userText.trim()) {
                setShapes((prev) => [
                    ...prev,
                    {
                        id: `text-${Date.now()}`,
                        type: "text",
                        text: userText.trim(),
                        x,
                        y,
                        color: "#00adb5",
                    },
                ]);
                setHasDrawn(true);
            }
            setDragStart(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCursorCoord({ x, y });

        if (selectedTool === "pencil" && currentStroke) {
            setCurrentStroke((prev) => (prev ? [...prev, { x, y }] : [{ x, y }]));
        } else if (selectedTool === "eraser" && e.buttons === 1) {
            eraseAt(x, y);
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragStart) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (selectedTool === "pencil" && currentStroke && currentStroke.length > 1) {
            setShapes((prev) => [
                ...prev,
                {
                    id: `pencil-${Date.now()}`,
                    type: "pencil",
                    points: currentStroke,
                    color: "#00adb5",
                },
            ]);
            setCurrentStroke(null);
            setHasDrawn(true);
        } else if (selectedTool === "rect") {
            const w = x - dragStart.x;
            const h = y - dragStart.y;
            if (Math.abs(w) > 5 && Math.abs(h) > 5) {
                setShapes((prev) => [
                    ...prev,
                    {
                        id: `rect-${Date.now()}`,
                        type: "rect",
                        x: w < 0 ? x : dragStart.x,
                        y: h < 0 ? y : dragStart.y,
                        width: Math.abs(w),
                        height: Math.abs(h),
                        color: "#00adb5",
                    },
                ]);
                setHasDrawn(true);
            }
        } else if (selectedTool === "circle") {
            const w = x - dragStart.x;
            const h = y - dragStart.y;
            const radius = Math.max(Math.abs(w), Math.abs(h)) / 2;
            if (radius > 5) {
                setShapes((prev) => [
                    ...prev,
                    {
                        id: `circle-${Date.now()}`,
                        type: "circle",
                        centerX: dragStart.x + w / 2,
                        centerY: dragStart.y + h / 2,
                        radius,
                        color: "#10b981",
                    },
                ]);
                setHasDrawn(true);
            }
        }

        setDragStart(null);
    };

    const eraseAt = (mx: number, my: number) => {
        const THRESHOLD = 20;
        setShapes((prev) =>
            prev.filter((shape) => {
                if (shape.type === "rect") {
                    const isInside =
                        mx >= shape.x - THRESHOLD &&
                        mx <= shape.x + shape.width + THRESHOLD &&
                        my >= shape.y - THRESHOLD &&
                        my <= shape.y + shape.height + THRESHOLD;
                    return !isInside;
                }
                if (shape.type === "circle") {
                    const dist = Math.hypot(mx - shape.centerX, my - shape.centerY);
                    return dist > shape.radius + THRESHOLD;
                }
                if (shape.type === "text") {
                    return Math.hypot(mx - shape.x, my - shape.y) > 30;
                }
                if (shape.type === "pencil") {
                    return !shape.points.some(
                        (p) => Math.hypot(mx - p.x, my - p.y) < THRESHOLD
                    );
                }
                return true;
            })
        );
        setHasDrawn(true);
    };

    const handleReset = () => {
        setShapes(getInitialShapes());
        setHasDrawn(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full select-none"
        >
            {/* Ambient Depth Glow behind studio frame */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-white/15 via-white-500/10 to-transparent rounded-2xl blur-xl opacity-80 -z-10" />

            {/* Canvas Container Frame (Architectural Studio Look) */}
            <div className="relative rounded-2xl border border-border-primary bg-bg-canvas shadow-xl overflow-hidden">
                {/* Header Window Bar */}
                <div className="h-10 border-b border-border-primary/80 bg-bg-secondary/90 backdrop-blur-md flex items-center justify-between px-3.5">
                    <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                        <span className="ml-2.5 text-xs font-mono text-text-secondary hidden sm:inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            sketchroom.live/canvas/arch-v1
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                        {hasDrawn && (
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-bg-primary hover:text-text-primary border border-border-primary transition-colors cursor-pointer"
                                title="Reset canvas to initial architecture demo"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                            </button>
                        )}
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-medium border border-cyan-500/20">
                            <Users className="w-3 h-3" />
                            <span>3 active</span>
                        </span>
                    </div>
                </div>

                {/* The REAL HTML5 Interactive Canvas Surface */}
                <div className="relative w-full h-[380px] sm:h-[460px] cursor-crosshair overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        className="block w-full h-full"
                    />

                    {/* Simulated Live Cursor: Sarah (Drawing) */}
                    <div
                        style={{
                            transform: `translate3d(${peerSarah.x}px, ${peerSarah.y}px, 0)`,
                            transition: "transform 80ms linear",
                        }}
                        className="absolute top-0 left-0 pointer-events-none z-30 flex flex-col items-start"
                    >
                        <svg className="w-4 h-4 text-emerald-500 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" />
                        </svg>
                        <span className="ml-2.5 -mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-sm whitespace-nowrap">
                            Sarah · Drawing
                        </span>
                    </div>

                    {/* Simulated Live Cursor: Alex (Reviewing) */}
                    <div
                        style={{
                            transform: `translate3d(${peerAlex.x}px, ${peerAlex.y}px, 0)`,
                            transition: "transform 90ms linear",
                        }}
                        className="absolute top-0 left-0 pointer-events-none z-30 flex flex-col items-start"
                    >
                        <svg className="w-4 h-4 text-cyan-500 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" />
                        </svg>
                        <span className="ml-2.5 -mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500 text-white shadow-sm whitespace-nowrap">
                            Alex · Reviewing
                        </span>
                    </div>

                    {/* Real Signature SketchRoom Bottom Toolbar (Identical to Canvas.tsx) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-neutral-900/90 dark:bg-neutral-950/90 px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                        <button
                            onClick={() => setSelectedTool("pencil")}
                            title="Freehand Pencil (P)"
                            className={`p-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                                selectedTool === "pencil"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm"
                                    : "bg-black/60 text-zinc-400 border-white/10 hover:text-white"
                            }`}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={() => setSelectedTool("rect")}
                            title="Rectangle (R)"
                            className={`p-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                                selectedTool === "rect"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm"
                                    : "bg-black/60 text-zinc-400 border-white/10 hover:text-white"
                            }`}
                        >
                            <RectangleHorizontalIcon className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={() => setSelectedTool("circle")}
                            title="Circle (C)"
                            className={`p-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                                selectedTool === "circle"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm"
                                    : "bg-black/60 text-zinc-400 border-white/10 hover:text-white"
                            }`}
                        >
                            <Circle className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={() => setSelectedTool("eraser")}
                            title="Eraser (E)"
                            className={`p-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                                selectedTool === "eraser"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm"
                                    : "bg-black/60 text-zinc-400 border-white/10 hover:text-white"
                            }`}
                        >
                            <Eraser className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={() => setSelectedTool("text")}
                            title="Text Tool (T)"
                            className={`p-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                                selectedTool === "text"
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm"
                                    : "bg-black/60 text-zinc-400 border-white/10 hover:text-white"
                            }`}
                        >
                            <Type className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-px h-4 bg-white/20 mx-0.5" />

                        <div className="text-[10px] text-zinc-400 font-medium px-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span className="hidden sm:inline">Draw live</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
