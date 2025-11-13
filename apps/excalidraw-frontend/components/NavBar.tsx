"use client";
import { Palette, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { Button } from "@repo/ui/button";
import Link from "next/link";

export function Navbar() {
    const [hasToken, setHasToken] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
        if (!stored) {
            const match = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            if (match) {
                document.documentElement.classList.add("dark");
                setIsDark(true);
            }
        }
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        root.classList.toggle("dark");
        const newTheme = root.classList.contains("dark") ? "dark" : "light";
        setIsDark(newTheme === "dark");
        localStorage.setItem("theme", newTheme);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setHasToken(true);
    });

    const handleSignOut = () => {
        localStorage.clear();
        setHasToken(false);
    };

    return (
        <nav className="fixed transition-colors duration-300 top-0 w-full bg-bg-primary/50 dark:bg-bg-primary/70 backdrop-blur-2xl border-b-2  border-border-primary z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link className="flex space-x-2 items-center" href="/">
                        <Logo />
                        <span className="text-text-primary font-semibold">
                            SketchRoom
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <button
                            onClick={toggleTheme}
                            className="text-text-primary hover:text-text-secondary transition-colors cursor-pointer"
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        <Link
                            href="/#features"
                            className="text-text-primary hover:text-clr-accent transition-colors"
                        >
                            Features
                        </Link>

                        <Link
                            href="/#how-it-works"
                            className="text-text-primary hover:text-clr-accent transition-colors"
                        >
                            How it works
                        </Link>

                        {hasToken ? (
                            <Link href={"/"}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                >
                                    Sign out
                                </Button>
                            </Link>
                        ) : (
                            <Link href={"/signin"}>
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                        <Link href={"/dashboard"}>
                            <Button variant="primary" size="sm">
                                Start Sketching
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
