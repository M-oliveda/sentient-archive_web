import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NoteDetailPage } from "@/pages/dashboard/NoteDetailPage";
import type { INote } from "@/types/note";

const mockNavigate = jest.fn();

jest.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}));

const mockUseNote = jest.fn();
const mockUseFolders = jest.fn();

jest.mock("@/hooks/useNote", () => ({
    useNote: (id: string) => mockUseNote(id),
}));

jest.mock("@/hooks/useFolders", () => ({
    useFolders: () => mockUseFolders(),
}));

jest.mock("nuqs", () => ({
    useQueryState: jest.fn((key: string) => {
        if (key === "edit") return [null, jest.fn()];
        return [null, jest.fn()];
    }),
}));

import { useQueryState } from "nuqs";

jest.mock("@/lib/notes-utils", () => ({
    countWords: () => 150,
}));

const mockPrependContent = jest.fn();
const mockAppendContent = jest.fn();
let mockEditorShouldSetRef = true;

jest.mock("@/components/notes/NoteEditor", () => ({
    NoteEditor: ({
        noteId,
        onBack,
        onToggleAI,
        onDeleted,
        editorHandleRef,
    }: {
        noteId: string;
        onBack?: () => void;
        onToggleAI?: () => void;
        onDeleted: () => void;
        editorHandleRef?: { current: unknown };
    }) => {
        if (mockEditorShouldSetRef && editorHandleRef) {
            editorHandleRef.current = {
                prependContent: mockPrependContent,
                appendContent: mockAppendContent,
            };
        }
        return (
            <div data-testid="note-editor">
                <span data-testid="editor-note-id">{noteId}</span>
                {onBack && <button onClick={onBack}>Back</button>}
                {onToggleAI && <button onClick={onToggleAI}>Toggle AI</button>}
                <button onClick={onDeleted}>Delete</button>
            </div>
        );
    },
}));

jest.mock("@/components/notes/AIAssistantModal", () => ({
    AIAssistantModal: ({
        open,
        onOpenChange,
        onInsertAtStart,
        onAppendContent,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onInsertAtStart?: (text: string) => void;
        onAppendContent?: (text: string) => void;
    }) =>
        open ? (
            <div data-testid="ai-assistant-modal">
                <button onClick={() => onOpenChange(false)}>Close AI</button>
                <button onClick={() => onInsertAtStart?.("summary-text")}>
                    Trigger Insert
                </button>
                <button onClick={() => onAppendContent?.("flashcard-text")}>
                    Trigger Append
                </button>
            </div>
        ) : null,
}));

jest.mock("@/components/notes/markdown-editor", () => ({
    MarkdownEditor: ({ initialContent }: { initialContent: string }) => (
        <div data-testid="markdown-editor">{initialContent}</div>
    ),
}));

jest.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        onClick,
        variant,
        size,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        variant?: string;
        size?: string;
    }) => (
        <button onClick={onClick} data-variant={variant} data-size={size}>
            {children}
        </button>
    ),
}));

jest.mock("@/components/ui/spinner", () => ({
    Spinner: () => <svg data-testid="spinner" />,
}));

const BASE_NOTE: INote = {
    id: "n1",
    userId: "u1",
    title: "Test Note",
    content: "Note content here",
    excerpt: "Excerpt",
    tags: ["react", "typescript"],
    aiTags: [],
    folderId: null,
    summary: null,
    flashcards: null,
    isPinned: false,
    isArchived: false,
    sourceFile: null,
    createdAt: new Date("2024-06-01T00:00:00.000Z"),
    updatedAt: new Date("2024-06-01T00:00:00.000Z"),
    viewedAt: new Date("2024-06-01T00:00:00.000Z"),
};

