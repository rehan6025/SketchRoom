import { Room } from "../app/dashboard/page";
import { useRouter } from "next/navigation";
import { format } from "date-fns"; // For nice date formatting
import { Trash2 } from "lucide-react";

export default function RoomCard({
    room,
    viewMode,
    onDelete,
}: {
    room: Room & { admin: { name: string } }; // Include admin name
    viewMode: "grid" | "list";
    onDelete?: (roomId: number) => void;
}) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/canvas/${room.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the room click
        if (onDelete) {
            onDelete(room.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`cursor-pointer border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-200 relative group
        ${viewMode === "grid" ? "p-4" : "p-3 flex items-center justify-between"}`}
        >
            {/* Delete button - positioned absolutely */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                title="Delete room"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {viewMode === "grid" ? (
                <>
                    <div className="mb-2 font-semibold text-lg">
                        {room.slug}
                    </div>
                    <div className="text-sm text-gray-500">
                        By {room.admin?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Created{" "}
                        {room.createdAt
                            ? format(new Date(room.createdAt), "dd MMM yyyy")
                            : "Unknown date"}
                    </div>
                    <div className="mt-3 text-xs bg-gray-100 rounded px-2 py-1 inline-block">
                        {room._count?.chats ?? 0} messages
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <div className="font-semibold">{room.slug}</div>
                        <div className="text-xs text-gray-500">
                            {room.createdAt
                                ? format(
                                      new Date(room.createdAt),
                                      "dd MMM yyyy"
                                  )
                                : "Unknown date"}{" "}
                            · {room.admin?.name || "Unknown"}
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        {room._count?.chats ?? 0} msgs
                    </div>
                </>
            )}
        </div>
    );
}
