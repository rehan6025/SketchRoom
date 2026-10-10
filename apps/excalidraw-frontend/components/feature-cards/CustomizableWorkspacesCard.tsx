"use client";

import React, { useState } from "react";
import {
    Pause,
    Square,
    Play,
    LayoutGrid,
    Palette,
    StickyNote,
    Layers,
} from "lucide-react";

export default function CustomizableWorkspacesCard() {
    const [timerRunning, setTimerRunning] = useState(true);

    return (
        <div className="group relative rounded-3xl border-2 border-dashed border-border-primary/80 bg-bg-secondary/40 hover:bg-bg-secondary/60 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between h-full">
            {/* Ambient Background Glow on hover */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            {/* Top Area: Floating "Widgets" Tray & Yellow Timer Modal */}
            <div className="relative z-10 w-full max-w-[270px] sm:max-w-[290px] mx-auto rounded-2xl border border-border-primary bg-bg-secondary/95 p-3 shadow-xl backdrop-blur-xl transition-transform duration-300 group-hover:-translate-y-1">
                {/* Header Tabs */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-primary/60">
                    <div className="flex items-center gap-1.5 text-[9px] font-medium text-text-secondary">
                        <span className="px-1.5 py-0.5 rounded text-text-secondary hover:text-text-primary">
                            Themes
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                            Widgets
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-text-secondary hover:text-text-primary">
                            Tasks View
                        </span>
                    </div>
                </div>

                {/* Timer Widget & Action Buttons Row */}
                <div className="flex items-center justify-between gap-2">
                    {/* Amber Floating Timer Pill (Matching reference: 04:21) */}
                    <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black flex items-center justify-between shadow-md shadow-amber-500/20">
                        <span className="text-xs font-bold font-mono tracking-tight">
                            04:21
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setTimerRunning(!timerRunning)}
                                className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center hover:bg-black/25 transition-colors"
                            >
                                {timerRunning ? (
                                    <Pause className="w-2.5 h-2.5 text-black fill-black" />
                                ) : (
                                    <Play className="w-2.5 h-2.5 text-black fill-black ml-0.5" />
                                )}
                            </button>
                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                <Square className="w-2 h-2 text-white fill-white" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Widget Launcher Tiles */}
                    <div className="flex items-center gap-1">
                        <div className="w-7 h-7 rounded-lg bg-bg-primary/80 border border-border-primary/60 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors shadow-xs">
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-bg-primary/80 border border-border-primary/60 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors shadow-xs">
                            <StickyNote className="w-3.5 h-3.5" />
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-bg-primary/80 border border-border-primary/60 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors shadow-xs">
                            <Layers className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Content Area: Centered Typography */}
            <div className="my-5 text-center">
                <h3 className="font-bold text-text-primary text-xl sm:text-2xl tracking-tight">
                    Customizable Workspaces
                </h3>
            </div>

            {/* Bottom Area: Modular Blueprint Wireframe Grid (Matching reference) */}
            <div className="relative w-full max-w-[280px] sm:max-w-[310px] mx-auto h-[125px] rounded-xl border border-border-primary/70 bg-bg-primary/60 p-2 grid grid-cols-3 grid-rows-2 gap-1.5 transition-transform duration-300 group-hover:scale-[1.01]">
                {/* Main Canvas View Pane (Spans 2 cols, 2 rows) */}
                <div className="col-span-2 row-span-2 rounded-lg border border-border-primary/50 bg-bg-secondary/80 p-2 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between text-[8px] font-mono text-text-secondary">
                        <span>Infinite Canvas</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center py-1">
                        <span className="text-[9px] font-semibold text-text-primary/80 tracking-tight">
                            Modular Board
                        </span>
                    </div>
                    <div className="flex gap-1 text-[7px] font-mono text-cyan-600 dark:text-cyan-400">
                        <span>100% Vector</span>
                        <span>•</span>
                        <span>Auto-snap</span>
                    </div>
                </div>

                {/* Secondary Tool Dock Pane */}
                <div className="col-span-1 row-span-1 rounded-lg border border-border-primary/50 bg-bg-secondary/60 p-1.5 flex flex-col justify-center items-center text-[8px] font-medium text-text-secondary">
                    <Palette className="w-3 h-3 text-cyan-500 mb-0.5" />
                    <span>Presets</span>
                </div>

                {/* Secondary Notes Pane */}
                <div className="col-span-1 row-span-1 rounded-lg border border-border-primary/50 bg-bg-secondary/60 p-1.5 flex flex-col justify-center items-center text-[8px] font-medium text-text-secondary">
                    <StickyNote className="w-3 h-3 text-amber-500 mb-0.5" />
                    <span>Stickies</span>
                </div>
            </div>
        </div>
    );
}
