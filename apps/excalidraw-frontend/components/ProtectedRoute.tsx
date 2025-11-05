"use client";
import { ReactNode, useEffect, useState } from "react";
import { AuthPage } from "./AuthPage";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthPage isSignIn={true} />;
    }

    return <>{children}</>;
}
