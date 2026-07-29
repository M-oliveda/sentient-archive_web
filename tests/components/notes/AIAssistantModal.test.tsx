import { render, screen, fireEvent, within } from "@testing-library/react";
import { AIAssistantModal, TokenBadge } from "@/components/notes/AIAssistantModal";
import type { INote } from "@/types/note";

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockSummarizeMutate = jest.fn();
const mockAutoTagMutate = jest.fn();
const mockFlashcardsMutate = jest.fn();
const mockUpdateNoteMutate = jest.fn();

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useAINoteActions");
jest.mock("@/hooks/useNotesMutations", () => ({
    useUpdateNote: jest.fn(),
}));
jest.mock("@/hooks/useClientConfig", () => ({
    useClientConfig: jest.fn(),
}));
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
jest.mock("@/components/ai/RAGQueryModal", () => ({
    RAGQueryModal: ({
        open,
        onOpenChange,
    }: {
        open: boolean;
        onOpenChange: (v: boolean) => void;
    }) => (
        <div data-testid="rag-query-modal" data-open={String(open)}>
            <button onClick={() => onOpenChange(false)}>Close Q&A</button>
        </div>
    ),
}));

import { useAuthStore } from "@/stores/authStore";
import { useAINoteActions } from "@/hooks/useAINoteActions";
import { useUpdateNote } from "@/hooks/useNotesMutations";
import { useClientConfig } from "@/hooks/useClientConfig";
import { DEFAULT_FEATURE_FLAGS, DEFAULT_TOKEN_COSTS } from "@/types/config";
import type { IFeatureFlags } from "@/types/config";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNote(overrides: Partial<INote> = {}): INote {
    return {
        id: "note-1",
        userId: "user-1",
        title: "Test Note",
        content: "Content here",
        excerpt: "Excerpt",
        tags: ["existing"],
        aiTags: [],
        folderId: null,
        summary: null,
        flashcards: null,
        isPinned: false,
        isArchived: false,
        sourceFile: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-06-01"),
        viewedAt: new Date("2024-06-01"),
        ...overrides,
    };
}

function setupMocks({
    tokenBalance = 10,
    summarizePending = false,
    summarizeError = null as string | null,
    autoTagPending = false,
    autoTagError = null as string | null,
    flashcardsPending = false,
    flashcardsError = null as string | null,
    updateNotePending = false,
    features = DEFAULT_FEATURE_FLAGS,
} = {}) {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { uid: "user-1", tokenBalance },
    });
    (useClientConfig as jest.Mock).mockReturnValue({
        features,
        tokenCosts: DEFAULT_TOKEN_COSTS,
        isLoading: false,
        isError: false,
        data: { features, tokens: { costs: DEFAULT_TOKEN_COSTS } },
    });
    (useAINoteActions as jest.Mock).mockReturnValue({
        summarize: {
            mutate: mockSummarizeMutate,
            isPending: summarizePending,
            error: summarizeError ? new Error(summarizeError) : null,
        },
        autoTag: {
            mutate: mockAutoTagMutate,
            isPending: autoTagPending,
            error: autoTagError ? new Error(autoTagError) : null,
        },
        flashcards: {
            mutate: mockFlashcardsMutate,
            isPending: flashcardsPending,
            error: flashcardsError ? new Error(flashcardsError) : null,
        },
        ragQuery: {
            mutate: jest.fn(),
            isPending: false,
            isSuccess: false,
            isError: false,
            error: null,
            data: null,
        },
    });
    (useUpdateNote as jest.Mock).mockReturnValue({
        mutate: mockUpdateNoteMutate,
        isPending: updateNotePending,
    });
}

function renderModal(
    note: INote,
    {
        onOpenChange = jest.fn(),
        onInsertAtStart = jest.fn(),
        onAppendContent = jest.fn(),
    }: {
        onOpenChange?: jest.Mock;
        onInsertAtStart?: jest.Mock;
        onAppendContent?: jest.Mock;
    } = {},
) {
    return render(
        <AIAssistantModal
            note={note}
            open={true}
            onOpenChange={onOpenChange}
            onInsertAtStart={onInsertAtStart}
            onAppendContent={onAppendContent}
        />,
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
});

// ── Header ────────────────────────────────────────────────────────────────────

describe("AIAssistantModal header", () => {
    it("renders 'AI Assistant' title", () => {
        renderModal(makeNote());
        expect(screen.getByText("assistant.title")).toBeInTheDocument();
    });

    it("falls back to 0 token balance when user is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        renderModal(makeNote());
        expect(screen.getByText("assistant.title")).toBeInTheDocument();
    });
});

