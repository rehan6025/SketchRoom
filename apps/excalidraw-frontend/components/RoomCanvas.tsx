"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjUwMzA5ZC02NGEzLTQ5YTQtYmZmMy04MWQ3NDM0NTg3MTciLCJpYXQiOjE3NTQ0MTA5OTV9.Ly-pPVoxBEWBPsvrSDQ7GsOMXLZYdq-lC4IUg1lvOzo

        ws.onopen = () => {
            setSocket(ws);
            ws.send(
                JSON.stringify({
                    type: "join_room",
                    roomId,
                })
            );
        };
    }, [roomId]);

    if (!socket) {
        return <div>Connecting to server...</div>;
    }

    return (
        <div>
            <Canvas socket={socket} roomId={roomId} />
        </div>
    );
}
