import Link from "next/link";
import { Play } from "lucide-react";


export const  WatchDemoButton = ()=>{
    return <Link
                                    href="https://www.youtube.com/watch?v=V3p6lDRJX50"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative inline-flex"
                                >
                                    {/* Cute Teddy Peeking from Behind the Button on Hover */}
                                    <div className="absolute -top-[34px] right-2 pointer-events-none transition-all duration-300 ease-out opacity-0 translate-y-3 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 z-0">
                                        <svg
                                            width="64"
                                            height="42"
                                            viewBox="0 0 64 42"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="drop-shadow-sm select-none"
                                            aria-hidden="true"
                                        >
                                            {/* Left Ear */}
                                            <circle cx="16" cy="11" r="5" fill="#c68a4c" stroke="#9a6231" strokeWidth="1" />
                                            <circle cx="16" cy="11" r="2.8" fill="#fbcfe8" />

                                            {/* Right Ear */}
                                            <circle cx="38" cy="11" r="5" fill="#c68a4c" stroke="#9a6231" strokeWidth="1" />
                                            <circle cx="38" cy="11" r="2.8" fill="#fbcfe8" />

                                            {/* Body peeking */}
                                            <ellipse cx="27" cy="40" rx="14" ry="8" fill="#c68a4c" stroke="#9a6231" strokeWidth="1" />

                                            {/* Head */}
                                            <circle cx="27" cy="22" r="12" fill="#c68a4c" stroke="#9a6231" strokeWidth="1" />

                                            {/* Rosy Cheeks */}
                                            <circle cx="19" cy="24" r="2.2" fill="#f472b6" opacity="0.6" />
                                            <circle cx="35" cy="24" r="2.2" fill="#f472b6" opacity="0.6" />

                                            {/* Eyes with sparkle */}
                                            <circle cx="22.5" cy="20" r="1.6" fill="#18181b" />
                                            <circle cx="22" cy="19.4" r="0.6" fill="#ffffff" />
                                            <circle cx="31.5" cy="20" r="1.6" fill="#18181b" />
                                            <circle cx="31" cy="19.4" r="0.6" fill="#ffffff" />

                                            {/* Muzzle */}
                                            <ellipse cx="27" cy="25.5" rx="5" ry="3.8" fill="#ffedd5" />
                                            <ellipse cx="27" cy="24" rx="2" ry="1.3" fill="#27272a" />
                                            <path d="M 25.2 26 Q 27 27.6 28.8 26" stroke="#27272a" strokeWidth="1" strokeLinecap="round" />

                                            {/* Left Arm / Paw (Holding the button's top edge as if climbed up) */}
                                            <ellipse cx="12" cy="38" rx="4.2" ry="3.2" fill="#d99b66" stroke="#9a6231" strokeWidth="1" />
                                            <circle cx="10.8" cy="37.5" r="1" fill="#fed7aa" />
                                            <circle cx="12.5" cy="37" r="1" fill="#fed7aa" />

                                            {/* Right Arm (Raised up proudly holding the play button) */}
                                            <path d="M 36 26 Q 43 20 47 14" stroke="#c68a4c" strokeWidth="4.8" strokeLinecap="round" />
                                            <circle cx="47" cy="14" r="3" fill="#d99b66" stroke="#9a6231" strokeWidth="0.8" />

                                            {/* Play Button Raised by Right Hand */}
                                            <g className="transform origin-[53px_10px] transition-transform duration-200 group-hover:scale-105">
                                                <circle cx="53" cy="10" r="7.5" className="fill-zinc-900 dark:fill-white stroke-white/40 dark:stroke-zinc-900/40" strokeWidth="1" />
                                                <polygon points="51,6.8 57.5,10 51,13.2" className="fill-white dark:fill-zinc-900" />
                                            </g>
                                        </svg>
                                    </div>

                                    <span className="relative z-10 h-11 px-5 rounded-xl border border-border-primary bg-bg-secondary/80 hover:bg-bg-secondary text-text-primary font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer select-none backdrop-blur-md">
                                        <Play className="w-3.5 h-3.5 fill-current opacity-70 text-text-secondary" />
                                        <span>Watch Demo</span>
                                    </span>
                                </Link>
} 