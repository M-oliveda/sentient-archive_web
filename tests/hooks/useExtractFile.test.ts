import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExtractFile } from "@/hooks/useExtractFile";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/lib/api-client");

const EXTRACT_RESPONSE = {
    success: true,
    data: {
        noteId: "note-extracted",
        title: "Extracted Note",
        content: "Extracted content",
        excerpt: "Excerpt",
        sourceFile: { name: "doc.pdf", type: "pdf", size: 1024, extractedAt: "" },
        createdAt: "",
    },
    timestamp: "",
};

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

describe("useExtractFile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (apiRequest as jest.Mock).mockResolvedValue(EXTRACT_RESPONSE);
    });

    it("calls apiRequest with multipart form data on the extract endpoint", async () => {
        const { result } = renderHook(() => useExtractFile(), {
            wrapper: createWrapper(),
        });

        const file = new File(["content"], "doc.pdf", { type: "application/pdf" });
        result.current.mutate(file);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/notes/extract",
            expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
        );

        const formData = (apiRequest as jest.Mock).mock.calls[0][1].body as FormData;
        expect(formData.get("file")).toBe(file);
    });

    it("returns the extract response on success", async () => {
        const { result } = renderHook(() => useExtractFile(), {
            wrapper: createWrapper(),
        });

        const file = new File(["pdf content"], "report.pdf", {
            type: "application/pdf",
        });
        result.current.mutate(file);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(EXTRACT_RESPONSE);
    });

    it("exposes error when apiRequest rejects", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("Server error"));

        const { result } = renderHook(() => useExtractFile(), {
            wrapper: createWrapper(),
        });

        const file = new File(["x"], "x.pdf", { type: "application/pdf" });
        result.current.mutate(file);

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(new Error("Server error"));
    });
});
