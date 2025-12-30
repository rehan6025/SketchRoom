import { Palette } from "lucide-react";
import Logo from "./Logo";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="relative z-10 text-text-light py-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <Logo />

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-gray-400 mt-6 md:mt-0">
                        <Link
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            Support
                        </Link>
                        <a
                            href="https://linktr.ee/rehan_999"
                            className="hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Contact
                        </a>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-700">
                    <p className="text-center text-gray-400">
                        &copy; 2025 SketchRoom, All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
