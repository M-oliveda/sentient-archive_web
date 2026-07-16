import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import type { IFolder } from "@/types/folder";

function foldersRef(userId: string) {
    return collection(db, "users", userId, "folders");
}

async function fetchFolders(userId: string): Promise<IFolder[]> {
    const snapshot = await getDocs(
        query(foldersRef(userId), orderBy("createdAt", "asc")),
    );
    return snapshot.docs.map((d) => {
        const data = d.data();
        const toDate = (val: unknown): Date =>
            val ? (val as Timestamp).toDate() : new Date();
        return {
            id: d.id,
            name: (data.name as string) ?? "",
            parentId: (data.parentId as string | null) ?? null,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        };
    });
}

export function useFolders() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["folders", user?.uid],
        queryFn: () => fetchFolders(user!.uid),
        enabled: !!user?.uid,
    });
}

export function useCreateFolder() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            const docRef = await addDoc(foldersRef(user!.uid), {
                name,
                parentId: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return docRef.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}

export function useDeleteFolder() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (folderId: string) => {
            await deleteDoc(doc(db, "users", user!.uid, "folders", folderId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}
