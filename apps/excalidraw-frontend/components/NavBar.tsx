"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import DarkModeSwtich from "./DarkModeSwtich";
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
    }, []);

    const handleSignOut = () => {
        localStorage.clear();
        setHasToken(false);
    };

    return (
        <nav className="z-50 fixed transition-colors duration-300 top-0 w-full bg-bg-primary/80 dark:bg-bg-primary/85 backdrop-blur-xl border-b border-border-primary/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link className="flex space-x-2.5 items-center group" href="/">
                        <Logo />
                        <span className="text-text-primary font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
                            SketchRoom
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <DarkModeSwtich
                            checked={isDark}
                            onChange={toggleTheme}
                        />

                        <Link
                            href="/#features"
                            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Features
                        </Link>

                        <Link
                            href="/#how-it-works"
                            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                            How it works
                        </Link>

                        {hasToken ? (
                            <Link href="/">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                >
                                    Sign out
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/signin">
                                <Button variant="outline" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                        <Link href="/dashboard">
                            <Button variant="primary" size="sm">
                                Start Sketching
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center md:hidden space-x-3">
                        <DarkModeSwtich
                            checked={isDark}
                            onChange={toggleTheme}
                        />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-border-primary bg-bg-secondary/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
                    <Link
                        href="/#features"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-base font-medium text-text-primary hover:bg-bg-primary"
                    >
                        Features
                    </Link>
                    <Link
                        href="/#how-it-works"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-base font-medium text-text-primary hover:bg-bg-primary"
                    >
                        How it works
                    </Link>
                    <div className="pt-2 flex flex-col gap-2">
                        {hasToken ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    handleSignOut();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full justify-center"
                            >
                                Sign out
                            </Button>
                        ) : (
                            <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="outline" size="sm" className="w-full justify-center">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="primary" size="sm" className="w-full justify-center">
                                Start Sketching
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
