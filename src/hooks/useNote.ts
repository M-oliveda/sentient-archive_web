import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import { mapDocToNote } from "@/hooks/useRecentNotes";
import type { INote } from "@/types/note";

export async function fetchNote(userId: string, noteId: string): Promise<INote> {
    const docSnap = await getDoc(doc(db, "users", userId, "notes", noteId));
    if (!docSnap.exists()) {
        throw new Error("Note not found");
    }
    return mapDocToNote(docSnap);
}

export function useNote(noteId: string | null) {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["notes", "detail", user?.uid, noteId],
        queryFn: () => fetchNote(user!.uid, noteId!),
        enabled: !!user?.uid && !!noteId,
    });
}
