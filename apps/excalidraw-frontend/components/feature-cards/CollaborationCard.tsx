"use client";

import React from "react";
import { Users, UserPlus, Search, Folder, Check, MousePointer2 } from "lucide-react";

/**
 * CollaborationCard - Tactile Layered Feature Showcase
 * Directly mirrors the layered workspace & team modal aesthetic from the reference design.
 */
export default function CollaborationCard() {
    return (
        <div className="group relative rounded-3xl border border-border-primary bg-bg-secondary/60 hover:bg-bg-secondary/80 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between h-full">
            {/* Ambient Background Glow on hover */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-cyan-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            {/* Top Visual Area: Layered Tactile UI Mockups */}
            <div className="relative h-[280px] sm:h-[300px] w-full rounded-2xl bg-bg-primary/50 border border-border-primary/60 p-4 overflow-hidden flex items-center justify-center select-none">
                {/* Subtle Dot Grid Canvas Backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(var(--border-primary)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                {/* Layer 1: Background "MY WORKSPACE" Card (Tucked Upper-Left) */}
                <div className="absolute left-3 sm:left-5 top-5 sm:top-6 w-[210px] sm:w-[230px] rounded-2xl border border-border-primary/80 bg-bg-secondary/90 p-3.5 shadow-md backdrop-blur-md transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border-primary/60">
                        <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">
                            MY WORKSPACE
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] text-text-secondary">
                            <span className="text-cyan-500">📁</span>
                            <span className="truncate">Branding and Identity</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 shadow-xs">
                            <span>🎨</span>
                            <span className="truncate">Marketing Team</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] text-text-secondary">
                            <span>🚀</span>
                            <span className="truncate">Product Launch</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] text-text-secondary">
                            <span>💡</span>
                            <span className="truncate">Team Brainstorm</span>
                        </div>
                    </div>
                </div>

                {/* Layer 2: Foreground Elevated "Marketing Team" Modal (Offset Lower-Right) */}
                <div className="absolute right-3 sm:right-5 bottom-4 sm:bottom-5 w-[240px] sm:w-[260px] rounded-2xl border border-border-primary bg-bg-secondary/95 p-3.5 shadow-2xl backdrop-blur-xl transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-0.5 z-10">
                    {/* Header with Title, Members Badge and Search */}
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border-primary/60">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-text-primary tracking-tight">
                                Marketing Team
                            </span>
                            <span className="text-[9px] font-medium text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                Members 2
                            </span>
                        </div>
                        <Search className="w-3.5 h-3.5 text-text-secondary/70" />
                    </div>

                    {/* Invite Button Input */}
                    <button
                        type="button"
                        className="w-full mb-2.5 py-1 px-2 rounded-lg border border-dashed border-border-primary/80 bg-bg-primary/50 text-[10px] font-medium text-text-secondary hover:text-text-primary flex items-center justify-center gap-1 transition-colors"
                    >
                        <UserPlus className="w-3 h-3 text-cyan-500" />
                        <span>+ Invite members</span>
                    </button>

                    {/* Active Collaborator Rows */}
                    <div className="space-y-2">
                        {/* Member 1: Amanda Peterson */}
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-bg-primary/70 border border-border-primary/40">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                        AP
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-bg-secondary" />
                                </div>
                                <span className="text-[11px] font-semibold text-text-primary">
                                    Amanda Peterson
                                </span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                Editor
                            </span>
                        </div>

                        {/* Member 2: Jane Fox */}
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-bg-primary/70 border border-border-primary/40">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                        JF
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-bg-secondary" />
                                </div>
                                <span className="text-[11px] font-semibold text-text-primary">
                                    Jane Fox
                                </span>
                            </div>
                            <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-medium">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Layer 3: Playful Floating Live Cursor Element */}
                <div className="absolute top-10 right-10 sm:right-16 z-20 pointer-events-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    <div className="flex items-center gap-1">
                        <MousePointer2 className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500 drop-shadow-md" />
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-500 text-white shadow-xs whitespace-nowrap">
                            Alex
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Content Area: Typography matching reference image */}
            <div className="mt-6 text-center">
                <h3 className="font-bold text-text-primary text-xl sm:text-2xl tracking-tight mb-2">
                    Seamless Collaboration
                </h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal max-w-sm mx-auto">
                    Work together with your team effortlessly, share live canvas rooms, and update strokes in real-time.
                </p>
            </div>
        </div>
    );
}
