import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { fetchNote, useNote } from "@/hooks/useNote";
import { useAuthStore } from "@/stores/authStore";
import { mapDocToNote } from "@/hooks/useRecentNotes";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");
jest.mock("@/hooks/useRecentNotes", () => ({
    mapDocToNote: jest.fn(),
}));

const NOTE_STUB = {
    id: "note-1",
    title: "My Note",
    content: "Content",
    excerpt: "Excerpt",
    tags: [],
    aiTags: [],
    folderId: null,
    summary: null,
    flashcards: null,
    isPinned: false,
    isArchived: false,
    sourceFile: null,
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    viewedAt: new Date(),
};

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

describe("fetchNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (doc as jest.Mock).mockReturnValue("docRef");
    });

    it("returns the mapped note when document exists", async () => {
        const docSnap = { exists: () => true, id: "note-1", data: () => ({}) };
        (getDoc as jest.Mock).mockResolvedValue(docSnap);
        (mapDocToNote as jest.Mock).mockReturnValue(NOTE_STUB);

        const result = await fetchNote("user-1", "note-1");

        expect(getDoc).toHaveBeenCalledWith("docRef");
        expect(mapDocToNote).toHaveBeenCalledWith(docSnap);
        expect(result).toEqual(NOTE_STUB);
    });

    it("throws when the document does not exist", async () => {
        (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

        await expect(fetchNote("user-1", "missing")).rejects.toThrow("Note not found");
    });
});

describe("useNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (doc as jest.Mock).mockReturnValue("docRef");
    });

    it("fetches the note when user and noteId are set", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        const docSnap = { exists: () => true, id: "note-1", data: () => ({}) };
        (getDoc as jest.Mock).mockResolvedValue(docSnap);
        (mapDocToNote as jest.Mock).mockReturnValue(NOTE_STUB);

        const { result } = renderHook(() => useNote("note-1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(NOTE_STUB);
    });

    it("is disabled when noteId is null", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });

        const { result } = renderHook(() => useNote(null), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(getDoc).not.toHaveBeenCalled();
    });

    it("is disabled when user is null", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useNote("note-1"), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(getDoc).not.toHaveBeenCalled();
    });
});
