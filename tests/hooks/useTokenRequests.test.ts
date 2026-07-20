import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
    useTokenRequests,
    fetchTokenRequests,
    mapDocToRequest,
} from "@/hooks/useTokenRequests";
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

describe("mapDocToRequest", () => {
    it("maps all fields from a Firestore doc", () => {
        const doc = {
            id: "req-1",
            data: () => ({
                userId: "user-abc",
                amount: 500,
                status: "pending",
                createdAt: mockTimestamp,
                reviewedAt: mockTimestamp,
                reviewedBy: "admin-1",
            }),
        };

        const result = mapDocToRequest(doc);

        expect(result).toEqual({
            id: "req-1",
            userId: "user-abc",
            amount: 500,
            status: "pending",
            createdAt: FIXED_DATE,
            reviewedAt: FIXED_DATE,
            reviewedBy: "admin-1",
        });
    });

    it("falls back to defaults when fields are null or missing", () => {
        const doc = {
            id: "req-2",
            data: () => ({
                userId: null,
                amount: null,
                status: null,
                createdAt: null,
                reviewedAt: null,
                reviewedBy: null,
            }),
        };

        const result = mapDocToRequest(doc);

        expect(result.userId).toBe("");
        expect(result.amount).toBe(0);
        expect(result.status).toBe("pending");
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.reviewedAt).toBeUndefined();
        expect(result.reviewedBy).toBeUndefined();
    });

    it("omits reviewedAt and reviewedBy when not present", () => {
        const doc = {
            id: "req-3",
            data: () => ({
                userId: "user-1",
                amount: 100,
                status: "pending",
                createdAt: mockTimestamp,
            }),
        };

        const result = mapDocToRequest(doc);

        expect(result.reviewedAt).toBeUndefined();
        expect(result.reviewedBy).toBeUndefined();
    });
});

describe("fetchTokenRequests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("requestsRef");
        (where as jest.Mock).mockReturnValue("whereRef");
        (orderBy as jest.Mock).mockReturnValue("orderByRef");
        (limit as jest.Mock).mockReturnValue("limitRef");
        (query as jest.Mock).mockReturnValue("queryRef");
    });

    it("fetches and returns mapped requests", async () => {
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "req-1",
                    data: () => ({
                        userId: "user-1",
                        amount: 500,
                        status: "pending",
                        createdAt: mockTimestamp,
                    }),
                },
            ],
        });

        const result = await fetchTokenRequests("user-1");

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: "req-1",
            amount: 500,
            status: "pending",
        });
    });

    it("returns empty array when there are no requests", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

        const result = await fetchTokenRequests("user-1");

        expect(result).toEqual([]);
    });

    it("queries the tokenRequests collection filtered by userId", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

        await fetchTokenRequests("user-abc");

        expect(collection).toHaveBeenCalledWith(expect.anything(), "tokenRequests");
        expect(where).toHaveBeenCalledWith("userId", "==", "user-abc");
        expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
        expect(limit).toHaveBeenCalledWith(20);
    });
});

describe("useTokenRequests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("requestsRef");
        (where as jest.Mock).mockReturnValue("whereRef");
        (orderBy as jest.Mock).mockReturnValue("orderByRef");
        (limit as jest.Mock).mockReturnValue("limitRef");
        (query as jest.Mock).mockReturnValue("queryRef");
    });

    it("fetches requests when user is authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "req-1",
                    data: () => ({
                        userId: "user-1",
                        amount: 200,
                        status: "approved",
                        createdAt: mockTimestamp,
                    }),
                },
            ],
        });

        const { result } = renderHook(() => useTokenRequests(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0]?.status).toBe("approved");
    });

    it("is disabled and returns no data when user is not authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useTokenRequests(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(getDocs).not.toHaveBeenCalled();
    });
});
