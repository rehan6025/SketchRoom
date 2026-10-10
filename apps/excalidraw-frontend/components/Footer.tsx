"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { ArrowUp, Github, Twitter, ExternalLink } from "lucide-react";

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative z-10 border-t border-border-primary/60 bg-bg-secondary/40 dark:bg-bg-primary/80 backdrop-blur-xl transition-colors duration-300">
            {/* Ambient Accent Light Leak at Top Border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                {/* Main Content Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border-primary/60">
                    {/* Brand Logo & Name */}
                    <Link href="/" className="inline-flex items-center space-x-2.5 group">
                        <Logo />
                        <span className="font-bold text-lg text-text-primary tracking-tight">
                            SketchRoom
                        </span>
                    </Link>

                    {/* Clean Essential Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text-secondary">
                        <Link
                            href="#"
                            className="hover:text-text-primary transition-colors duration-200"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-text-primary transition-colors duration-200"
                        >
                            Terms
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-text-primary transition-colors duration-200"
                        >
                            Support
                        </Link>
                        <a
                            href="https://linktr.ee/rehan_999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-text-primary transition-colors duration-200"
                        >
                            Contact
                        </a>
                    </nav>

                    {/* Social Icon Tiles */}
                    <div className="flex items-center gap-2">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="w-9 h-9 rounded-xl border border-border-primary/80 bg-bg-primary/80 hover:bg-bg-secondary hover:border-zinc-500/40 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            className="w-9 h-9 rounded-xl border border-border-primary/80 bg-bg-primary/80 hover:bg-bg-secondary hover:border-zinc-500/40 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs"
                        >
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a
                            href="https://linktr.ee/rehan_999"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Creator Links"
                            className="w-9 h-9 rounded-xl border border-border-primary/80 bg-bg-primary/80 hover:bg-bg-secondary hover:border-zinc-500/40 text-text-secondary hover:text-text-primary flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Back-to-Top */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
                    <p className="text-center sm:text-left">
                        &copy; {new Date().getFullYear()} SketchRoom. All rights reserved.
                    </p>

                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-primary/90 hover:bg-bg-secondary border border-border-primary/80 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer group"
                    >
                        <span>Back to top</span>
                        <ArrowUp className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                    </button>
                </div>
            </div>
        </footer>
    );
}
