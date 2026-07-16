import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    collection,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import { generateExcerpt } from "@/lib/notes-utils";

function notesRef(userId: string) {
    return collection(db, "users", userId, "notes");
}

function noteRef(userId: string, noteId: string) {
    return doc(db, "users", userId, "notes", noteId);
}

export function useCreateNote() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (folderId: string | null = null) => {
            const docRef = await addDoc(notesRef(user!.uid), {
                userId: user!.uid,
                title: "Untitled",
                content: "",
                excerpt: "",
                folderId,
                tags: [],
                aiTags: [],
                summary: null,
                flashcards: null,
                isPinned: false,
                isArchived: false,
                sourceFile: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                viewedAt: serverTimestamp(),
            });
            return docRef.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
    });
}

export interface IUpdateNotePayload {
    noteId: string;
    title?: string;
    content?: string;
    tags?: string[];
    folderId?: string | null;
    isPinned?: boolean;
}

export function useUpdateNote() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            noteId,
            content,
            title,
            tags,
            folderId,
            isPinned,
        }: IUpdateNotePayload) => {
            await updateDoc(noteRef(user!.uid, noteId), {
                ...(title !== undefined && { title }),
                ...(tags !== undefined && { tags }),
                ...(folderId !== undefined && { folderId }),
                ...(isPinned !== undefined && { isPinned }),
                ...(content !== undefined && {
                    content,
                    excerpt: generateExcerpt(content),
                }),
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: (_data, { noteId }) => {
            queryClient.invalidateQueries({
                queryKey: ["notes", "detail", user!.uid, noteId],
            });
            queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
            queryClient.invalidateQueries({ queryKey: ["notes", "recent"] });
        },
    });
}

export function useDeleteNote() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (noteId: string) => {
            await deleteDoc(noteRef(user!.uid, noteId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
    });
}
