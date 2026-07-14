import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    getCountFromServer,
} from "firebase/firestore";
import { useRecentNotes, fetchRecentNotes } from "@/hooks/useRecentNotes";
import { useAuthStore } from "@/stores/authStore";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");

const mockTimestamp = { toDate: () => new Date("2024-06-01T12:00:00Z") };

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

describe("fetchRecentNotes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue({});
        (query as jest.Mock).mockReturnValue({});
        (orderBy as jest.Mock).mockReturnValue({});
        (limit as jest.Mock).mockReturnValue({});
    });

    it("returns mapped notes and total count", async () => {
        (getCountFromServer as jest.Mock).mockResolvedValue({
            data: () => ({ count: 3 }),
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "note-1",
                    data: () => ({
                        title: "My Note",
                        excerpt: "Some excerpt",
                        tags: ["tag1", "tag2"],
                        folderId: "folder-abc",
                        updatedAt: mockTimestamp,
                    }),
                },
            ],
        });

        const result = await fetchRecentNotes("user-123");

        expect(result.totalCount).toBe(3);
        expect(result.notes).toHaveLength(1);
        expect(result.notes[0]).toEqual({
            id: "note-1",
            title: "My Note",
            excerpt: "Some excerpt",
            tags: ["tag1", "tag2"],
            folderId: "folder-abc",
            updatedAt: new Date("2024-06-01T12:00:00Z"),
        });
    });

    it("handles notes with null tags and null folderId", async () => {
        (getCountFromServer as jest.Mock).mockResolvedValue({
            data: () => ({ count: 1 }),
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "note-2",
                    data: () => ({
                        title: "Tagless Note",
                        excerpt: "No tags",
                        tags: null,
                        folderId: null,
                        updatedAt: mockTimestamp,
                    }),
                },
            ],
        });

        const result = await fetchRecentNotes("user-123");

        expect(result.notes[0]?.tags).toEqual([]);
        expect(result.notes[0]?.folderId).toBeNull();
    });
});

describe("useRecentNotes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue({});
        (query as jest.Mock).mockReturnValue({});
        (orderBy as jest.Mock).mockReturnValue({});
        (limit as jest.Mock).mockReturnValue({});
    });

    it("fetches notes when user is authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-123" },
        });
        (getCountFromServer as jest.Mock).mockResolvedValue({
            data: () => ({ count: 2 }),
        });
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "n1",
                    data: () => ({
                        title: "Note 1",
                        excerpt: "Excerpt 1",
                        tags: ["a"],
                        folderId: null,
                        updatedAt: mockTimestamp,
                    }),
                },
            ],
        });

        const { result } = renderHook(() => useRecentNotes(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data?.totalCount).toBe(2);
        expect(result.current.data?.notes).toHaveLength(1);
        expect(result.current.data?.notes[0]?.title).toBe("Note 1");
    });

    it("is disabled and returns no data when user is not authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useRecentNotes(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(getDocs).not.toHaveBeenCalled();
    });
});