describe("NoteDetailPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEditorShouldSetRef = true;
        mockUseNote.mockReturnValue({
            data: BASE_NOTE,
            isLoading: false,
            isError: false,
        });
        mockUseFolders.mockReturnValue({ data: [] });
        (useQueryState as jest.Mock).mockImplementation((key: string) => {
            if (key === "edit") return [null, jest.fn()];
            return [null, jest.fn()];
        });
    });

    it("shows a spinner when isLoading is true", () => {
        mockUseNote.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("returns null when note is not found and not loading", () => {
        mockUseNote.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });
        const { container } = render(<NoteDetailPage noteId="n1" />);
        expect(container.firstChild).toBeNull();
    });

    it("navigates to /notes when isError is true", async () => {
        mockUseNote.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });
        render(<NoteDetailPage noteId="n1" />);
        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/notes" }),
        );
    });

    it("renders the note title in the h1 heading", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Test Note",
        );
    });

    it("renders 'Untitled' when note title is empty", () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, title: "" },
            isLoading: false,
            isError: false,
        });
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getAllByText("detail.untitled").length).toBeGreaterThan(0);
    });

    it("uses an empty folders array when useFolders returns undefined data", () => {
        mockUseFolders.mockReturnValue({});
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("detail.allNotes")).toBeInTheDocument();
    });

    it("renders the breadcrumb navigation", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(
            screen.getByRole("navigation", { name: "detail.breadcrumb" }),
        ).toBeInTheDocument();
    });

    it("renders 'Home' link in the breadcrumb", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("detail.home")).toBeInTheDocument();
    });

    it("shows 'All Notes' in breadcrumb when note has no folder", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("detail.allNotes")).toBeInTheDocument();
    });

    it("shows folder name in breadcrumb when note has a matching folder", () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, folderId: "f1" },
            isLoading: false,
            isError: false,
        });
        mockUseFolders.mockReturnValue({
            data: [{ id: "f1", name: "Science" }],
        });
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("Science")).toBeInTheDocument();
    });

    it("renders tags with # prefix", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("#react")).toBeInTheDocument();
        expect(screen.getByText("#typescript")).toBeInTheDocument();
    });

    it("does not render the tag section when tags array is empty", () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, tags: [] },
            isLoading: false,
            isError: false,
        });
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.queryByText("#react")).not.toBeInTheDocument();
    });

    it("renders the word count from countWords", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("detail.words")).toBeInTheDocument();
    });

    it("renders the MarkdownEditor with the note content", () => {
        render(<NoteDetailPage noteId="n1" />);
        const editor = screen.getByTestId("markdown-editor");
        expect(editor).toBeInTheDocument();
        expect(editor).toHaveTextContent("Note content here");
    });

    it("does NOT render the AI insight box when summary is null", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.queryByText("detail.aiInsight")).not.toBeInTheDocument();
    });

    it("renders the AI insight box and summary text when summary is present", () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, summary: "This note is about React." },
            isLoading: false,
            isError: false,
        });
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByText("detail.aiInsight")).toBeInTheDocument();
        expect(screen.getByText("This note is about React.")).toBeInTheDocument();
    });

    it("renders an Edit button in read view", () => {
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByRole("button", { name: "detail.edit" })).toBeInTheDocument();
    });

    it("switches to edit view when the Edit button is clicked", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        expect(screen.getByTestId("note-editor")).toBeInTheDocument();
    });

    it("passes the correct noteId to NoteEditor in edit mode", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        expect(screen.getByTestId("editor-note-id")).toHaveTextContent("n1");
    });

    it("hides read view and shows NoteEditor when editing", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
        expect(screen.getByTestId("note-editor")).toBeInTheDocument();
    });

    it("returns to read view when NoteEditor onBack is called", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Back" }));
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
        expect(screen.queryByTestId("note-editor")).not.toBeInTheDocument();
    });

    it("navigates to /notes when NoteEditor onDeleted is called", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Delete" }));
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/notes" });
    });

    it("shows the AI assistant modal when Toggle AI is clicked in edit mode", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        expect(screen.getByTestId("ai-assistant-modal")).toBeInTheDocument();
    });

    it("hides the AI assistant modal when Toggle AI is clicked again", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        expect(screen.queryByTestId("ai-assistant-modal")).not.toBeInTheDocument();
    });

    it("hides the AI assistant modal when its close button is clicked", () => {
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        fireEvent.click(screen.getByRole("button", { name: "Close AI" }));
        expect(screen.queryByTestId("ai-assistant-modal")).not.toBeInTheDocument();
    });

    it("starts in edit mode when the 'edit' query param is '1'", () => {
        (useQueryState as jest.Mock).mockImplementation((key: string) => {
            if (key === "edit") return ["1", jest.fn()];
            return [null, jest.fn()];
        });
        render(<NoteDetailPage noteId="n1" />);
        expect(screen.getByTestId("note-editor")).toBeInTheDocument();
    });

    it("calls prependContent on the editor handle when onInsertAtStart is triggered", () => {
        mockEditorShouldSetRef = true;
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        fireEvent.click(screen.getByRole("button", { name: "Trigger Insert" }));
        expect(mockPrependContent).toHaveBeenCalledWith("summary-text");
    });

    it("skips prependContent when editorHandleRef.current is null", () => {
        mockEditorShouldSetRef = false;
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        fireEvent.click(screen.getByRole("button", { name: "Trigger Insert" }));
        expect(mockPrependContent).not.toHaveBeenCalled();
    });

    it("calls appendContent on the editor handle when onAppendContent is triggered", () => {
        mockEditorShouldSetRef = true;
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        fireEvent.click(screen.getByRole("button", { name: "Trigger Append" }));
        expect(mockAppendContent).toHaveBeenCalledWith("flashcard-text");
    });

    it("skips appendContent when editorHandleRef.current is null", () => {
        mockEditorShouldSetRef = false;
        render(<NoteDetailPage noteId="n1" />);
        fireEvent.click(screen.getByRole("button", { name: "detail.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "Toggle AI" }));
        fireEvent.click(screen.getByRole("button", { name: "Trigger Append" }));
        expect(mockAppendContent).not.toHaveBeenCalled();
    });
});
