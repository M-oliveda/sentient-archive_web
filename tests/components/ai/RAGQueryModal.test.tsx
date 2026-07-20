import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RAGQueryModal } from "@/components/ai/RAGQueryModal";

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockRagQueryMutate = jest.fn();

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useAINoteActions");
jest.mock("@/components/ui/dialog", () => ({
    Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DialogContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-content">{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

import { useAuthStore } from "@/stores/authStore";
import { useAINoteActions } from "@/hooks/useAINoteActions";

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupMocks({
    tokenBalance = 10,
    ragQueryPending = false,
    ragQueryError = null as string | null,
    ragQueryIsSuccess = false,
} = {}) {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { uid: "user-1", tokenBalance },
    });
    (useAINoteActions as jest.Mock).mockReturnValue({
        ragQuery: {
            mutate: mockRagQueryMutate,
            isPending: ragQueryPending,
            isSuccess: ragQueryIsSuccess,
            isError: !!ragQueryError,
            error: ragQueryError ? new Error(ragQueryError) : null,
            data: null,
        },
    });
}

function renderModal(props: { open?: boolean; onOpenChange?: jest.Mock } = {}) {
    const { open = true, onOpenChange = jest.fn() } = props;
    return render(
        <RAGQueryModal noteId="note-1" open={open} onOpenChange={onOpenChange} />,
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe("RAGQueryModal rendering", () => {
    it("renders the modal title", () => {
        renderModal();
        expect(screen.getByText("Knowledge Q&A")).toBeInTheDocument();
    });

    it("renders the description text", () => {
        renderModal();
        expect(screen.getByText(/search across all your notes/i)).toBeInTheDocument();
    });

    it("renders the question textarea", () => {
        renderModal();
        expect(screen.getByTestId("question-input")).toBeInTheDocument();
    });

    it("renders the Ask button with token cost when balance is sufficient", () => {
        renderModal();
        expect(
            screen.getByRole("button", { name: /ask \(4 tokens\)/i }),
        ).toBeInTheDocument();
    });

    it("renders 'Not enough tokens' when balance is below 4", () => {
        setupMocks({ tokenBalance: 3 });
        renderModal();
        const btn = screen.getByTestId("ask-button");
        expect(btn).toHaveTextContent(/not enough tokens/i);
        expect(btn).toBeDisabled();
    });

    it("handles null user by defaulting token balance to 0", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
        });
        renderModal();
        const btn = screen.getByTestId("ask-button");
        expect(btn).toHaveTextContent(/not enough tokens/i);
        expect(btn).toBeDisabled();
    });

    it("handles undefined tokenBalance by defaulting to 0", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1", tokenBalance: undefined },
        });
        renderModal();
        const btn = screen.getByTestId("ask-button");
        expect(btn).toHaveTextContent(/not enough tokens/i);
        expect(btn).toBeDisabled();
    });
});

// ── Interaction ───────────────────────────────────────────────────────────────