describe("TokenBadge", () => {
    it("uses singular 'token' for a count of 1", () => {
        render(<TokenBadge count={1} />);
        expect(screen.getByText("assistant.token")).toBeInTheDocument();
    });

    it("uses plural 'tokens' for counts other than 1", () => {
        render(<TokenBadge count={5} />);
        expect(screen.getByText("assistant.tokens")).toBeInTheDocument();
    });
});

// ── Summary card ──────────────────────────────────────────────────────────────

describe("SummaryCard – no summary", () => {
    it("shows 'Generate Summary' when user can afford it", () => {
        renderModal(makeNote({ summary: null }));
        expect(
            screen.getByRole("button", { name: /assistant\.summary\.generate/i }),
        ).toBeInTheDocument();
    });

    it("calls summarize.mutate when the generate button is clicked", () => {
        renderModal(makeNote({ summary: null }));
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.summary\.generate/i }),
        );
        expect(mockSummarizeMutate).toHaveBeenCalledTimes(1);
    });

    it("shows 'Not enough tokens' and disables the button when balance is too low", () => {
        setupMocks({ tokenBalance: 1 });
        renderModal(makeNote({ summary: null }));
        const disabledBtns = screen
            .getAllByRole("button", { name: /assistant\.notEnoughTokens/i })
            .filter((b) => b.hasAttribute("disabled"));
        expect(disabledBtns.length).toBeGreaterThan(0);
        expect(disabledBtns[0]).toBeDisabled();
    });

    it("shows spinner and disables button while pending", () => {
        setupMocks({ summarizePending: true });
        renderModal(makeNote({ summary: null }));
        expect(screen.getByLabelText("Loading")).toBeInTheDocument();
        expect(
            screen.getByText("assistant.generating").closest("button"),
        ).toBeDisabled();
    });

    it("shows a friendly rate-limit message when the AI service is unavailable", () => {
        setupMocks({
            summarizeError:
                "Summarization failed: [GoogleGenerativeAI Error]: [429 Too Many Requests] credits depleted",
        });
        renderModal(makeNote({ summary: null }));
        expect(screen.getByText("assistant.errors.unavailable")).toBeInTheDocument();
    });

    it("shows a generic error message on other failures", () => {
        setupMocks({ summarizeError: "Summarization failed" });
        renderModal(makeNote({ summary: null }));
        expect(screen.getByText("assistant.errors.generic")).toBeInTheDocument();
    });
});

describe("SummaryCard – with summary", () => {
    it("renders the summary text", () => {
        renderModal(makeNote({ summary: "A great summary." }));
        expect(screen.getByText("A great summary.")).toBeInTheDocument();
    });

    it("shows the 'Insert at top' button when summary exists", () => {
        renderModal(makeNote({ summary: "A great summary." }));
        expect(
            screen.getByRole("button", { name: /assistant\.summary\.insert/i }),
        ).toBeInTheDocument();
    });

    it("calls onInsertAtStart with markdown-formatted summary and closes modal", () => {
        const onInsertAtStart = jest.fn();
        const onOpenChange = jest.fn();
        renderModal(makeNote({ summary: "A great summary." }), {
            onInsertAtStart,
            onOpenChange,
        });
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.summary\.insert/i }),
        );
        expect(onInsertAtStart).toHaveBeenCalledWith(
            "## assistant.summary.markdownHeading\n\nA great summary.\n\n---\n\n",
        );
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not throw when onInsertAtStart is not provided and Insert is clicked", () => {
        render(
            <AIAssistantModal
                note={makeNote({ summary: "A great summary." })}
                open={true}
                onOpenChange={jest.fn()}
            />,
        );
        expect(() =>
            fireEvent.click(
                screen.getByRole("button", { name: /assistant\.summary\.insert/i }),
            ),
        ).not.toThrow();
    });
});

// ── Suggested Tags card ───────────────────────────────────────────────────────

describe("SuggestedTagsCard – no AI tags", () => {
    it("shows 'Generate Tags' when user can afford it", () => {
        renderModal(makeNote({ aiTags: [] }));
        expect(
            screen.getByRole("button", { name: /assistant\.tags\.generate/i }),
        ).toBeInTheDocument();
    });

    it("calls autoTag.mutate with an onSuccess handler when Generate Tags is clicked", () => {
        renderModal(makeNote({ aiTags: [] }));
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.tags\.generate/i }),
        );
        expect(mockAutoTagMutate).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("shows 'Not enough tokens' and disables when balance is too low", () => {
        setupMocks({ tokenBalance: 0 });
        renderModal(makeNote({ aiTags: [] }));
        const btns = screen.getAllByRole("button", {
            name: /assistant\.notEnoughTokens/i,
        });
        expect(btns[0]).toBeDisabled();
    });

    it("shows spinner while autoTag is pending", () => {
        setupMocks({ autoTagPending: true });
        renderModal(makeNote({ aiTags: [] }));
        expect(screen.getAllByLabelText("Loading").length).toBeGreaterThan(0);
    });

    it("disables the tags button and shows spinner while updateNote is pending", () => {
        setupMocks({ updateNotePending: true });
        renderModal(makeNote({ aiTags: [] }));
        // When isTagsPending is true the button shows "Generating…" not "Generate Tags"
        const btn = screen.getByText("assistant.generating").closest("button");
        expect(btn).toBeDisabled();
    });

    it("shows a friendly error message on failure", () => {
        setupMocks({ autoTagError: "Tagging failed" });
        renderModal(makeNote({ aiTags: [] }));
        expect(screen.getByText("assistant.errors.generic")).toBeInTheDocument();
    });
});

