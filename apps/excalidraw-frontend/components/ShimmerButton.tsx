"use client";

import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
}

/**
 * ShimmerButton from React Bits
 * A sleek button with a continuous animated gradient beam orbiting the border,
 * paired with a deep obsidian glass surface and neon backlight glow.
 */
export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
    children,
    shimmerColor = "#00adb5",
    shimmerSize = "0.08em",
    borderRadius = "12px",
    shimmerDuration = "3s",
    background = "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(0, 173, 181, 0.25), rgba(18, 15, 23, 0.98))",
    className = "",
    ...props
}) => {
    return (
        <button
            style={
                {
                    "--spread": "90deg",
                    "--shimmer-color": shimmerColor,
                    "--radius": borderRadius,
                    "--speed": shimmerDuration,
                    "--cut": shimmerSize,
                    "--bg": background,
                } as React.CSSProperties
            }
            className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-5 py-2.5 text-sm font-medium text-white [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/40 active:scale-[0.98] shadow-[0_0_20px_-6px_rgba(0,173,181,0.35)] hover:shadow-[0_0_25px_2px_rgba(0,173,181,0.45)] select-none ${className}`}
            {...props}
        >
            {/* Spark container / orbiting conic gradient */}
            <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
                <div
                    className="absolute inset-0 h-[100cqh] [aspect-ratio:1]"
                    style={{ animation: `spin-shimmer ${shimmerDuration} linear infinite` }}
                >
                    <div className="[background:conic-gradient(from_0deg,transparent_0_340deg,var(--shimmer-color)_360deg)] absolute -inset-full w-auto rotate-0" />
                </div>
            </div>

            {/* Subtle inner highlight */}
            <div className="absolute inset-px rounded-[calc(var(--radius)-1px)] bg-zinc-950/80 -z-20 backdrop-blur-md transition-colors group-hover:bg-zinc-900/70" />

            {/* Surface content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
};

export default ShimmerButton;
