"use client";

import { useState } from "react";
import { HTTP_BACKEND, WS_URL } from "@/config";
import { Zap, Loader2, Check } from "lucide-react";

export function BackendStatusButton() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

    const handleWake = () => {
        if (status === "sending") return;

        setStatus("sending");

        const httpUrl = HTTP_BACKEND.replace(/\/+$/, "") + "/health";
        const wsHttpUrl = WS_URL.replace(/^ws:/i, "http:")
            .replace(/^wss:/i, "https:")
            .replace(/\/+$/, "") + "/health";

        // Send direct wake requests (fire-and-forget, no local polling or persistent state)
        fetch(httpUrl, { cache: "no-store", mode: "no-cors" }).catch(() => {});
        fetch(wsHttpUrl, { cache: "no-store", mode: "no-cors" }).catch(() => {});

        // Direct WebSocket probe to trigger Render edge
        try {
            const ws = new WebSocket(WS_URL);
            setTimeout(() => {
                try {
                    ws.close();
                } catch {}
            }, 3000);
        } catch {}

        // Show brief visual feedback without blocking or looping
        setTimeout(() => {
            setStatus("sent");
            setTimeout(() => {
                setStatus("idle");
            }, 2500);
        }, 600);
    };

    return (
        <button
            type="button"
            onClick={handleWake}
            disabled={status === "sending"}
            className="group relative h-9 px-3.5 rounded-full text-xs font-medium flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/80 hover:bg-zinc-200/70 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all duration-200 cursor-pointer active:scale-[0.98] select-none"
            aria-label="Wake backend servers"
            title="Wake Render backend servers"
        >
            {status === "sending" ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>Waking...</span>
                </>
            ) : status === "sent" ? (
                <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Wake signal sent</span>
                </>
            ) : (
                <>
                    <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>Wake Servers</span>
                </>
            )}
        </button>
    );
}
