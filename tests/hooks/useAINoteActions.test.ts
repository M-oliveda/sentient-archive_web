import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAINoteActions } from "@/hooks/useAINoteActions";
import { useAuthStore } from "@/stores/authStore";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/stores/authStore");
jest.mock("@/lib/api-client");

const mockInvalidateQueries = jest.fn();

jest.mock("@tanstack/react-query", () => {
    const actual = jest.requireActual("@tanstack/react-query") as Record<
        string,
        unknown
    >;
    return {
        ...actual,
        useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
    };
});

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

beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { uid: "user-1" },
    });
});

describe("useAINoteActions – summarize", () => {
    it("calls the summarize endpoint with the note id", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ success: true, data: {} });

        const { result } = renderHook(() => useAINoteActions("note-123"), {
            wrapper: createWrapper(),
        });

        result.current.summarize.mutate();

        await waitFor(() => expect(result.current.summarize.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/ai/summarize", {
            method: "POST",
            body: JSON.stringify({ noteId: "note-123" }),
        });
    });

    it("invalidates the note detail query on success", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ success: true, data: {} });

        const { result } = renderHook(() => useAINoteActions("note-123"), {
            wrapper: createWrapper(),
        });

        result.current.summarize.mutate();

        await waitFor(() => expect(result.current.summarize.isSuccess).toBe(true));

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["notes", "detail", "user-1", "note-123"],
        });
    });

    it("enters error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("API error"));

        const { result } = renderHook(() => useAINoteActions("note-123"), {
            wrapper: createWrapper(),
        });

        result.current.summarize.mutate();

        await waitFor(() => expect(result.current.summarize.isError).toBe(true));
    });
});

describe("useAINoteActions – autoTag", () => {
    it("calls the autoTag endpoint with the note id", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ success: true, data: {} });

        const { result } = renderHook(() => useAINoteActions("note-456"), {
            wrapper: createWrapper(),
        });

        result.current.autoTag.mutate();

        await waitFor(() => expect(result.current.autoTag.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/ai/autoTag", {
            method: "POST",
            body: JSON.stringify({ noteId: "note-456" }),
        });
    });

    it("invalidates the note detail query on success", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ success: true, data: {} });

        const { result } = renderHook(() => useAINoteActions("note-456"), {
            wrapper: createWrapper(),
        });

        result.current.autoTag.mutate();

        await waitFor(() => expect(result.current.autoTag.isSuccess).toBe(true));

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["notes", "detail", "user-1", "note-456"],
        });
    });

    it("enters error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("API error"));

        const { result } = renderHook(() => useAINoteActions("note-456"), {
            wrapper: createWrapper(),
        });

        result.current.autoTag.mutate();

        await waitFor(() => expect(result.current.autoTag.isError).toBe(true));
    });
});

describe("useAINoteActions – flashcards", () => {
    it("calls the flashcards endpoint with the note id", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ success: true, data: {} });

        const { result } = renderHook(() => useAINoteActions("note-789"), {
            wrapper: createWrapper(),
        });

        result.current.flashcards.mutate();

        await waitFor(() => expect(result.current.flashcards.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/ai/flashcards", {
            method: "POST",
            body: JSON.stringify({ noteId: "note-789" }),
        });
    });

    it("invalidates the note detail query on success", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({ success: true, data: {} });

        const { result } = renderHook(() => useAINoteActions("note-789"), {
            wrapper: createWrapper(),
        });

        result.current.flashcards.mutate();

        await waitFor(() => expect(result.current.flashcards.isSuccess).toBe(true));

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["notes", "detail", "user-1", "note-789"],
        });
    });

    it("enters error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("API error"));

        const { result } = renderHook(() => useAINoteActions("note-789"), {
            wrapper: createWrapper(),
        });

        result.current.flashcards.mutate();

        await waitFor(() => expect(result.current.flashcards.isError).toBe(true));
    });
});
