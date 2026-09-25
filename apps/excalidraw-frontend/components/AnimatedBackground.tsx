"use client";
import React, { useEffect, useRef } from "react";

/**
 * React Bits inspired interactive architectural grid & particle field
 * Creates a calm, sophisticated canvas background that responds to mouse motion.
 */
const AnimatedBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current.targetX = e.clientX;
            mousePos.current.targetY = e.clientY;
            mousePos.current.active = true;
        };

        const handleMouseLeave = () => {
            mousePos.current.active = false;
        };

        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.body.addEventListener("mouseleave", handleMouseLeave);

        // Drifting ambient micro-particles
        const PARTICLE_COUNT = 30;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.4 + 0.1,
        }));

        const GRID_SIZE = 36;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Smooth spring lerp mouse tracking
            mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.1;
            mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.1;

            const isDark = document.documentElement.classList.contains("dark");
            const gridColor = isDark ? "rgba(255, 255, 255, 0.035)" : "rgba(0, 0, 0, 0.04)";
            const spotlightColor = isDark ? "rgba(0, 173, 181, 0.09)" : "rgba(0, 173, 181, 0.06)";
            const particleColor = isDark ? "rgba(255, 255, 255, " : "rgba(15, 23, 42, ";

            // 1. Draw subtle base grid
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;

            ctx.beginPath();
            for (let x = 0; x < width; x += GRID_SIZE) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y < height; y += GRID_SIZE) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // 2. Draw mouse cursor spotlight if active
            if (mousePos.current.active) {
                const mx = mousePos.current.x;
                const my = mousePos.current.y;
                const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 320);
                gradient.addColorStop(0, spotlightColor);
                gradient.addColorStop(1, "transparent");

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);

                // Highlight illuminated grid intersection points
                const startX = Math.max(0, Math.floor((mx - 280) / GRID_SIZE) * GRID_SIZE);
                const endX = Math.min(width, Math.ceil((mx + 280) / GRID_SIZE) * GRID_SIZE);
                const startY = Math.max(0, Math.floor((my - 280) / GRID_SIZE) * GRID_SIZE);
                const endY = Math.min(height, Math.ceil((my + 280) / GRID_SIZE) * GRID_SIZE);

                for (let x = startX; x <= endX; x += GRID_SIZE) {
                    for (let y = startY; y <= endY; y += GRID_SIZE) {
                        const dx = mx - x;
                        const dy = my - y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 260) {
                            const intensity = 1 - dist / 260;
                            ctx.beginPath();
                            ctx.arc(x, y, 1.8 * intensity, 0, Math.PI * 2);
                            ctx.fillStyle = isDark
                                ? `rgba(0, 173, 181, ${0.7 * intensity})`
                                : `rgba(0, 173, 181, ${0.5 * intensity})`;
                            ctx.fill();
                        }
                    }
                }
            }

            // 3. Update & Draw ambient drifting micro-particles
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${particleColor}${p.alpha})`;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Subtle Vignette Mask to blend edges into page background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--bg-primary)_95%)] pointer-events-none z-10" />

            {/* Ambient subtle blur glow behind hero center */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/[0.04] dark:bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none -z-10" />

            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};

export default AnimatedBackground;