describe("SuggestedTagsCard – auto-apply on success", () => {
    it("calls updateNote.mutate with merged tags when onSuccess fires", () => {
        renderModal(makeNote({ aiTags: [], tags: ["existing"] }));
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.tags\.generate/i }),
        );

        const { onSuccess } = (mockAutoTagMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        onSuccess({ success: true, data: { tags: ["react", "typescript"] } });

        expect(mockUpdateNoteMutate).toHaveBeenCalledWith(
            {
                noteId: "note-1",
                tags: expect.arrayContaining(["existing", "react", "typescript"]),
            },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("deduplicates tags when merging", () => {
        renderModal(makeNote({ aiTags: [], tags: ["existing", "react"] }));
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.tags\.generate/i }),
        );

        const { onSuccess } = (mockAutoTagMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        onSuccess({ success: true, data: { tags: ["react", "typescript"] } });

        const mergedTags = (mockUpdateNoteMutate as jest.Mock).mock.calls[0][0]
            .tags as string[];
        const reactCount = mergedTags.filter((t) => t === "react").length;
        expect(reactCount).toBe(1);
    });

    it("closes the modal after updateNote succeeds", () => {
        const onOpenChange = jest.fn();
        renderModal(makeNote({ aiTags: [], tags: ["existing"] }), { onOpenChange });
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.tags\.generate/i }),
        );

        const { onSuccess: autoTagSuccess } = (mockAutoTagMutate as jest.Mock).mock
            .calls[0][1] as { onSuccess: (data: unknown) => void };
        autoTagSuccess({ success: true, data: { tags: ["react"] } });

        const { onSuccess: updateNoteSuccess } = (mockUpdateNoteMutate as jest.Mock)
            .mock.calls[0][1] as { onSuccess: () => void };
        updateNoteSuccess();

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});

describe("SuggestedTagsCard – with AI tags", () => {
    it("renders each AI tag as a chip", () => {
        renderModal(makeNote({ aiTags: ["react", "typescript"] }));
        expect(screen.getByText("#react")).toBeInTheDocument();
        expect(screen.getByText("#typescript")).toBeInTheDocument();
    });

    it("shows 'Regenerate Tags' when AI tags already exist", () => {
        renderModal(makeNote({ aiTags: ["react"] }));
        expect(
            screen.getByRole("button", { name: /assistant\.tags\.regenerate/i }),
        ).toBeInTheDocument();
    });

    it("shows 'Regenerating…' spinner while pending with existing tags", () => {
        setupMocks({ autoTagPending: true });
        renderModal(makeNote({ aiTags: ["react"] }));
        expect(screen.getByText("assistant.regenerating")).toBeInTheDocument();
    });
});

// ── Generate Flashcards card ──────────────────────────────────────────────────

