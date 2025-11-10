import { Palette, Sparkles } from "lucide-react";
import React from "react";

const Logo = () => {
    return (
        <>
            <div
                className={
                    "w-8 h-8 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg"
                }
            >
                <Palette className="w-5 h-5 text-white" />
            </div>
        </>
    );
};

export default Logo;
