import { useQuery } from "@tanstack/react-query";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import type { ITransaction } from "@/types/transaction";

function mapDocToTransaction(docSnap: {
    id: string;
    data: () => Record<string, unknown>;
}): ITransaction {
    const data = docSnap.data();
    const toDate = (val: unknown): Date =>
        val ? (val as Timestamp).toDate() : new Date();

    return {
        id: docSnap.id,
        userId: (data.userId as string) ?? "",
        type: (data.type as ITransaction["type"]) ?? "debit",
        amount: (data.amount as number) ?? 0,
        reason: (data.reason as ITransaction["reason"]) ?? "admin_grant",
        noteId: (data.noteId as string | null) ?? null,
        balanceAfter: (data.balanceAfter as number) ?? 0,
        createdAt: toDate(data.createdAt),
    };
}

export { mapDocToTransaction };

export async function fetchTransactions(userId: string): Promise<ITransaction[]> {
    const txRef = collection(db, "users", userId, "transactions");
    const snapshot = await getDocs(
        query(txRef, orderBy("createdAt", "desc"), limit(50)),
    );
    return snapshot.docs.map(mapDocToTransaction);
}

export function useTransactions() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["tokens", "transactions", user?.uid],
        queryFn: () => fetchTransactions(user!.uid),
        enabled: !!user?.uid,
    });
}
