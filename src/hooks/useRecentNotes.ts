import { useQuery } from "@tanstack/react-query";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    getCountFromServer,
    type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import type { INote } from "@/types/note";

export interface IRecentNotesData {
    notes: INote[];
    totalCount: number;
}

export async function fetchRecentNotes(userId: string): Promise<IRecentNotesData> {
    const notesRef = collection(db, "users", userId, "notes");

    const [countSnapshot, notesSnapshot] = await Promise.all([
        getCountFromServer(notesRef),
        getDocs(query(notesRef, orderBy("updatedAt", "desc"), limit(5))),
    ]);

    const notes: INote[] = notesSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            title: data.title as string,
            excerpt: data.excerpt as string,
            tags: (data.tags as string[]) ?? [],
            folderId: (data.folderId as string | null) ?? null,
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        };
    });

    return {
        notes,
        totalCount: countSnapshot.data().count,
    };
}

export function useRecentNotes() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["notes", "recent", user?.uid],
        queryFn: () => fetchRecentNotes(user!.uid),
        enabled: !!user?.uid,
    });
}
