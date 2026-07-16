import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import { useFolders, useCreateFolder, useDeleteFolder } from "@/hooks/useFolders";
import { useAuthStore } from "@/stores/authStore";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");

const mockTimestamp = { toDate: () => new Date("2024-01-01T00:00:00Z") };

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        );
    };
}

describe("useFolders", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("collRef");
        (query as jest.Mock).mockReturnValue("queryRef");
        (orderBy as jest.Mock).mockReturnValue("orderByClause");
    });

    it("returns folders mapped from Firestore docs", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "folder-1",
                    data: () => ({
                        name: "Work",
                        parentId: null,
                        createdAt: mockTimestamp,
                        updatedAt: mockTimestamp,
                    }),
                },
            ],
        });

        const { result } = renderHook(() => useFolders(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data![0]).toMatchObject({ id: "folder-1", name: "Work" });
    });

    it("handles missing timestamps with fallback dates", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "folder-2",
                    data: () => ({
                        name: "Empty",
                        parentId: null,
                        createdAt: null,
                        updatedAt: null,
                    }),
                },
            ],
        });

        const { result } = renderHook(() => useFolders(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data![0]!.createdAt).toBeInstanceOf(Date);
    });

    it("falls back to empty string when folder name is null", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "folder-3",
                    data: () => ({
                        name: null,
                        parentId: null,
                        createdAt: mockTimestamp,
                        updatedAt: mockTimestamp,
                    }),
                },
            ],
        });

        const { result } = renderHook(() => useFolders(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data![0]!.name).toBe("");
    });

    it("is disabled when user is not authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useFolders(), { wrapper: createWrapper() });

        expect(result.current.isLoading).toBe(false);
        expect(getDocs).not.toHaveBeenCalled();
    });
});

describe("useCreateFolder", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (collection as jest.Mock).mockReturnValue("collRef");
        (serverTimestamp as jest.Mock).mockReturnValue("ts");
        (addDoc as jest.Mock).mockResolvedValue({ id: "folder-new" });
    });

    it("creates a folder document and returns its id", async () => {
        const { result } = renderHook(() => useCreateFolder(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("Work Notes");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(addDoc).toHaveBeenCalledWith(
            "collRef",
            expect.objectContaining({ name: "Work Notes", parentId: null }),
        );
        expect(result.current.data).toBe("folder-new");
    });
});

describe("useDeleteFolder", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (doc as jest.Mock).mockReturnValue("docRef");
        (deleteDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it("deletes the specified folder document", async () => {
        const { result } = renderHook(() => useDeleteFolder(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("folder-1");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(deleteDoc).toHaveBeenCalledWith("docRef");
    });
});
