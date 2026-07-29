import { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import type { INote } from "@/types/note";

const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
const mockMutate = jest.fn();
const mockUseNote = jest.fn();

jest.mock("@/hooks/useNote", () => ({
    useNote: (id: string) => mockUseNote(id),
}));

jest.mock("@/hooks/useNotesMutations", () => ({
    useUpdateNote: () => ({ mutateAsync: mockMutateAsync }),
    useDeleteNote: () => ({ mutate: mockMutate }),
}));

jest.mock("@/components/notes/markdown-editor", () => ({
    MarkdownEditor: ({
        onChange,
        initialContent,
        editorRef,
    }: {
        onChange?: (md: string) => void;
        initialContent: string;
        editorRef?: { current: unknown };
    }) => {
        if (editorRef) {
            editorRef.current = { prependContent: jest.fn(), appendContent: jest.fn() };
        }
        return (
            <div data-testid="mock-markdown-editor">
                <button
                    data-testid="trigger-change"
                    onClick={() => onChange?.("new content")}
                >
                    Change
                </button>
                <button
                    data-testid="trigger-same"
                    onClick={() => onChange?.(initialContent)}
                >
                    Same
                </button>
            </div>
        );
    },
    EditorToolbar: ({
        title,
        saveStatus,
        onTitleChange,
        onDelete,
        onBack,
        onToggleAI,
    }: {
        title: string;
        saveStatus: string;
        onTitleChange: (v: string) => void;
        onDelete: () => void;
        onBack?: () => void;
        onToggleAI?: () => void;
    }) => (
        <div data-testid="mock-editor-toolbar">
            <span data-testid="toolbar-title">{title}</span>
            <span data-testid="save-status">{saveStatus}</span>
            {onBack && (
                <button data-testid="back-btn" onClick={onBack}>
                    Back
                </button>
            )}
            {onToggleAI && (
                <button data-testid="toggle-ai-btn" onClick={onToggleAI}>
                    Toggle AI
                </button>
            )}
            <button
                data-testid="change-title"
                onClick={() => onTitleChange("New Title")}
            >
                Change Title
            </button>
            <button data-testid="delete-btn" onClick={onDelete}>
                Delete
            </button>
        </div>
    ),
}));

const BASE_NOTE: INote = {
    id: "n1",
    userId: "u1",
    title: "My Note",
    content: "Initial content",
    excerpt: "Excerpt",
    tags: [],
    aiTags: [],
    folderId: null,
    summary: null,
    flashcards: null,
    isPinned: false,
    isArchived: false,
    sourceFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewedAt: new Date(),
};

describe("NoteEditor", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockMutateAsync.mockResolvedValue(undefined);
        mockUseNote.mockReturnValue({
            data: BASE_NOTE,
            isLoading: false,
            isError: false,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("shows a spinner while loading", () => {
        mockUseNote.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("renders null when note is not found and not loading", () => {
        mockUseNote.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });
        const { container } = render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it("calls onDeleted when isError is true", () => {
        const onDeleted = jest.fn();
        mockUseNote.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });
        render(<NoteEditor noteId="n1" onDeleted={onDeleted} />);
        expect(onDeleted).toHaveBeenCalledTimes(1);
    });

    it("renders the editor toolbar with the note title", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.getByTestId("toolbar-title")).toHaveTextContent("My Note");
    });

    it("saves status starts as idle", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.getByTestId("save-status")).toHaveTextContent("idle");
    });

    it("sets saveStatus to saving when content changes", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-change"));
        expect(screen.getByTestId("save-status")).toHaveTextContent("saving");
    });

    it("calls updateNote.mutateAsync after the auto-save delay", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-change"));

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).toHaveBeenCalledWith({
            noteId: "n1",
            content: "new content",
            title: "My Note",
        });
    });

    it("shows 'saved' status then resets to idle after save completes", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-change"));

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(screen.getByTestId("save-status")).toHaveTextContent("idle");
    });

    it("does not trigger save when content matches the current value", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-same"));

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("clears the previous auto-save timer when scheduling a new one", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-change"));
        fireEvent.click(screen.getByTestId("trigger-same"));

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
        expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({ content: "Initial content" }),
        );
    });

    it("updates title state and triggers auto-save on title change", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("change-title"));

        expect(screen.getByTestId("toolbar-title")).toHaveTextContent("New Title");

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({ title: "New Title" }),
        );
    });

    it("calls deleteNote.mutate with noteId on delete", () => {
        const onDeleted = jest.fn();
        render(<NoteEditor noteId="n1" onDeleted={onDeleted} />);
        fireEvent.click(screen.getByTestId("delete-btn"));
        expect(mockMutate).toHaveBeenCalledWith(
            "n1",
            expect.objectContaining({ onSuccess: onDeleted }),
        );
    });

    it("clears the auto-save timer before deleting (timer active)", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-change"));
        fireEvent.click(screen.getByTestId("delete-btn"));
        act(() => {
            jest.runAllTimers();
        });
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("calls deleteNote.mutate even when no timer is active", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("delete-btn"));
        expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it("clears the auto-save timer on unmount when timer is active", async () => {
        const { unmount } = render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByTestId("trigger-change"));
        unmount();

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("unmounts cleanly when no timer is active", () => {
        const { unmount } = render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(() => unmount()).not.toThrow();
    });

    it("accepts editorHandleRef and wires it to MarkdownEditor", () => {
        const ref = { current: null as unknown };
        render(
            <NoteEditor
                noteId="n1"
                onDeleted={jest.fn()}
                editorHandleRef={ref as never}
            />,
        );
        expect(ref.current).not.toBeNull();
    });

    it("syncs local tags state when initialTags prop changes", () => {
        mockUseNote.mockReturnValueOnce({
            data: { ...BASE_NOTE, tags: ["react"] },
            isLoading: false,
            isError: false,
        });
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, tags: ["react", "newtag"] },
            isLoading: false,
            isError: false,
        });

        const { rerender } = render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.getByText("#react")).toBeInTheDocument();
        expect(screen.queryByText("#newtag")).not.toBeInTheDocument();

        rerender(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.getByText("#newtag")).toBeInTheDocument();
    });

    it("does not render back button when onBack is not provided", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.queryByTestId("back-btn")).not.toBeInTheDocument();
    });

    it("renders back button and calls onBack when provided", () => {
        const onBack = jest.fn();
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} onBack={onBack} />);
        fireEvent.click(screen.getByTestId("back-btn"));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("does not render Toggle AI button when onToggleAI is not provided", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.queryByTestId("toggle-ai-btn")).not.toBeInTheDocument();
    });

    it("renders Toggle AI button and calls onToggleAI when provided", () => {
        const onToggleAI = jest.fn();
        render(
            <NoteEditor noteId="n1" onDeleted={jest.fn()} onToggleAI={onToggleAI} />,
        );
        fireEvent.click(screen.getByTestId("toggle-ai-btn"));
        expect(onToggleAI).toHaveBeenCalledTimes(1);
    });

    it("renders the tag input field", () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.getByLabelText("editor.addTag")).toBeInTheDocument();
    });

    it("renders existing tags from the note", () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, tags: ["react", "typescript"] },
            isLoading: false,
            isError: false,
        });
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        expect(screen.getByText("#react")).toBeInTheDocument();
        expect(screen.getByText("#typescript")).toBeInTheDocument();
    });

    it("adds a new tag when Enter is pressed in the tag input", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        const input = screen.getByLabelText("editor.addTag");
        fireEvent.change(input, { target: { value: "newtag" } });
        fireEvent.keyDown(input, { key: "Enter" });

        await waitFor(() =>
            expect(mockMutateAsync).toHaveBeenCalledWith({
                noteId: "n1",
                tags: ["newtag"],
            }),
        );
    });

    it("removes a tag when its remove button is clicked", async () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, tags: ["react"] },
            isLoading: false,
            isError: false,
        });
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        fireEvent.click(screen.getByLabelText("editor.removeTag"));

        await waitFor(() =>
            expect(mockMutateAsync).toHaveBeenCalledWith({
                noteId: "n1",
                tags: [],
            }),
        );
    });

    it("does not add a tag when a non-Enter key is pressed", async () => {
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        const input = screen.getByLabelText("editor.addTag");
        fireEvent.change(input, { target: { value: "newtag" } });
        fireEvent.keyDown(input, { key: "Space" });

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).not.toHaveBeenCalledWith(
            expect.objectContaining({ tags: expect.anything() }),
        );
    });

    it("does not add a duplicate tag", async () => {
        mockUseNote.mockReturnValue({
            data: { ...BASE_NOTE, tags: ["react"] },
            isLoading: false,
            isError: false,
        });
        render(<NoteEditor noteId="n1" onDeleted={jest.fn()} />);
        const input = screen.getByLabelText("editor.addTag");
        fireEvent.change(input, { target: { value: "react" } });
        fireEvent.keyDown(input, { key: "Enter" });

        await act(async () => {
            await jest.runAllTimersAsync();
        });

        expect(mockMutateAsync).not.toHaveBeenCalledWith(
            expect.objectContaining({
                tags: expect.arrayContaining(["react", "react"]),
            }),
        );
    });
});
