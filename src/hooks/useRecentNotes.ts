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

function mapDocToNote(docSnap: {
    id: string;
    data: () => Record<string, unknown>;
}): INote {
    const data = docSnap.data();
    const toDate = (val: unknown): Date =>
        val ? (val as Timestamp).toDate() : new Date();

    return {
        id: docSnap.id,
        userId: (data.userId as string) ?? "",
        title: (data.title as string) ?? "",
        content: (data.content as string) ?? "",
        excerpt: (data.excerpt as string) ?? "",
        tags: (data.tags as string[]) ?? [],
        aiTags: (data.aiTags as string[]) ?? [],
        folderId: (data.folderId as string | null) ?? null,
        summary: (data.summary as string | null) ?? null,
        flashcards: (data.flashcards as INote["flashcards"]) ?? null,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
        viewedAt: toDate(data.viewedAt),
        isPinned: (data.isPinned as boolean) ?? false,
        isArchived: (data.isArchived as boolean) ?? false,
        sourceFile: (data.sourceFile as INote["sourceFile"]) ?? null,
    };
}

export { mapDocToNote };

export async function fetchRecentNotes(userId: string): Promise<IRecentNotesData> {
    const notesRef = collection(db, "users", userId, "notes");

    const [countSnapshot, notesSnapshot] = await Promise.all([
        getCountFromServer(notesRef),
        getDocs(query(notesRef, orderBy("updatedAt", "desc"), limit(5))),
    ]);

    const notes: INote[] = notesSnapshot.docs.map(mapDocToNote);

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
