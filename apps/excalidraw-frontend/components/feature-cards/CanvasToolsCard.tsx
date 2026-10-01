"use client";

import React, { useState } from "react";
import { Video, Calendar, Clock, CheckCircle2 } from "lucide-react";

/**
 * CanvasToolsCard - Tactile Layered Feature Showcase
 * Directly mirrors the 3-panel layout (Activity Bars, Schedule Agenda, Donut Workload)
 * from the reference design.
 */
export default function CanvasToolsCard() {
    const [activeTab, setActiveTab] = useState<"weekly" | "daily">("weekly");

    return (
        <div className="group relative rounded-3xl border border-border-primary bg-bg-secondary/60 hover:bg-bg-secondary/80 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between h-full">
            {/* Ambient Background Glow on hover */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-cyan-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            {/* Top Visual Area: 3-Module Side-by-Side Composition from reference */}
            <div className="relative h-[280px] sm:h-[300px] w-full rounded-2xl bg-bg-primary/50 border border-border-primary/60 p-3 sm:p-4 overflow-hidden flex items-center justify-center gap-2 sm:gap-3 select-none">
                {/* Subtle Dot Grid Backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(var(--border-primary)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                {/* Module 1 (Left): Activity Bar Chart Card */}
                <div className="w-[88px] sm:w-[100px] h-[190px] sm:h-[210px] rounded-2xl border border-border-primary/80 bg-bg-secondary/90 p-2.5 shadow-md backdrop-blur-md flex flex-col justify-between transition-transform duration-300 group-hover:-translate-y-1 shrink-0">
                    {/* Header Tabs */}
                    <div className="flex items-center justify-center p-0.5 rounded-lg bg-bg-primary/80 border border-border-primary/60 text-[9px] font-medium text-text-secondary">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold">
                            weekly
                        </span>
                        <span className="px-1 text-text-secondary/70">daily</span>
                    </div>

                    {/* 3 Vertical Bars */}
                    <div className="flex items-end justify-between px-1 h-24 gap-1.5">
                        <div className="flex flex-col items-center gap-1 w-full h-full justify-end">
                            <span className="text-[8px] font-mono text-text-secondary">8:00</span>
                            <div className="w-full bg-cyan-500/30 rounded-t-md h-[45%] transition-all group-hover:h-[55%]" />
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full h-full justify-end">
                            <span className="text-[8px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">8:30</span>
                            <div className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md h-[85%] shadow-xs" />
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full h-full justify-end">
                            <span className="text-[8px] font-mono text-text-secondary">9:00</span>
                            <div className="w-full bg-cyan-500/40 rounded-t-md h-[60%] transition-all group-hover:h-[70%]" />
                        </div>
                    </div>

                    {/* Day Labels */}
                    <div className="flex items-center justify-between text-[9px] text-text-secondary font-medium px-1 pt-1 border-t border-border-primary/50">
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                    </div>
                </div>

                {/* Module 2 (Center, Elevated): Weekly Meetings / Schedule Card */}
                <div className="w-[160px] sm:w-[185px] h-[225px] sm:h-[245px] rounded-2xl border border-border-primary bg-bg-secondary/95 p-3 shadow-xl backdrop-blur-xl flex flex-col justify-between z-10 transition-transform duration-300 group-hover:scale-[1.02] shrink-0">
                    <div>
                        <div className="text-[9px] text-text-secondary font-medium tracking-tight">
                            Your weekly meetings
                        </div>
                        <div className="text-xs font-bold text-text-primary tracking-tight mb-2">
                            Weekly schedule
                        </div>

                        {/* Schedule Items List */}
                        <div className="space-y-1.5">
                            {/* Day 15 */}
                            <div className="p-1.5 rounded-xl bg-bg-primary/80 border border-border-primary/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                                        15
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-semibold text-text-primary leading-tight truncate w-18">
                                            Marketing sync
                                        </span>
                                        <span className="text-[8px] font-mono text-text-secondary">
                                            10:00 - 10:45
                                        </span>
                                    </div>
                                </div>
                                <Video className="w-3 h-3 text-cyan-500 shrink-0" />
                            </div>

                            {/* Day 16 */}
                            <div className="p-1.5 rounded-xl bg-bg-primary/80 border border-border-primary/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                        16
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-semibold text-text-primary leading-tight truncate w-18">
                                            Design review
                                        </span>
                                        <span className="text-[8px] font-mono text-text-secondary">
                                            12:00 - 13:00
                                        </span>
                                    </div>
                                </div>
                                <Video className="w-3 h-3 text-emerald-500 shrink-0" />
                            </div>

                            {/* Day 17 */}
                            <div className="p-1.5 rounded-xl bg-bg-primary/80 border border-border-primary/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
                                        17
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-semibold text-text-primary leading-tight truncate w-18">
                                            Client signoff
                                        </span>
                                        <span className="text-[8px] font-mono text-text-secondary">
                                            15:00 - 15:30
                                        </span>
                                    </div>
                                </div>
                                <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-1.5 border-t border-border-primary/50 flex items-center justify-between text-[9px] text-text-secondary font-mono">
                        <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-cyan-500" />
                            <span>Auto-remind</span>
                        </span>
                        <span className="text-emerald-500 font-semibold">Synced</span>
                    </div>
                </div>

                {/* Module 3 (Right): Donut Chart Workload Card */}
                <div className="w-[88px] sm:w-[100px] h-[190px] sm:h-[210px] rounded-2xl border border-border-primary/80 bg-bg-secondary/90 p-2.5 shadow-md backdrop-blur-md flex flex-col items-center justify-between transition-transform duration-300 group-hover:-translate-y-1 shrink-0">
                    <span className="text-[10px] font-semibold text-text-primary text-center">
                        Team workload
                    </span>

                    {/* Circular Radial Donut Ring */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-auto">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Track */}
                            <circle
                                cx="18"
                                cy="18"
                                r="14"
                                className="text-border-primary stroke-current"
                                strokeWidth="3.5"
                                fill="none"
                            />
                            {/* Progress Arc (75%) */}
                            <circle
                                cx="18"
                                cy="18"
                                r="14"
                                className="text-amber-500 stroke-current drop-shadow-xs"
                                strokeWidth="3.5"
                                strokeDasharray="66 22"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[11px] font-bold text-text-primary font-mono">
                                75%
                            </span>
                        </div>
                    </div>

                    <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        Balanced
                    </span>
                </div>
            </div>

            {/* Bottom Content Area: Typography matching reference image */}
            <div className="mt-6 text-center">
                <h3 className="font-bold text-text-primary text-xl sm:text-2xl tracking-tight mb-2">
                    Time Management Tools
                </h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal max-w-sm mx-auto">
                    Optimize your time with integrated tools like timers, reminders, and schedules.
                </p>
            </div>
        </div>
    );
}
