import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SketchRoom",
    description: "Collaborative Canvas Site",
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _twSafelist = [
    "px-4",
    "text-base",
    "py-2",
    "text-sm",
    "px-8",
    "py-4",
    "text-lg",
    "bg-gradient-to-r",
    "from-purple-500",
    "to-blue-500",
    "text-white",
    "bg-white",
    "text-purple-700",
    "border-2",
    "border-gray-300",
    "text-gray-700",
    "hover:shadow-lg",
    "hover:shadow-xl",
    "hover:-translate-y-0.5",
    "hover:-translate-y-1",
    " hover:text-purple-600",
    "transition-all",
    "duration-200",
    "duration-300",
    "rounded-lg",
    "transform",
    "flex",
    "items-center",
    "justify-center",
    "space-x-2",
].join(" ");

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
