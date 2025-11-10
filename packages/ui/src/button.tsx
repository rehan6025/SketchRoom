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
    lg: "px-8 py-4 text-lg",
    sm: "px-4 py-2 text-base",
};

const variantClasses = {
    primary:
        " bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer hover:border-accent-hover ",
    secondary:
        " bg-accent  text-text-primary  rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300",
    outline:
        "border-2 bg-secondary border-accent hover:border-accent-hover cursor-pointer hover:text-accent-hover text-accent rounded-lg font-semibold transform transition-all duration-300 flex items-center justify-center space-x-2",
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
