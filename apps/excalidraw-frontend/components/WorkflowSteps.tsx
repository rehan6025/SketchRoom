"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Zap,
    Users,
    Pencil,
    Sparkles,
} from "lucide-react";

interface StepCardProps {
    number: string;
    titleLine1: string;
    titleLine2: string;
    tag: string;
    gradientClass: string;
    accentGlow: string;
    elevated?: boolean;
    icon: React.ReactNode;
    isVisible: boolean;
    delayClass: string;
}

function StepCard({
    number,
    titleLine1,
    titleLine2,
    tag,
    gradientClass,
    accentGlow,
    elevated = false,
    icon,
    isVisible,
    delayClass,
}: StepCardProps) {
    return (
        <div
            className={`group relative rounded-[32px] border border-border-primary bg-bg-secondary/70 hover:bg-bg-secondary/95 p-6 shadow-sm hover:shadow-2xl transition-all duration-700 ease-out backdrop-blur-xl overflow-hidden flex flex-col justify-between h-[380px] sm:h-[410px] selection:bg-white/20 selection:text-white ${delayClass} ${
                isVisible
                    ? `opacity-100 translate-y-0 ${elevated ? "md:-translate-y-8" : ""}`
                    : "opacity-0 translate-y-16"
            }`}
        >
            {/* Ambient Accent Glow on hover */}
            <div
                className={`absolute -top-24 -right-24 w-56 h-56 ${accentGlow} rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            {/* Top Area: Clean, Punchy 2-Line Title (Matching Video Frame 17) */}
            <div className="relative z-10 pt-2">
                <h3 className="font-bold text-text-primary text-xl sm:text-2xl tracking-tight leading-snug">
                    <span>{titleLine1}</span>
                    <br />
                    <span>{titleLine2}</span>
                </h3>
            </div>

            {/* Bottom Area: Solid Vibrant Block with Badge, Icon, Big Number & Arrow (Matching Video) */}
            <div
                className={`relative z-10 rounded-2xl ${gradientClass} p-5 text-white shadow-xl flex flex-col justify-between h-[210px] overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]`}
            >
                {/* Subtle Radial Mesh Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:12px_12px] opacity-25" />

                {/* Top Row inside block: Frosted Tag Pill + Floating Icon */}
                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white/95 border border-white/15 shadow-xs">
                        {tag}
                    </span>

                    {/* Floating micro-badge icon */}
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        {icon}
                    </div>
                </div>

                {/* Bottom Row inside block: Massive Bold Number + Circular Arrow Button */}
                <div className="relative z-10 flex items-end justify-between pt-4">
                    <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white drop-shadow-sm select-none">
                        {number}
                    </span>

                    {/* Circular Action Arrow Pill */}
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all duration-300 group-hover:translate-x-1.5 group-hover:bg-white/95 cursor-pointer">
                        <ArrowRight className="w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WorkflowSteps() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Triggers immediately as soon as the section starts coming into view
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="how-it-works"
            className="relative z-10 py-24 sm:py-32 bg-bg-primary transition-colors duration-300 border-t border-border-primary/40 scroll-mt-24 sm:scroll-mt-28 overflow-hidden"
        >
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-pink-500/10 to-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header with Floating Candy Badges (Matching Video Frames 14 - 15) */}
                <div
                    className={`relative text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ease-out ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                    {/* Floating Badge Left (Purple capsule with lightning icon) */}
                    <div className="hidden md:flex absolute -left-20 -top-4 items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/25 border border-white/20 -rotate-6 select-none pointer-events-none transition-transform hover:scale-105">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span className="text-[11px] font-bold tracking-tight">18ms Sync</span>
                    </div>

                    {/* Floating Badge Right (Yellow capsule with pencil icon) */}
                    <div className="hidden md:flex absolute -right-20 -top-4 items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xl shadow-amber-500/25 border border-white/30 rotate-6 select-none pointer-events-none transition-transform hover:scale-105">
                        <Pencil className="w-3.5 h-3.5 fill-black" />
                        <span className="text-[11px] font-bold tracking-tight">Zero Setup</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
                        How it Works
                    </h2>
                </div>

                {/* Staggered 3-Step Cards Grid (Arch Layout matching Video Frame 17) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end">
                    {/* Step 01: Amber / Coral Block */}
                    <StepCard
                        number="01"
                        titleLine1="Spawn a Canvas"
                        titleLine2="Room in Seconds"
                        tag="Instant Access"
                        gradientClass="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
                        accentGlow="bg-amber-500/10"
                        icon={<Zap className="w-4 h-4 text-white fill-white/20" />}
                        isVisible={isVisible}
                        delayClass="delay-100"
                    />

                    {/* Step 02: Pink / Rose Block (Elevated Center Card) */}
                    <StepCard
                        number="02"
                        titleLine1="Invite & Sync"
                        titleLine2="with Your Team"
                        tag="WebSocket Native"
                        gradientClass="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600"
                        accentGlow="bg-pink-500/10"
                        elevated={true}
                        icon={<Users className="w-4 h-4 text-white fill-white/20" />}
                        isVisible={isVisible}
                        delayClass="delay-200"
                    />

                    {/* Step 03: Purple / Violet Block (Accurately reflecting real app features: Pencil, Shapes, Text) */}
                    <StepCard
                        number="03"
                        titleLine1="Pencil, Shapes"
                        titleLine2="& Live Notes"
                        tag="Pencil • Shapes • Text"
                        gradientClass="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600"
                        accentGlow="bg-violet-500/10"
                        icon={<Pencil className="w-4 h-4 text-white fill-white/20" />}
                        isVisible={isVisible}
                        delayClass="delay-300"
                    />
                </div>
            </div>
        </section>
    );
}