describe("GenerateFlashcardsCard", () => {
    it("shows 'Generate (8 tokens)' when no flashcards exist", () => {
        renderModal(makeNote({ flashcards: null }));
        expect(
            screen.getByRole("button", { name: /assistant\.flashcards\.withCost/i }),
        ).toBeInTheDocument();
    });

    it("shows 'Regenerate (8 tokens)' when flashcards already exist", () => {
        renderModal(makeNote({ flashcards: [{ front: "Q", back: "A" }] }));
        expect(
            screen.getByRole("button", { name: /assistant\.flashcards\.withCost/i }),
        ).toBeInTheDocument();
    });

    it("calls flashcards.mutate with onSuccess handler when generate is clicked", () => {
        renderModal(makeNote());
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.flashcards\.withCost/i }),
        );
        expect(mockFlashcardsMutate).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("calls onAppendContent with formatted flashcards markdown on success", () => {
        const onAppendContent = jest.fn();
        renderModal(makeNote(), { onAppendContent });
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.flashcards\.withCost/i }),
        );

        const { onSuccess } = (mockFlashcardsMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        onSuccess({
            success: true,
            data: { flashcards: [{ front: "What is React?", back: "A UI library." }] },
        });

        expect(onAppendContent).toHaveBeenCalledTimes(1);
        const calledWith = (onAppendContent as jest.Mock).mock.calls[0][0] as string;
        expect(calledWith).toContain("assistant.flashcards.markdownHeading");
        expect(calledWith).toContain("What is React?");
        expect(calledWith).toContain("A UI library.");
    });

    it("does not throw when onAppendContent is not provided and flashcards succeed", () => {
        render(
            <AIAssistantModal note={makeNote()} open={true} onOpenChange={jest.fn()} />,
        );
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.flashcards\.withCost/i }),
        );
        const { onSuccess } = (mockFlashcardsMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        expect(() =>
            onSuccess({
                success: true,
                data: { flashcards: [{ front: "Q", back: "A" }] },
            }),
        ).not.toThrow();
    });

    it("closes the modal after flashcards are appended", () => {
        const onOpenChange = jest.fn();
        renderModal(makeNote(), { onOpenChange });
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.flashcards\.withCost/i }),
        );

        const { onSuccess } = (mockFlashcardsMutate as jest.Mock).mock.calls[0][1] as {
            onSuccess: (data: unknown) => void;
        };
        onSuccess({
            success: true,
            data: { flashcards: [{ front: "Q", back: "A" }] },
        });

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows 'Not enough tokens' and disables when balance is too low", () => {
        setupMocks({ tokenBalance: 2 });
        renderModal(makeNote());
        const flashcardsCard = screen.getByTestId("flashcards-card");
        const btn = within(flashcardsCard).getByRole("button", {
            name: /assistant\.notEnoughTokens/i,
        });
        expect(btn).toBeDisabled();
    });

    it("shows spinner while flashcards mutation is pending", () => {
        setupMocks({ flashcardsPending: true });
        renderModal(makeNote());
        expect(screen.getAllByLabelText("Loading").length).toBeGreaterThan(0);
    });

    it("shows a friendly error message on failure", () => {
        setupMocks({ flashcardsError: "Flashcard generation failed" });
        renderModal(makeNote());
        expect(screen.getByText("assistant.errors.generic")).toBeInTheDocument();
    });
});

// ── Knowledge Q&A card ────────────────────────────────────────────────────────

describe("KnowledgeQACard", () => {
    it("renders the card with 'Ask a Question' button when balance is sufficient", () => {
        renderModal(makeNote());
        expect(
            screen.getByRole("button", { name: /assistant\.knowledgeQA\.ask/i }),
        ).toBeInTheDocument();
    });

    it("shows 'Not enough tokens' when balance is below 10", () => {
        setupMocks({ tokenBalance: 3 });
        renderModal(makeNote());
        const qaCard = screen.getByTestId("knowledge-qa-card");
        const btn = within(qaCard).getByRole("button", {
            name: /assistant\.notEnoughTokens/i,
        });
        expect(btn).toBeDisabled();
    });

    it("opens the RAGQueryModal when Ask a Question is clicked", () => {
        renderModal(makeNote());
        const modal = screen.getByTestId("rag-query-modal");
        expect(modal).toHaveAttribute("data-open", "false");

        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.knowledgeQA\.ask/i }),
        );

        expect(modal).toHaveAttribute("data-open", "true");
    });

    it("closes the RAGQueryModal via its onOpenChange callback", () => {
        renderModal(makeNote());
        fireEvent.click(
            screen.getByRole("button", { name: /assistant\.knowledgeQA\.ask/i }),
        );
        expect(screen.getByTestId("rag-query-modal")).toHaveAttribute(
            "data-open",
            "true",
        );

        fireEvent.click(screen.getByRole("button", { name: /close q&a/i }));

        expect(screen.getByTestId("rag-query-modal")).toHaveAttribute(
            "data-open",
            "false",
        );
    });
});

describe("AIAssistantModal feature flags", () => {
    it("hides flashcards when flashcardsEnabled is false", () => {
        setupMocks({
            features: {
                ...DEFAULT_FEATURE_FLAGS,
                flashcardsEnabled: false,
            } satisfies IFeatureFlags,
        });
        renderModal(makeNote());

        expect(screen.queryByTestId("flashcards-card")).not.toBeInTheDocument();
        expect(screen.getByText("assistant.summary.title")).toBeInTheDocument();
        expect(screen.getByTestId("knowledge-qa-card")).toBeInTheDocument();
    });

    it("hides all AI cards when every feature is disabled", () => {
        setupMocks({
            features: {
                summarizeEnabled: false,
                autoTagEnabled: false,
                flashcardsEnabled: false,
                ragQueryEnabled: false,
                fileExtractionEnabled: true,
            },
        });
        renderModal(makeNote());

        expect(screen.getByTestId("no-ai-features")).toBeInTheDocument();
        expect(screen.queryByText("assistant.summary.title")).not.toBeInTheDocument();
        expect(screen.queryByTestId("flashcards-card")).not.toBeInTheDocument();
        expect(screen.queryByTestId("knowledge-qa-card")).not.toBeInTheDocument();
    });
});
