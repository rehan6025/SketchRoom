"use client";

import { ReactNode } from "react";

interface ButtonProps {
    variant: "primary" | "outline" | "secondary";
    className?: string;
    onClick?: () => void;
    size: "lg" | "sm";
    children: ReactNode;
}

const sizeClasses = {
    lg: "h-9 px-4 text-xs sm:text-sm font-medium",
    sm: "h-8 px-3 text-xs font-medium",
};

const variantClasses = {
    primary:
        " bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white rounded-xl shadow-sm hover:shadow-cyan-500/20 active:scale-[0.97] transition-all duration-150 ease-out cursor-pointer select-none font-medium inline-flex items-center justify-center ",
    secondary:
        " bg-bg-secondary text-text-primary border border-border-primary rounded-xl font-medium shadow-sm hover:bg-bg-primary active:scale-[0.97] transition-all duration-150 ease-out cursor-pointer select-none inline-flex items-center justify-center ",
    outline:
        " border border-border-primary bg-bg-secondary/70 hover:bg-bg-primary text-text-primary hover:text-accent rounded-xl font-medium active:scale-[0.97] transition-all duration-150 ease-out cursor-pointer select-none inline-flex items-center justify-center space-x-1.5 backdrop-blur-sm ",
};

export const Button = ({
    variant,
    children,
    onClick,
    className,
    size,
}: ButtonProps) => {
    return (
        <button
            className={`${sizeClasses[size]}  ${variantClasses[variant]} ${className || ""}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
