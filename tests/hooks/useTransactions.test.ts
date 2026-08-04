import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import {
    useTransactions,
    fetchTransactions,
    mapDocToTransaction,
} from "@/hooks/useTransactions";
import { useAuthStore } from "@/stores/authStore";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");

const FIXED_DATE = new Date("2024-06-01T12:00:00Z");
const mockTimestamp = { toDate: () => FIXED_DATE };

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        );
    };
}

describe("mapDocToTransaction", () => {
    it("maps all fields from a Firestore doc", () => {
        const doc = {
            id: "tx-1",
            data: () => ({
                userId: "user-abc",
                type: "debit",
                amount: 5,
                reason: "ai_summarize",
                noteId: "note-1",
                balanceAfter: 95,
                createdAt: mockTimestamp,
            }),
        };

        const result = mapDocToTransaction(doc);

        expect(result).toEqual({
            id: "tx-1",
            userId: "user-abc",
            type: "debit",
            amount: 5,
            reason: "ai_summarize",
            noteId: "note-1",
            balanceAfter: 95,
            createdAt: FIXED_DATE,
        });
    });

    it("falls back to defaults when fields are null or missing", () => {
        const doc = {
            id: "tx-2",
            data: () => ({
                userId: null,
                type: null,
                amount: null,
                reason: null,
                noteId: null,
                balanceAfter: null,
                createdAt: null,
            }),
        };

        const result = mapDocToTransaction(doc);

        expect(result.userId).toBe("");
        expect(result.type).toBe("debit");
        expect(result.amount).toBe(0);
        expect(result.reason).toBe("admin_grant");
        expect(result.noteId).toBeNull();
        expect(result.balanceAfter).toBe(0);
        expect(result.createdAt).toBeInstanceOf(Date);
    });
});

describe("fetchTransactions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("txRef");
        (query as jest.Mock).mockReturnValue("queryRef");
        (orderBy as jest.Mock).mockReturnValue("orderByRef");
        (limit as jest.Mock).mockReturnValue("limitRef");
    });

    it("fetches and returns mapped transactions", async () => {
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "tx-1",
                    data: () => ({
                        userId: "user-1",
                        type: "credit",
                        amount: 100,
                        reason: "admin_grant",
                        noteId: null,
                        balanceAfter: 200,
                        createdAt: mockTimestamp,
                    }),
                },
            ],
        });

        const result = await fetchTransactions("user-1");

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: "tx-1",
            type: "credit",
            amount: 100,
            reason: "admin_grant",
            balanceAfter: 200,
        });
    });

    it("returns empty array when there are no transactions", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

        const result = await fetchTransactions("user-1");

        expect(result).toEqual([]);
    });
});

describe("useTransactions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("txRef");
        (query as jest.Mock).mockReturnValue("queryRef");
        (orderBy as jest.Mock).mockReturnValue("orderByRef");
        (limit as jest.Mock).mockReturnValue("limitRef");
    });

    it("fetches transactions when user is authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "tx-1",
                    data: () => ({
                        userId: "user-1",
                        type: "debit",
                        amount: 2,
                        reason: "ai_summarize",
                        noteId: "note-1",
                        balanceAfter: 98,
                        createdAt: mockTimestamp,
                    }),
                },
            ],
        });

        const { result } = renderHook(() => useTransactions(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0]?.reason).toBe("ai_summarize");
    });

    it("is disabled and returns no data when user is not authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useTransactions(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(getDocs).not.toHaveBeenCalled();
    });
});
