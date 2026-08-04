import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    collection,
    serverTimestamp,
} from "firebase/firestore";
import { useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotesMutations";
import { useAuthStore } from "@/stores/authStore";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");
jest.mock("@/lib/notes-utils", () => ({
    generateExcerpt: jest.fn((content: string) => content.slice(0, 20)),
}));

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

const SERVER_TS = Symbol("serverTimestamp");

describe("useCreateNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (collection as jest.Mock).mockReturnValue("collRef");
        (serverTimestamp as jest.Mock).mockReturnValue(SERVER_TS);
        (addDoc as jest.Mock).mockResolvedValue({ id: "new-note-id" });
    });

    it("creates a note with default fields and returns its id", async () => {
        const { result } = renderHook(() => useCreateNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate(null);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(addDoc).toHaveBeenCalledWith(
            "collRef",
            expect.objectContaining({
                userId: "user-1",
                title: "Untitled",
                content: "",
                folderId: null,
                tags: [],
                aiTags: [],
                isPinned: false,
                isArchived: false,
            }),
        );
        expect(result.current.data).toBe("new-note-id");
    });

    it("defaults folderId to null when called without an argument", async () => {
        const { result } = renderHook(() => useCreateNote(), {
            wrapper: createWrapper(),
        });

        // Calling mutate with undefined triggers the `= null` default parameter
        result.current.mutate(undefined as unknown as null);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(addDoc).toHaveBeenCalledWith(
            "collRef",
            expect.objectContaining({ folderId: null }),
        );
    });

    it("creates a note in a specific folder", async () => {
        const { result } = renderHook(() => useCreateNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("folder-abc");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(addDoc).toHaveBeenCalledWith(
            "collRef",
            expect.objectContaining({ folderId: "folder-abc" }),
        );
    });
});

describe("useUpdateNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (collection as jest.Mock).mockReturnValue("collRef");
        (doc as jest.Mock).mockReturnValue("docRef");
        (serverTimestamp as jest.Mock).mockReturnValue(SERVER_TS);
        (updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it("updates a note's title", async () => {
        const { result } = renderHook(() => useUpdateNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ noteId: "note-1", title: "New Title" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(updateDoc).toHaveBeenCalledWith(
            "docRef",
            expect.objectContaining({ title: "New Title" }),
        );
    });

    it("updates content and generates a new excerpt", async () => {
        const { result } = renderHook(() => useUpdateNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ noteId: "note-1", content: "# New Content" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(updateDoc).toHaveBeenCalledWith(
            "docRef",
            expect.objectContaining({
                content: "# New Content",
                excerpt: "# New Content",
            }),
        );
    });

    it("updates tags, folderId, and isPinned", async () => {
        const { result } = renderHook(() => useUpdateNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            noteId: "note-1",
            tags: ["a", "b"],
            folderId: "f1",
            isPinned: true,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(updateDoc).toHaveBeenCalledWith(
            "docRef",
            expect.objectContaining({
                tags: ["a", "b"],
                folderId: "f1",
                isPinned: true,
            }),
        );
    });

    it("does not include undefined fields in the update", async () => {
        const { result } = renderHook(() => useUpdateNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ noteId: "note-1", title: "T" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        const callArg = (updateDoc as jest.Mock).mock.calls[0][1] as Record<
            string,
            unknown
        >;
        expect(callArg).not.toHaveProperty("content");
        expect(callArg).not.toHaveProperty("tags");
    });
});

describe("useDeleteNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (doc as jest.Mock).mockReturnValue("docRef");
        (deleteDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it("deletes the specified note document", async () => {
        const { result } = renderHook(() => useDeleteNote(), {
            wrapper: createWrapper(),
        });

        result.current.mutate("note-1");

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(deleteDoc).toHaveBeenCalledWith("docRef");
    });
});
