/**
 * Integration: notes mutation invalidates TanStack Query cache
 *
 * Creating or updating a note invalidates the notes list / detail queries.
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    addDoc,
    updateDoc,
    collection,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { useCreateNote, useUpdateNote } from "@/hooks/useNotesMutations";
import { useAuthStore } from "@/stores/authStore";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");
jest.mock("@/lib/notes-utils", () => ({
    generateExcerpt: jest.fn((content: string) => content.slice(0, 20)),
}));

const SERVER_TS = Symbol("serverTimestamp");

function createTestClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        );
    };
}

describe("integration: notes cache invalidation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        (collection as jest.Mock).mockReturnValue("collRef");
        (doc as jest.Mock).mockReturnValue("docRef");
        (serverTimestamp as jest.Mock).mockReturnValue(SERVER_TS);
        (addDoc as jest.Mock).mockResolvedValue({ id: "new-note-id" });
        (updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it("invalidates notes queries after creating a note", async () => {
        const queryClient = createTestClient();
        const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useCreateNote(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            result.current.mutate(null);
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notes"] });
    });

    it("invalidates note detail, list, and recent queries after updating a note", async () => {
        const queryClient = createTestClient();
        const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useUpdateNote(), {
            wrapper: createWrapper(queryClient),
        });

        await act(async () => {
            result.current.mutate({
                noteId: "note-42",
                title: "Updated title",
                content: "Updated body content",
            });
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ["notes", "detail", "user-1", "note-42"],
        });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notes", "list"] });
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: ["notes", "recent"],
        });
    });
});
