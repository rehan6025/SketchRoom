import { RoomCanvas } from "@/components/RoomCanvas";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

// export default async function Page(props: {
//     params: Promise<{ slug: string }>;
// });

export default async function CanvasPage({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const slugOrId = (await params).roomId;
    // If it's already a number string, use it directly. Otherwise, resolve slug -> id
    let numericId = Number(slugOrId);
    if (Number.isNaN(numericId)) {
        const res = await axios.get(`${HTTP_BACKEND}room/${slugOrId}`);
        numericId = Number(res.data.id);
    }

    return <RoomCanvas roomId={String(numericId)} />;
}
