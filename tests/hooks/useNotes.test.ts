import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { fetchNotes, useNotes } from "@/hooks/useNotes";
import { useAuthStore } from "@/stores/authStore";
import { mapDocToNote } from "@/hooks/useRecentNotes";

jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({ db: {} }));
jest.mock("@/stores/authStore");
jest.mock("@/hooks/useRecentNotes", () => ({
    mapDocToNote: jest.fn(),
}));

const makeDoc = (id: string, title: string) => ({
    id,
    data: () => ({ title }),
});

const makeNote = (id: string, title: string) => ({
    id,
    title,
    content: "",
    excerpt: "",
    tags: [],
    aiTags: [],
    folderId: null,
    summary: null,
    flashcards: null,
    isPinned: false,
    isArchived: false,
    sourceFile: null,
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    viewedAt: new Date(),
});

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

describe("fetchNotes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("collRef");
        (query as jest.Mock).mockReturnValue("queryRef");
        (orderBy as jest.Mock).mockReturnValue("orderByClause");
        (where as jest.Mock).mockReturnValue("whereClause");
    });

    it("fetches notes ordered by updatedAt by default", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
        await fetchNotes("user-1");
        expect(where).toHaveBeenCalledWith("isArchived", "==", false);
        expect(orderBy).toHaveBeenCalledWith("updatedAt", "desc");
    });

    it("adds folderId filter when folderId is provided", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
        await fetchNotes("user-1", { folderId: "folder-abc" });
        expect(where).toHaveBeenCalledWith("folderId", "==", "folder-abc");
    });

    it("orders by title asc when sort is title", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
        await fetchNotes("user-1", { sort: "title" });
        expect(orderBy).toHaveBeenCalledWith("title", "asc");
    });

    it("orders by createdAt desc when sort is createdAt", async () => {
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
        await fetchNotes("user-1", { sort: "createdAt" });
        expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
    });

    it("maps each document through mapDocToNote", async () => {
        const doc = makeDoc("n1", "Note 1");
        const note = makeNote("n1", "Note 1");
        (getDocs as jest.Mock).mockResolvedValue({ docs: [doc] });
        (mapDocToNote as jest.Mock).mockReturnValue(note);

        const result = await fetchNotes("user-1");

        expect(mapDocToNote).toHaveBeenCalledWith(doc, 0, [doc]);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(note);
    });
});

describe("useNotes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (collection as jest.Mock).mockReturnValue("collRef");
        (query as jest.Mock).mockReturnValue("queryRef");
        (orderBy as jest.Mock).mockReturnValue("orderByClause");
        (where as jest.Mock).mockReturnValue("whereClause");
    });

    it("fetches notes when user is authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        const note = makeNote("n1", "Alpha");
        (getDocs as jest.Mock).mockResolvedValue({ docs: [makeDoc("n1", "Alpha")] });
        (mapDocToNote as jest.Mock).mockReturnValue(note);

        const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data[0]!.title).toBe("Alpha");
    });

    it("is disabled when user is not authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toHaveLength(0);
        expect(getDocs).not.toHaveBeenCalled();
    });

    it("filters notes by search term on title", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        const noteA = makeNote("n1", "React Hooks");
        const noteB = makeNote("n2", "TypeScript");
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [makeDoc("n1", "React Hooks"), makeDoc("n2", "TypeScript")],
        });
        (mapDocToNote as jest.Mock)
            .mockReturnValueOnce(noteA)
            .mockReturnValueOnce(noteB);

        const { result } = renderHook(() => useNotes({ search: "react" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data[0]!.title).toBe("React Hooks");
    });

    it("filters notes by search term on excerpt", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        const note = { ...makeNote("n1", "Note"), excerpt: "hooks explained" };
        (getDocs as jest.Mock).mockResolvedValue({ docs: [makeDoc("n1", "Note")] });
        (mapDocToNote as jest.Mock).mockReturnValue(note);

        const { result } = renderHook(() => useNotes({ search: "hooks" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toHaveLength(1);
    });

    it("filters notes by search term on tags", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        const note = { ...makeNote("n1", "Note"), tags: ["javascript"] };
        (getDocs as jest.Mock).mockResolvedValue({ docs: [makeDoc("n1", "Note")] });
        (mapDocToNote as jest.Mock).mockReturnValue(note);

        const { result } = renderHook(() => useNotes({ search: "JavaScript" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toHaveLength(1);
    });

    it("returns all notes when search is empty", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
        const noteA = makeNote("n1", "Alpha");
        const noteB = makeNote("n2", "Beta");
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [makeDoc("n1", "Alpha"), makeDoc("n2", "Beta")],
        });
        (mapDocToNote as jest.Mock)
            .mockReturnValueOnce(noteA)
            .mockReturnValueOnce(noteB);

        const { result } = renderHook(() => useNotes({ search: "" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toHaveLength(2);
    });
});
