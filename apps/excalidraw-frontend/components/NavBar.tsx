"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import DarkModeSwtich from "./DarkModeSwtich";
import { BackendStatusButton } from "./BackendStatusButton";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [hasToken, setHasToken] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        } else if (!stored) {
            const match = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            if (match) {
                document.documentElement.classList.add("dark");
                setIsDark(true);
            }
        }
    }, []);

    const toggleTheme = (e?: React.MouseEvent) => {
        const root = document.documentElement;

        const applyTheme = () => {
            root.classList.toggle("dark");
            const newTheme = root.classList.contains("dark") ? "dark" : "light";
            setIsDark(newTheme === "dark");
            localStorage.setItem("theme", newTheme);
        };

        // If View Transitions API is not supported or no mouse event, toggle directly
        if (!document.startViewTransition || !e) {
            applyTheme();
            return;
        }

        const x = e.clientX;
        const y = e.clientY;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            applyTheme();
        });

        transition.ready.then(() => {
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            );
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setHasToken(true);
    }, []);

    const handleSignOut = () => {
        localStorage.clear();
        setHasToken(false);
    };

    return (
        <header className="fixed top-3.5 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
            <nav className={`pointer-events-auto w-full max-w-4xl transition-all duration-300 backdrop-blur-md backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] px-3 sm:px-3.5 py-1.5 sm:py-2 ${
                mobileMenuOpen
                    ? "rounded-2xl bg-white/75 dark:bg-[#08080c]/80 border border-black/10 dark:border-white/15"
                    : "rounded-full bg-white/60 dark:bg-[#08080c]/65 border border-black/10 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
            }`}>
                <div className="flex items-center justify-between">
                    {/* Left: Brand Logo & Title */}
                    <Link className="flex space-x-2.5 items-center pl-1 sm:pl-2 group" href="/">
                        <Logo />
                        <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
                            SketchRoom
                        </span>
                    </Link>

                    {/* Middle: Clean Nav Links */}
                    <div className="hidden md:flex items-center space-x-7 text-sm font-medium">
                        <Link
                            href="/#features"
                            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Features
                        </Link>

                        <Link
                            href="/#how-it-works"
                            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            How it works
                        </Link>

                        {hasToken ? (
                            <button
                                onClick={handleSignOut}
                                className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Sign out
                            </button>
                        ) : (
                            <Link
                                href="/signin"
                                className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Right: Backend Status, Theme Toggle & Inverted High-Contrast Pill CTA */}
                    <div className="hidden md:flex items-center space-x-3">
                        <BackendStatusButton />
                        <DarkModeSwtich
                            checked={isDark}
                            onChange={toggleTheme}
                        />

                        <Link href="/dashboard">
                            <button className="h-9 sm:h-10 px-4 sm:px-5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-sm hover:shadow-md bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 flex items-center justify-center">
                                Start Sketching
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center md:hidden space-x-2">
                        <DarkModeSwtich
                            checked={isDark}
                            onChange={toggleTheme}
                        />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-3 pt-3 pb-3 border-t border-black/5 dark:border-white/10 px-1 space-y-2">
                        <Link
                            href="/#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            Features
                        </Link>
                        <Link
                            href="/#how-it-works"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            How it works
                        </Link>
                        <div className="pt-2 flex flex-col gap-2">
                            <div className="pb-1">
                                <BackendStatusButton />
                            </div>
                            {hasToken ? (
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-2 rounded-full text-sm font-medium text-center border border-black/10 dark:border-white/15 text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    Sign out
                                </button>
                            ) : (
                                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="w-full py-2 rounded-full text-sm font-medium text-center border border-black/10 dark:border-white/15 text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5">
                                        Sign In
                                    </div>
                                </Link>
                            )}
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <div className="w-full py-2.5 rounded-full text-sm font-semibold text-center bg-black text-white dark:bg-white dark:text-black shadow-md">
                                    Start Sketching
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