describe("RAGQueryModal interaction", () => {
    it("Ask button is disabled when question is empty", () => {
        renderModal();
        expect(screen.getByTestId("ask-button")).toBeDisabled();
    });

    it("Ask button is enabled once the user types a question", () => {
        renderModal();
        fireEvent.change(screen.getByTestId("question-input"), {
            target: { value: "What is the capital of France?" },
        });
        expect(screen.getByTestId("ask-button")).not.toBeDisabled();
    });

    it("calls ragQuery.mutate with the trimmed question on click", () => {
        renderModal();
        fireEvent.change(screen.getByTestId("question-input"), {
            target: { value: "  What is TanStack Query?  " },
        });
        fireEvent.click(screen.getByTestId("ask-button"));
        expect(mockRagQueryMutate).toHaveBeenCalledWith(
            "What is TanStack Query?",
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("does not call mutate when the question is empty whitespace", () => {
        renderModal();
        fireEvent.change(screen.getByTestId("question-input"), {
            target: { value: "   " },
        });
        const button = screen.getByTestId("ask-button");
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(mockRagQueryMutate).not.toHaveBeenCalled();
    });

    it("does not call mutate on Ctrl+Enter when the question is empty whitespace", () => {
        renderModal();
        const textarea = screen.getByTestId("question-input");
        fireEvent.change(textarea, { target: { value: "   " } });
        fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
        expect(mockRagQueryMutate).not.toHaveBeenCalled();
    });

    it("trims question before submission", () => {
        renderModal();
        fireEvent.change(screen.getByTestId("question-input"), {
            target: { value: "  What is Vue?  " },
        });
        fireEvent.click(screen.getByTestId("ask-button"));
        expect(mockRagQueryMutate).toHaveBeenCalledWith(
            "What is Vue?",
            expect.any(Object),
        );
    });

    it("submits on Ctrl+Enter keyboard shortcut", () => {
        renderModal();
        const textarea = screen.getByTestId("question-input");
        fireEvent.change(textarea, { target: { value: "My question" } });
        fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
        expect(mockRagQueryMutate).toHaveBeenCalled();
    });

    it("does not submit on Enter without Ctrl/Meta", () => {
        renderModal();
        const textarea = screen.getByTestId("question-input");
        fireEvent.change(textarea, { target: { value: "My question" } });
        fireEvent.keyDown(textarea, { key: "Enter" });
        expect(mockRagQueryMutate).not.toHaveBeenCalled();
    });

    it("displays the answer when onSuccess fires", () => {
        renderModal();
        fireEvent.change(screen.getByTestId("question-input"), {
            target: { value: "What is React?" },
        });
        fireEvent.click(screen.getByTestId("ask-button"));

        const { onSuccess } = (mockRagQueryMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        act(() => {
            onSuccess({
                success: true,
                data: { answer: "React is a UI library.", tokensUsed: 4, tokenCost: 4 },
            });
        });

        expect(screen.getByTestId("answer-content")).toHaveTextContent(
            "React is a UI library.",
        );
    });

    it("clears the answer when the user types a new question", () => {
        renderModal();
        const textarea = screen.getByTestId("question-input");
        fireEvent.change(textarea, { target: { value: "What is React?" } });
        fireEvent.click(screen.getByTestId("ask-button"));

        const { onSuccess } = (mockRagQueryMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        act(() => {
            onSuccess({
                success: true,
                data: { answer: "React is a UI library.", tokensUsed: 4, tokenCost: 4 },
            });
        });

        expect(screen.getByTestId("answer-content")).toBeInTheDocument();

        fireEvent.change(textarea, { target: { value: "What is Vue?" } });

        expect(screen.queryByTestId("answer-content")).not.toBeInTheDocument();
    });
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe("RAGQueryModal loading state", () => {
    it("shows 'Searching your notes…' and disables the button while pending", () => {
        setupMocks({ ragQueryPending: true });
        renderModal();
        const btn = screen.getByTestId("ask-button");
        expect(btn).toHaveTextContent(/searching your notes/i);
        expect(btn).toBeDisabled();
    });

    it("shows the loading spinner while pending", () => {
        setupMocks({ ragQueryPending: true });
        renderModal();
        expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    });
});

// ── Error state ───────────────────────────────────────────────────────────────

describe("RAGQueryModal error state", () => {
    it("shows a friendly rate-limit error message", () => {
        setupMocks({
            ragQueryError: "RAG query failed: [429 Too Many Requests] credits depleted",
        });
        renderModal();
        expect(screen.getByTestId("error-message")).toHaveTextContent(
            "AI service is temporarily unavailable. Please try again later.",
        );
    });

    it("shows a generic error message on other failures", () => {
        setupMocks({ ragQueryError: "Unknown server error" });
        renderModal();
        expect(screen.getByTestId("error-message")).toHaveTextContent(
            "Something went wrong. Please try again.",
        );
    });

    it("does not show an error message when there is no error", () => {
        renderModal();
        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });
});

// ── Modal lifecycle ────────────────────────────────────────────────────────────

describe("RAGQueryModal lifecycle", () => {
    it("clears question and answer when modal closes", () => {
        const { rerender } = render(
            <RAGQueryModal noteId="note-1" open={true} onOpenChange={jest.fn()} />,
        );
        const textarea = screen.getByTestId("question-input");

        fireEvent.change(textarea, { target: { value: "What is React?" } });
        fireEvent.click(screen.getByTestId("ask-button"));

        const { onSuccess } = (mockRagQueryMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        act(() => {
            onSuccess({
                success: true,
                data: { answer: "React is a UI library.", tokensUsed: 4, tokenCost: 4 },
            });
        });

        expect(screen.getByTestId("answer-content")).toBeInTheDocument();
        expect(textarea).toHaveValue("What is React?");

        rerender(
            <RAGQueryModal noteId="note-1" open={false} onOpenChange={jest.fn()} />,
        );

        rerender(
            <RAGQueryModal noteId="note-1" open={true} onOpenChange={jest.fn()} />,
        );

        const newTextarea = screen.getByTestId("question-input");
        expect(newTextarea).toHaveValue("");
        expect(screen.queryByTestId("answer-content")).not.toBeInTheDocument();
    });

    it("submits on Meta+Enter keyboard shortcut (macOS)", () => {
        renderModal();
        const textarea = screen.getByTestId("question-input");
        fireEvent.change(textarea, { target: { value: "My question" } });
        fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
        expect(mockRagQueryMutate).toHaveBeenCalled();
    });
});
