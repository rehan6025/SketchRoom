"use client";

import toast, { Toaster } from "react-hot-toast";
import { loginUser, signupUser } from "@/app/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Palette,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    CheckCircle,
} from "lucide-react";
import PageLoader from "./PageLoader";
import Logo from "./Logo";
import { Button } from "@repo/ui/button";

export function AuthPage({ isSignIn: initialIsSignIn }: { isSignIn: boolean }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
    const [showPassword, setShowPassword] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const router = useRouter();

    function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function handleAuth() {
        if (isSignIn) {
            const token: string = await loginUser(email, password);
            if (!token) {
                toast.error("Invalid credentials / user not found");
                setTimeout(() => {
                    router.push("/signup");
                }, 2000);
                return;
            }
            localStorage.setItem("token", token);
            document.cookie = `token=${token}; Max-Age=${60 * 60 * 24 * 27}; Path=/; SameSite=Lax`;

            toast.success("Signed in Successfully");
            await delay(1000);

            setIsNavigating(true);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } else {
            const token: string = await signupUser(name, email, password);

            if (!token) {
                toast.error("Invalid credentials");
                setTimeout(() => {
                    router.push("/signup");
                }, 1500);
                return;
            }
            localStorage.setItem("token", token);
            // Also set a cookie so server components can access the token
            document.cookie = `token=${token}; Max-Age=${7 * 24 * 60 * 60}; Path=/; SameSite=Lax`;

            toast.success("Signed up Successfully");

            await delay(1000);

            setIsNavigating(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        }
    }

    if (isNavigating) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 ">
            <div className="relative w-full max-w-md">
                {/* Auth Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                    {/* Logo */}
                    <div className="flex items-center justify-center space-x-3   mb-8">
                        <Logo />
                        <span className="text-2xl font-bold text-gray-900">
                            SketchRoom
                        </span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-text-dark mb-2">
                            {isSignIn ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-text-secondary">
                            {isSignIn
                                ? "Sign in to continue your creative journey"
                                : "Join thousands of artists creating together"}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Name Field (Sign Up Only) */}
                        {!isSignIn && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Enter your full name"
                                        className="outline-none w-full pl-10 pr-4 py-3 border border-border-secondary rounded-lg focus:ring-2 focus:ring-border-primary focus:border-transparent transition-all duration-200 bg-white/50"
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        value={name}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="outline-none w-full pl-10 pr-4 py-3 border border-border-secondary rounded-lg focus:ring-2 focus:ring-border-primary focus:border-transparent transition-all duration-200 bg-white/50"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter your password"
                                    className="outline-none w-full pl-10 pr-4 py-3 border border-border-secondary rounded-lg focus:ring-2 focus:ring-border-primary focus:border-transparent transition-all duration-200 bg-white/50"
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    value={password}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password (Sign In Only) */}
                        {isSignIn && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-border-secondary cursor-pointer hover:text-border-primary transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleAuth}
                                className="w-full"
                            >
                                {isSignIn ? "Sign In" : "Create Account"}
                            </Button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>

                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Toggle Sign Up/Sign In */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            {isSignIn
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => setIsSignIn(!isSignIn)}
                                className="text-cyan-600 hover:text-cyan-500 font-semibold transition-colors"
                            >
                                {isSignIn ? "Sign Up" : "Sign In"}
                            </button>
                        </p>
                    </div>

                    {/* Benefits (Sign Up Only) */}
                    {!isSignIn && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                What you&apos;ll get:
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>
                                        Unlimited collaborative canvases
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>
                                        Real-time sketching with friends
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Cloud storage for all your art</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Toaster />
        </div>
    );
}
