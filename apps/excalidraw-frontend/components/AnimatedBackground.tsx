"use client";
import React, { useEffect, useRef } from "react";

const AnimatedBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shapesRef = useRef<AnimatedShape[]>([]);

    class AnimatedShape {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        type: "circle" | "rect" | "line";
        color: string;
        rotation: number;
        rotationSpeed: number;
        shapes = ["circle", "rect", "line"];

        constructor(canvasWidth: number, canvasHeight: number) {
            this.x = Math.floor(Math.random() * canvasWidth);
            this.y = Math.floor(Math.random() * canvasHeight);
            this.size = Math.floor(Math.random() * (150 - 50) + 50);
            this.speedX = Math.random() - 0.5;
            this.speedY = Math.random() - 0.5;
            //@ts-ignore
            this.type = ["circle", "rect", "line"][
                Math.floor(Math.random() * 3)
            ];
            const colors = ["#00adb5", "#9bd2d4", "#525252"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.rotation = Math.floor(Math.random() * Math.PI * 2);
            this.rotationSpeed = Math.random() * 0.04 - 0.02;
        }

        update(canvasWidth: number, canvasHeight: number) {
            // TODO: Move shape by adding speedX to x, speedY to y
            this.x = this.x + this.speedX;
            this.y = this.y + this.speedY;

            this.rotation = this.rotation + this.rotationSpeed;
            if (this.x > canvasWidth + this.size) this.x = -this.size;
            if (this.y > canvasHeight + this.size) this.y = -this.size;
            if (this.x + this.size < 0) this.x = canvasWidth;
            if (this.y + this.size < 0) this.y = canvasHeight;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            switch (this.type) {
                case "circle":
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                    ctx.stroke();
                    break;

                case "rect":
                    ctx.strokeRect(
                        -this.size / 2,
                        -this.size / 2,
                        this.size,
                        this.size
                    );
                    break;

                case "line":
                    ctx.beginPath();
                    ctx.moveTo(-this.size / 2, 0);
                    ctx.lineTo(this.size / 2, 0);
                    ctx.stroke();
                    break;
            }

            ctx.restore();
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const SHAPE_COUNT = 22;

        shapesRef.current = Array.from(
            { length: SHAPE_COUNT },
            () => new AnimatedShape(canvas.width, canvas.height)
        );

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const shape of shapesRef.current) {
                shape.update(canvas.width, canvas.height);
                shape.draw(ctx);
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            className="fixed top-0 left-0 w-full h-full z-0 opacity-25 dark:opacity-10 pointer-events-none"
            ref={canvasRef}
        />
    );
};

export default AnimatedBackground;
