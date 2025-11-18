"use client";
import { ReactNode, useEffect, useState } from "react";
import { AuthPage } from "./AuthPage";
import PageLoader from "./PageLoader";

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
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <AuthPage isSignIn={true} />;
    }

    return <>{children}</>;
}
