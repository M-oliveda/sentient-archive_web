import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import { mapDocToNote } from "@/hooks/useRecentNotes";
import type { INote } from "@/types/note";

export type NoteSort = "updatedAt" | "createdAt" | "title";

export interface IUseNotesOptions {
    folderId?: string | null;
    sort?: NoteSort;
    search?: string;
}

export async function fetchNotes(
    userId: string,
    options: IUseNotesOptions = {},
): Promise<INote[]> {
    const { folderId, sort = "updatedAt" } = options;

    const notesRef = collection(db, "users", userId, "notes");

    const constraints = [
        where("isArchived", "==", false),
        ...(folderId !== undefined ? [where("folderId", "==", folderId)] : []),
        sort === "title" ? orderBy("title", "asc") : orderBy(sort, "desc"),
    ];

    const snapshot = await getDocs(query(notesRef, ...constraints));
    return snapshot.docs.map(mapDocToNote);
}

export function useNotes(options: IUseNotesOptions = {}) {
    const { user } = useAuthStore();
    const { folderId, sort = "updatedAt", search = "" } = options;

    const query = useQuery({
        queryKey: ["notes", "list", user?.uid, { folderId, sort }],
        queryFn: () => fetchNotes(user!.uid, { folderId, sort }),
        enabled: !!user?.uid,
    });

    const notes = query.data ?? [];
    const filtered = search.trim()
        ? notes.filter(
              (n) =>
                  n.title.toLowerCase().includes(search.toLowerCase()) ||
                  n.excerpt.toLowerCase().includes(search.toLowerCase()) ||
                  n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
          )
        : notes;

    return { ...query, data: filtered };
}
