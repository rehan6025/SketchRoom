import GradientWaves from "@/components/GradientWaves";
import Features from "@/components/Features";
import { Footer } from "@/components/Footer";
import HeroCanvasPreview from "@/components/HeroCanvasPreview";
import { Navbar } from "@/components/NavBar";
import { ShinyText } from "@/components/ShinyText";
import { ShimmerButton } from "@/components/ShimmerButton";
import { Button } from "@repo/ui/button";
import {
    ArrowRight,
    CheckCircle,
    Globe,
    Palette,
    Play,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import SpecularButton from "@/components/SpecularButton";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
    return (
        <>
            <SmoothScroll />
            <Navbar />
            <div className="min-h-[100svh] duration-300 bg-bg-primary overflow-x-hidden relative">
                {/* Hero Section - Centered Layout with Scoped GradientWaves WebGL Background */}
                <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 font-base transition-colors duration-300 overflow-hidden border-b border-border-primary/60">
                    {/* GradientWaves React Bits WebGL Background (strictly scoped to Hero only) */}
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        <GradientWaves
                            horizonColor="#5227FF"
                            waveColor="#FF9FFC"
                            crestColor="#FFFFFF"
                            speed={0.4}
                            amplitude={2.5}
                            waveScale={0.6}
                            waveRatio={0.9}
                            swell={35}
                            turbulence={20}
                            tilt={1.11}
                            zoom={1.0}
                            height={5.5}
                            fogDepth={18}
                            detail="medium"
                            brightness={1.0}
                            opacity={0.9}
                            mouseInteraction={true}
                            parallaxStrength={0.5}
                            grain={true}
                            grainIntensity={0.04}
                        />
                        {/* Soft bottom fade so waves cleanly transition into next section */}
                        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent pointer-events-none z-10" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
                        {/* Centered Value Prop, Headline & CTAs */}
                        <div className="max-w-3xl lg:max-w-4xl mx-auto text-center flex flex-col items-center">
                            {/* React Bits Inspired Shimmer Pill Badge with Wave Accent */}
                            {/* <div className="mb-6 inline-flex items-center space-x-2.5 rounded-full bg-bg-secondary/85 px-4 py-1.5 border border-border-primary shadow-sm text-xs font-medium backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-[#FF9FFC] animate-pulse shadow-[0_0_10px_#FF9FFC]" />
                              
                            </div> */}

                            {/* Centered Display Headline with Rich Wave Gradient */}
                            <h1 className="mt-20 text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.035em] max-w-4xl leading-[1.08] text-text-primary mb-6">
                                
                                    Collaborative
                                
                                <span> sketching,</span>{" "}
                                <span className="block sm:inline sm:mt-0 mt-1 bg-clip-text ">
                                    built for real-time speed.
                                </span>
                            </h1>

                            {/* Centered Subheading */}
                            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mb-8 font-normal">
                                The lightning-fast collaborative whiteboard for modern teams.
                                Diagram architecture, wireframe interfaces, and brainstorm in real time with sub-50ms sync.
                            </p>

                            {/* Centered CTA Row */}
                            <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
                                <Link href="/signin">
                                    <SpecularButton
                                        size="md"
                                        radius={14}
                                        tint="#09090b"
                                        tintOpacity={0.88}
                                        blur={10}
                                        textColor="#ffffff"
                                        lineColor="#ffffff"
                                        baseColor="#525252"
                                        intensity={1.2}
                                        shineSize={12}
                                        shineFade={35}
                                        thickness={1.2}
                                        speed={0.35}
                                        followMouse
                                        proximity={250}
                                        autoAnimate={false}
                                    >
                                        <span>Start Creating Free</span>
                                        <ArrowRight className="w-4 h-4 ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </SpecularButton>
                                </Link>

                                <Link
                                    href="https://www.youtube.com/watch?v=V3p6lDRJX50"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button className="h-11 px-5 rounded-xl border border-border-primary bg-bg-secondary/80 hover:bg-bg-secondary text-text-primary font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer select-none backdrop-blur-md">
                                        <Play className="w-3.5 h-3.5 fill-current opacity-70 text-text-secondary" />
                                        <span>Watch Demo</span>
                                    </button>
                                </Link>
                            </div>

                            {/* Centered Trust Indicators */}
                            {/* <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary select-none">
                                <div className="flex items-center space-x-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>No account needed</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Real-time presence</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Sub-50ms sync</span>
                                </div>
                            </div> */}
                        </div>

                        {/* Interactive Whiteboard Studio - Centered Showcase Window Below Copy */}
                        <div className="max-w-5xl mx-auto mt-8 sm:mt-10 w-full">
                            <HeroCanvasPreview />
                        </div>
                    </div>
                </section>
                <section id="features" className="py-20 bg-bg-primary">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-text-primary mb-4">
                                Everything you need to create together
                            </h2>
                            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                                Powerful tools designed for seamless
                                collaboration.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 justify-center bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center rounded-2xl mx-auto mb-4">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-bold text-text-primary text-xl leading-relaxed mb-2">
                                    Real-time Collaboration
                                </h3>
                                <p className="text-text-secondary">
                                    Work together seamlessly with live cursors
                                    and instant updates.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-16 h-16 justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center rounded-2xl mx-auto mb-4">
                                    <Palette className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-bold text-text-primary text-xl leading-relaxed mb-2">
                                    Professional Tools
                                </h3>
                                <p className="text-text-secondary">
                                    Advanced brushes, layers, and everything you
                                    need to create.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-16 h-16 justify-center bg-gradient-to-br from-blue-500 to-blue-600 flex items-center rounded-2xl mx-auto mb-4">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-bold text-text-primary text-xl leading-relaxed mb-2">
                                    Cloud Sync
                                </h3>
                                <p className="text-text-secondary">
                                    Access your art from anywhere with automatic
                                    saving.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-16 h-16 justify-center bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center rounded-2xl mx-auto mb-4">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-bold text-text-primary text-xl leading-relaxed mb-2">
                                    Lightning Fast
                                </h3>
                                <p className="text-text-secondary">
                                    Smooth sketching experience with zero lag,
                                    even with multiple users.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="how-it-works"
                    className="relative z-10 py-20 bg-gradient-to-br from-bg-primary via-purple-50/30 dark:via-purple-900/10 to-bg-primary"
                >
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-text-primary">
                                Start creating in seconds
                            </h2>
                            <p className="text-xl text-text-secondary">
                                No complex setup. Just open your browser and
                                start sketching.
                            </p>
                        </div>

                        <Features />
                    </div>
                </section>

                <section className="relative z-10 py-16 sm:py-20 bg-gradient-to-b from-bg-primary via-bg-secondary/60 to-bg-primary border-t border-border-primary/40">
                    <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="font-bold text-text-primary text-3xl sm:text-4xl mb-4 tracking-tight">
                            Ready to create together?
                        </h2>
                        <p className="text-text-secondary text-sm sm:text-base mb-8 max-w-xl mx-auto">
                            Join thousands of teams, architects, and designers already sketching with real-time collaboration.
                        </p>
                        <div className="flex justify-center">
                            <Link href="/dashboard">
                                 <SpecularButton
                                        size="md"
                                        radius={14}
                                        tint="#09090b"
                                        tintOpacity={0.88}
                                        blur={10}
                                        textColor="#ffffff"
                                        lineColor="#ffffff"
                                        baseColor="#525252"
                                        intensity={1.2}
                                        shineSize={12}
                                        shineFade={35}
                                        thickness={1.2}
                                        speed={0.35}
                                        followMouse
                                        proximity={250}
                                        autoAnimate={false}
                                    >
                                    <span className="font-semibold">Start Sketching for Free</span>
                                    <ArrowRight className="w-4 h-4 ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </SpecularButton>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
