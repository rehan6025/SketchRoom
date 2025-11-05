import { Palette } from "lucide-react";

export function Footer() {
    return (
        <footer className="text-white py-12 bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row  items-center justify-between ">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg ">
                            <Palette className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl ">
                            SketchRoom
                        </span>
                    </div>
                    <div className=" flex flex-col md:flex-row items-center justify-center gap-6 text-gray-400">
                        <a href="" className="hover:text-white transition-all">
                            Privacy
                        </a>
                        <a href="" className="hover:text-white transition-all">
                            Terms
                        </a>
                        <a href="" className="hover:text-white transition-all">
                            Support
                        </a>
                        <a
                            href="https://linktr.ee/rehan_999"
                            className="hover:text-white transition-all"
                            target="_blank"
                        >
                            Contact
                        </a>
                    </div>
                </div>
                <div className="mt-8 pt-8 text-center text-gray-400 border-t border-gray-700">
                    &copy; 2025 SketchRoom, All rights reserved.
                </div>
            </div>
        </footer>
    );
}
