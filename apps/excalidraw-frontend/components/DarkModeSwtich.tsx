"use client";
import React, { useId } from "react";

interface DarkModeSwitchProps {
    checked: boolean;
    onChange: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

/**
 * Cute Morphing Sun/Moon Toggle Button.
 * In Light Mode: Displays a round sun with radiating ticks around it.
 * In Dark Mode: Ticks scale down and central circle morphs in place into a crescent moon.
 */
const DarkModeSwtich: React.FC<DarkModeSwitchProps> = ({
    checked,
    onChange,
    className = "",
}) => {
    const maskId = useId();

    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative p-2 rounded-full text-zinc-700 hover:text-amber-500 dark:text-zinc-300 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 active:scale-90 cursor-pointer select-none flex items-center justify-center ${className}`}
            title={checked ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 transition-transform duration-500 ease-out"
                style={{
                    transform: checked ? "rotate(40deg)" : "rotate(90deg)",
                }}
            >
                <mask id={maskId}>
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    {/* Circle cutting into the sun to form the crescent moon in place */}
                    <circle
                        cx={checked ? "18" : "26"}
                        cy={checked ? "6" : "0"}
                        r="8"
                        fill="black"
                        className="transition-all duration-500 ease-out"
                    />
                </mask>

                {/* Central Round Sun / Crescent Moon Body */}
                <circle
                    cx="12"
                    cy="12"
                    r={checked ? "8.5" : "5"}
                    fill="currentColor"
                    mask={`url(#${maskId})`}
                    className="transition-all duration-500 ease-out"
                />

                {/* Radiating Ticks around the Sun (shrink & fade in Moon mode) */}
                <g
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`transition-all duration-300 origin-center ${
                        checked ? "opacity-0 scale-50" : "opacity-100 scale-100"
                    }`}
                >
                    <line x1="12" y1="1.5" x2="12" y2="3.5" />
                    <line x1="12" y1="20.5" x2="12" y2="22.5" />
                    <line x1="4.5" y1="4.5" x2="6" y2="6" />
                    <line x1="18" y1="18" x2="19.5" y2="19.5" />
                    <line x1="1.5" y1="12" x2="3.5" y2="12" />
                    <line x1="20.5" y1="12" x2="22.5" y2="12" />
                    <line x1="4.5" y1="19.5" x2="6" y2="18" />
                    <line x1="18" y1="6" x2="19.5" y2="4.5" />
                </g>
            </svg>
        </button>
    );
};

export default DarkModeSwtich;
