import AnimatedBackground from "@/components/AnimatedBackground";
import Features from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/NavBar";
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

export default function Home() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen duration-500 bg-bg-primary overflow-x-hidden">
                <AnimatedBackground />
                <section className="pt-32 pb-20 font-base transition-colors duration-500 relative border-b border-border-secondary">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="mb-8 inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-accent  px-4 py-2 border border-cyan-200 dark:border-cyan-800">
                            <Sparkles className="w-4 h-4" />
                            <span>Now with real time collaboration</span>
                        </div>

                        <h1 className="font-bold text-5xl mb-6 leading-tight lg:text-6xl text-text-primary">
                            Create Art
                            <span className="block text-transparent bg-gradient-to-r from-cyan-500 via-emerald-500 to-blue-600 bg-clip-text pb-0.5">
                                together
                            </span>
                        </h1>

                        <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
                            The most intuitive collaborative drawing platform.
                            Sketch, paint, and create with your team in
                            real-time, from anywhere in the world.
                        </p>

                        <div className="sm:flex-row flex flex-col justify-center mb-12 gap-4">
                            <Link href={"/signin"}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex items-center justify-center space-x-2"
                                >
                                    Start Creating Now
                                    <ArrowRight className="ml-1 w-5 h-5" />
                                </Button>
                            </Link>

                            <Link
                                href={
                                    "https://www.youtube.com/watch?v=V3p6lDRJX50"
                                }
                                target="_blank"
                            >
                                <Button variant="outline" size="lg">
                                    <Play className="mr-1 w-5 h-5" />
                                    Watch Demo
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-text-secondary">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-clr-success" />
                                <span>Free to start</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-clr-success" />
                                <span>No download required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-clr-success" />
                                <span>Unlimited collaborators</span>
                            </div>
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

                <section className="relative z-10 py-20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="font-bold text-white text-4xl mb-6">
                            Ready to create together?
                        </h2>
                        <p className="text-slate-300 text-xl mb-8">
                            Join thousands of artists and creative teams already
                            using SketchRoom.
                        </p>
                        <Link href={"/dashboard"}>
                            <Button variant="secondary" size="lg">
                                Start Sketching for free
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
