export const dynamic = "force-dynamic";
import { Navbar } from "@/components/NavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoomList from "@/components/RoomList";
import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";

export type Room = {
    id: number;
    slug: string;
    createdAt: string;
    adminId: string;
    admin: {
        name: string;
    };
    _count: {
        chats: number;
    };
};

export default async function Dashboard() {
    const rooms: Room[] = await getUserRooms();
    return (
        <ProtectedRoute>
            <div className="h-screen bg-bg-primary transition-colors duration-300">
                <Navbar />
                <RoomList initialRooms={rooms} />
            </div>
        </ProtectedRoute>
    );
}

async function getUserRooms(): Promise<Room[]> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        console.log(token);
        if (!token) return [];

        const res = await axios.get(`${HTTP_BACKEND}userRooms`, {
            headers: {
                Authorization: token,
            },
        });
        return res.data as Room[];
    } catch (error) {
        console.log("dashboard ::", error);
        return [];
    }
}
