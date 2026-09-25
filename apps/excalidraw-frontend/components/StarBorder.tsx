"use client";
import React from "react";

interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    as?: any;
    className?: string;
    color?: string;
    speed?: string;
    size?: "sm" | "md";
    children?: React.ReactNode;
}

/**
 * StarBorder component from React Bits
 * An animated star-light border that orbits content with twinkle pulses.
 */
export function StarBorder({
    as: Component = "button",
    className = "",
    color = "#00adb5",
    speed = "3.5s",
    size = "md",
    children,
    ...rest
}: StarBorderProps) {
    const sizeClasses = {
        sm: "h-8 px-3 text-xs gap-1.5 rounded-[7px]",
        md: "h-9 px-3.5 sm:px-4 text-xs sm:text-[13px] gap-2 rounded-[11px]",
    };

    const outerRadius = size === "sm" ? "rounded-lg" : "rounded-xl";

    return (
        <Component
            className={`relative inline-flex items-center justify-center p-[1px] overflow-hidden ${outerRadius} active:scale-[0.97] transition-transform duration-150 ease-out select-none cursor-pointer ${className}`}
            {...rest}
        >
            <div
                className="absolute w-[300%] h-[50%] opacity-80 bottom-0 right-[-100%] rounded-full animate-star-bottom z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
                    animationDuration: speed,
                }}
            />
            <div
                className="absolute w-[300%] h-[50%] opacity-80 top-0 left-[-100%] rounded-full animate-star-top z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
                    animationDuration: speed,
                }}
            />
            <div
                className={`relative z-10 w-full flex items-center justify-center font-medium bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-sm transition-colors ${sizeClasses[size]}`}
            >
                {children}
            </div>
        </Component>
    );
}

export default StarBorder;
