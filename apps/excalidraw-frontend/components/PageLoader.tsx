"use client";
import { PropagateLoader } from "react-spinners";

export default function PageLoader() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-center">
                <PropagateLoader color="#00FFFF" loading size={20} />
            </div>
        </div>
    );
}
