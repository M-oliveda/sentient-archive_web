import { useQuery } from "@tanstack/react-query";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import type { ITokenRequest } from "@/types/transaction";

function mapDocToRequest(docSnap: {
    id: string;
    data: () => Record<string, unknown>;
}): ITokenRequest {
    const data = docSnap.data();
    const toDate = (val: unknown): Date =>
        val ? (val as Timestamp).toDate() : new Date();

    return {
        id: docSnap.id,
        userId: (data.userId as string) ?? "",
        amount: (data.amount as number) ?? 0,
        status: (data.status as ITokenRequest["status"]) ?? "pending",
        createdAt: toDate(data.createdAt),
        reviewedAt: data.reviewedAt ? toDate(data.reviewedAt) : undefined,
        reviewedBy: (data.reviewedBy as string | undefined) ?? undefined,
    };
}

export { mapDocToRequest };

export async function fetchTokenRequests(userId: string): Promise<ITokenRequest[]> {
    const requestsRef = collection(db, "tokenRequests");
    const snapshot = await getDocs(
        query(
            requestsRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(20),
        ),
    );
    return snapshot.docs.map(mapDocToRequest);
}

export function useTokenRequests() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["tokens", "requests", user?.uid],
        queryFn: () => fetchTokenRequests(user!.uid),
        enabled: !!user?.uid,
    });
}
