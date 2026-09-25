"use client";
import React from "react";

export function ShinyText({
    text,
    className = "",
}: {
    text: string;
    className?: string;
}) {
    return (
        <span className={`relative inline-block font-medium ${className}`}>
            {/* Base crisp high-contrast visible text layer */}
            <span className="text-text-primary">
                {text}
            </span>
            {/* Shimmer specular sweep overlay matching wave colors */}
            <span
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none select-none animate-shine"
                style={{
                    backgroundImage:
                        "linear-gradient(110deg, transparent 20%, #5227FF 38%, #FF9FFC 50%, #00adb5 62%, transparent 80%)",
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                }}
            >
                {text}
            </span>
        </span>
    );
}
