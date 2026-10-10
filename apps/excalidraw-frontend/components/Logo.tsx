"use client";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-8 h-8 rounded-xl",
    lg: "w-10 h-10 rounded-xl",
    xl: "w-16 h-16 rounded-2xl",
};

const svgSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-10 h-10",
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
    return (
        <div
            className={`logo-container relative flex items-center justify-center shrink-0 bg-white border border-zinc-200/90 dark:border-white/20 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${sizeClasses[size]} ${className}`}
        >
            <style>{`
                .logo-draw-stroke {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 0;
                }
                .logo-stylus-node {
                    transform-origin: 22.5px 8.5px;
                }
                .logo-terminal-node {
                    transform-origin: 9.5px 28.5px;
                }
                @media (hover: hover) and (pointer: fine) {
                    .logo-container:hover .logo-draw-stroke {
                        animation: drawLogoS 1.2s cubic-bezier(0.25, 1, 0.35, 1) forwards;
                    }
                    .logo-container:hover .logo-stylus-node {
                        animation: pulseLogoStylus 1.2s cubic-bezier(0.25, 1, 0.35, 1) forwards;
                    }
                    .logo-container:hover .logo-terminal-node {
                        animation: fadeLogoTerminal 1.2s cubic-bezier(0.25, 1, 0.35, 1) forwards;
                    }
                }
                @keyframes drawLogoS {
                    0% {
                        stroke-dashoffset: 100;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                @keyframes pulseLogoStylus {
                    0% {
                        transform: scale(0.6);
                        opacity: 0.4;
                    }
                    25% {
                        transform: scale(1.25);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @keyframes fadeLogoTerminal {
                    0%, 70% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .logo-draw-stroke,
                    .logo-stylus-node,
                    .logo-terminal-node {
                        animation: none !important;
                    }
                }
            `}</style>

            <svg
                className={`${svgSizeClasses[size]}`}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* Master continuous black S stroke */}
                <path
                    className="logo-draw-stroke"
                    pathLength="100"
                    d="M 22.5 8.5 C 19.5 5.5 13 5.5 10 8.5 C 7 11.5 7.5 15 12 17 L 20 20 C 24.5 22 25 25.5 22 28.5 C 19 31.5 12.5 31.5 9.5 28.5"
                    stroke="#09090b"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Stylus drafting tip at origin (Black nib with white center) */}
                <g className="logo-stylus-node">
                    <circle cx="22.5" cy="8.5" r="1.9" fill="#09090b" />
                    <circle cx="22.5" cy="8.5" r="0.8" fill="#ffffff" />
                </g>

                {/* Terminal anchor node */}
                <circle
                    className="logo-terminal-node"
                    cx="9.5"
                    cy="28.5"
                    r="1.4"
                    fill="#09090b"
                />
            </svg>
        </div>
    );
}
