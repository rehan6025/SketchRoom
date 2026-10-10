"use client";

import React from "react";
import {
    ChevronsRight,
    MessageSquare,
    Paperclip,
    Plus,
} from "lucide-react";

/**
 * TaskTrackingCard - Tactile Layered Feature Showcase
 * Directly mirrors Card 3 (Bottom-Left: "Advanced task tracking")
 * with Left Column (>> Badge + Typography) and Right Column (Timeline + Kanban Mockups).
 */
export default function TaskTrackingCard() {
    return (
        <div className="group relative rounded-3xl border border-border-primary bg-bg-secondary/60 hover:bg-bg-secondary/80 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 h-full">
            {/* Ambient Background Glow on hover */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            {/* Left Column: Icon Badge + Typography */}
            <div className="flex flex-col justify-between items-start h-full md:max-w-[210px] shrink-0 text-left w-full md:w-auto">
                {/* Floating Orange >> Icon Badge */}
                <div className="mb-4 md:mb-0 transition-transform duration-300 group-hover:scale-105">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 border border-white/20">
                        <ChevronsRight className="w-6 h-6 text-white drop-shadow-xs" />
                    </div>
                </div>

                <div className="mt-auto pt-4 md:pt-0">
                    <h3 className="font-bold text-text-primary text-xl sm:text-2xl tracking-tight mb-2">
                        Advanced task tracking
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-normal">
                        A bird&apos;s eye view of your entire behaviour and productivity.
                    </p>
                </div>
            </div>

            {/* Right Column: Layered Timeline & Kanban Mockup */}
            <div className="relative h-[280px] sm:h-[300px] w-full flex-1 rounded-2xl bg-bg-primary/50 border border-border-primary/60 p-3 sm:p-4 overflow-hidden select-none">
                {/* Subtle Dot Grid Backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(var(--border-primary)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                {/* Layer 1: Background "Project timeline" Card (Shifted Upper-Right) */}
                <div className="absolute right-2 sm:right-4 top-2 sm:top-3 w-[220px] sm:w-[250px] rounded-2xl border border-border-primary/80 bg-bg-secondary/90 p-3 shadow-md backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-text-primary">
                            Project timeline
                        </span>
                        {/* Avatar stack */}
                        <div className="flex items-center -space-x-1.5">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-bg-secondary">
                                A
                            </div>
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-bg-secondary">
                                R
                            </div>
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-bg-secondary">
                                S
                            </div>
                        </div>
                    </div>

                    {/* Timeline Ruler */}
                    <div className="flex justify-between text-[8px] font-mono text-text-secondary/70 border-b border-border-primary/60 pb-1 mb-1.5 px-1">
                        <span>11:00</span>
                        <span>11:30</span>
                        <span>12:00</span>
                        <span>12:30</span>
                    </div>

                    {/* Timeline Bars */}
                    <div className="space-y-1.5">
                        <div className="ml-2 w-[75%] p-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-medium flex items-center justify-between shadow-xs">
                            <span className="truncate">New ideas for the campaign</span>
                            <span className="text-[7px] opacity-80">90%</span>
                        </div>
                        <div className="ml-6 w-[65%] p-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[8px] font-medium flex items-center justify-between shadow-xs">
                            <span className="truncate">Brainstorm session</span>
                            <span className="text-[7px] opacity-80">45%</span>
                        </div>
                    </div>
                </div>

                {/* Layer 2: Foreground Elevated "Tasks" Kanban Board (Shifted Lower-Left) */}
                <div className="absolute left-2 sm:left-4 bottom-2 sm:bottom-3 w-[250px] sm:w-[280px] rounded-2xl border border-border-primary bg-bg-secondary/95 p-3 shadow-xl backdrop-blur-xl z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-0.5">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border-primary/60">
                        <span className="text-xs font-bold text-text-primary">
                            Tasks
                        </span>
                        <span className="text-[9px] font-mono text-text-secondary">
                            Sprint #4
                        </span>
                    </div>

                    {/* Kanban Columns */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Column 1: To do */}
                        <div>
                            <div className="flex items-center justify-between text-[9px] font-semibold text-text-secondary mb-1.5">
                                <span className="flex items-center gap-1">
                                    <span>To do</span>
                                    <span className="w-3.5 h-3.5 rounded-full bg-bg-primary text-text-primary text-[8px] flex items-center justify-center font-mono">
                                        4
                                    </span>
                                </span>
                                <Plus className="w-3 h-3 text-text-secondary/70" />
                            </div>

                            {/* Task Card 1 */}
                            <div className="p-1.5 rounded-xl bg-bg-primary/80 border border-border-primary/60 shadow-xs space-y-1">
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-[7px] font-medium px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                        Feedback
                                    </span>
                                </div>
                                <div className="text-[9px] font-semibold text-text-primary leading-tight truncate">
                                    New ideas for campaign
                                </div>
                                <div className="flex items-center justify-between text-[8px] text-text-secondary pt-0.5 border-t border-border-primary/40 font-mono">
                                    <span>15 Sep</span>
                                    <div className="flex items-center gap-0.5">
                                        <MessageSquare className="w-2.5 h-2.5" />
                                        <span>3</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: In progress */}
                        <div>
                            <div className="flex items-center justify-between text-[9px] font-semibold text-text-secondary mb-1.5">
                                <span className="flex items-center gap-1">
                                    <span>In prog.</span>
                                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[8px] flex items-center justify-center font-mono font-bold">
                                        2
                                    </span>
                                </span>
                                <Plus className="w-3 h-3 text-text-secondary/70" />
                            </div>

                            {/* Task Card 2 */}
                            <div className="p-1.5 rounded-xl bg-bg-primary/80 border border-border-primary/60 shadow-xs space-y-1">
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-[7px] font-medium px-1 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        Sales
                                    </span>
                                </div>
                                <div className="text-[9px] font-semibold text-text-primary leading-tight truncate">
                                    New Brandbook
                                </div>
                                <div className="flex items-center justify-between text-[8px] text-text-secondary pt-0.5 border-t border-border-primary/40 font-mono">
                                    <span>21 Sep</span>
                                    <div className="flex items-center gap-0.5">
                                        <Paperclip className="w-2.5 h-2.5" />
                                        <span>1</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
