import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotesPage } from "@/pages/dashboard/NotesPage";
import type { INote } from "@/types/note";

const mockNavigate = jest.fn();
const mockSetSearch = jest.fn();
const mockSetSort = jest.fn();
const mockSetPage = jest.fn();
const mockCreateNote = {
    mutateAsync: jest.fn().mockResolvedValue("new-note-id"),
    isPending: false,
};

let capturedSortParse: ((v: string) => string) | undefined;
let capturedPageParse: ((v: string) => number) | undefined;
let capturedNotesListProps: Record<string, unknown> = {};

jest.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
}));

jest.mock("nuqs", () => ({
    useQueryState: jest.fn(),
}));

import { useQueryState } from "nuqs";

const mockUseNotes = jest.fn();
const mockUseFolders = jest.fn();

jest.mock("@/hooks/useNotes", () => ({
    useNotes: (params: unknown) => mockUseNotes(params),
}));

jest.mock("@/hooks/useFolders", () => ({
    useFolders: () => mockUseFolders(),
}));

jest.mock("@/hooks/useNotesMutations", () => ({
    useCreateNote: () => mockCreateNote,
}));

jest.mock("@/components/notes/NotesList", () => ({
    NotesList: (props: Record<string, unknown>) => {
        capturedNotesListProps = props;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const onNoteClick = props.onNoteClick as Function;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const onSearchChange = props.onSearchChange as Function;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const onSortChange = props.onSortChange as Function;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const onPageChange = props.onPageChange as Function;
        return (
            <div data-testid="notes-list">
                <button onClick={() => onNoteClick("n1")}>Click Note</button>
                <button onClick={() => onSearchChange("hello")}>Search Change</button>
                <button onClick={() => onSortChange("title")}>Sort Title</button>
                <button onClick={() => onPageChange(3)}>Go To Page 3</button>
            </div>
        );
    },
    NOTES_PER_PAGE: 20,
}));

jest.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        onClick,
        disabled,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
    }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

const SAMPLE_NOTE: INote = {
    id: "n1",
    userId: "u1",
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
    createdAt: new Date(),
    updatedAt: new Date(),
    viewedAt: new Date(),
};

function setupQueryState(
    overrides: {
        search?: string;
        folderId?: string | null;
        sort?: string;
        page?: number;
    } = {},
) {
    const { search = "", folderId = null, sort = "updatedAt", page = 1 } = overrides;

    (useQueryState as jest.Mock).mockImplementation(
        (key: string, options?: Record<string, unknown>) => {
            if (key === "sort") {
                if (options?.parse) {
                    capturedSortParse = options.parse as (v: string) => string;
                }
                return [sort, mockSetSort];
            }
            if (key === "page") {
                if (options?.parse) {
                    capturedPageParse = options.parse as (v: string) => number;
                }
                return [page, mockSetPage];
            }
            if (key === "q") return [search, mockSetSearch];
            if (key === "folder") return [folderId, jest.fn()];
            return [null, jest.fn()];
        },
    );
}

describe("NotesPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedSortParse = undefined;
        capturedPageParse = undefined;
        capturedNotesListProps = {};
        mockCreateNote.mutateAsync = jest.fn().mockResolvedValue("new-note-id");
        mockCreateNote.isPending = false;
        setupQueryState();
        mockUseNotes.mockReturnValue({ data: [SAMPLE_NOTE], isLoading: false });
        mockUseFolders.mockReturnValue({ data: [] });
    });

    it("renders the 'My Notes' heading", () => {
        render(<NotesPage />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Notes");
    });

    it("shows plural 'notes total' when there are multiple notes", () => {
        mockUseNotes.mockReturnValue({
            data: [SAMPLE_NOTE, { ...SAMPLE_NOTE, id: "n2" }],
            isLoading: false,
        });
        render(<NotesPage />);
        expect(screen.getByText("2 notes total")).toBeInTheDocument();
    });

    it("shows singular 'note total' when there is one note", () => {
        render(<NotesPage />);
        expect(screen.getByText("1 note total")).toBeInTheDocument();
    });

    it("renders the New Note button", () => {
        render(<NotesPage />);
        expect(screen.getByRole("button", { name: /New Note/ })).toBeInTheDocument();
    });

    it("disables the New Note button when createNote is pending", () => {
        mockCreateNote.isPending = true;
        render(<NotesPage />);
        expect(screen.getByRole("button", { name: /New Note/ })).toBeDisabled();
    });

    it("clicking New Note calls createNote.mutateAsync with null folderId", async () => {
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: /New Note/ }));
        await waitFor(() =>
            expect(mockCreateNote.mutateAsync).toHaveBeenCalledWith(null),
        );
    });

    it("clicking New Note navigates to /notes/$noteId in edit mode", async () => {
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: /New Note/ }));
        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith({
                to: "/notes/$noteId",
                params: { noteId: "new-note-id" },
                search: { edit: "1" },
            }),
        );
    });

    it("clicking New Note passes active folderId to createNote.mutateAsync", async () => {
        setupQueryState({ folderId: "folder-x" });
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: /New Note/ }));
        await waitFor(() =>
            expect(mockCreateNote.mutateAsync).toHaveBeenCalledWith("folder-x"),
        );
    });

    it("NotesList.onNoteClick navigates to the note detail page", () => {
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: "Click Note" }));
        expect(mockNavigate).toHaveBeenCalledWith({
            to: "/notes/$noteId",
            params: { noteId: "n1" },
        });
    });

    it("NotesList.onSearchChange updates search and resets page to 1", () => {
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: "Search Change" }));
        expect(mockSetSearch).toHaveBeenCalledWith("hello");
        expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it("NotesList.onSortChange updates sort and resets page to 1", () => {
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: "Sort Title" }));
        expect(mockSetSort).toHaveBeenCalledWith("title");
        expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it("NotesList.onPageChange updates page", () => {
        render(<NotesPage />);
        fireEvent.click(screen.getByRole("button", { name: "Go To Page 3" }));
        expect(mockSetPage).toHaveBeenCalledWith(3);
    });

    it("passes the first page of notes to NotesList (page 1 of 1)", () => {
        render(<NotesPage />);
        expect(capturedNotesListProps.notes).toEqual([SAMPLE_NOTE]);
    });

    it("slices pagedNotes based on the current page", () => {
        const allNotes = Array.from({ length: 25 }, (_, i) => ({
            ...SAMPLE_NOTE,
            id: `n${i + 1}`,
        }));
        mockUseNotes.mockReturnValue({ data: allNotes, isLoading: false });
        setupQueryState({ page: 2 });
        render(<NotesPage />);
        const pagedNotes = capturedNotesListProps.notes as INote[];
        expect(pagedNotes).toHaveLength(5);
        expect(pagedNotes).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: "n21" })]),
        );
    });

    it("passes totalNotes as the full notes array length", () => {
        mockUseNotes.mockReturnValue({
            data: Array.from({ length: 25 }, (_, i) => ({
                ...SAMPLE_NOTE,
                id: `n${i + 1}`,
            })),
            isLoading: false,
        });
        render(<NotesPage />);
        expect(capturedNotesListProps.totalNotes).toBe(25);
    });

    it("passes folderMap built from useFolders data to NotesList", () => {
        mockUseFolders.mockReturnValue({
            data: [
                { id: "f1", name: "Science" },
                { id: "f2", name: "History" },
            ],
        });
        render(<NotesPage />);
        expect(capturedNotesListProps.folderMap).toEqual({
            f1: "Science",
            f2: "History",
        });
    });

    it("passes an empty folderMap when useFolders returns no data", () => {
        render(<NotesPage />);
        expect(capturedNotesListProps.folderMap).toEqual({});
    });

    it("uses an empty folders array when useFolders returns undefined data", () => {
        mockUseFolders.mockReturnValue({});
        render(<NotesPage />);
        expect(capturedNotesListProps.folderMap).toEqual({});
    });

    it("passes isLoading from useNotes to NotesList", () => {
        mockUseNotes.mockReturnValue({ data: [], isLoading: true });
        render(<NotesPage />);
        expect(capturedNotesListProps.isLoading).toBe(true);
    });

    it("uses an empty notes array when useNotes returns undefined data", () => {
        mockUseNotes.mockReturnValue({ data: undefined, isLoading: false });
        render(<NotesPage />);
        expect(capturedNotesListProps.notes).toEqual([]);
        expect(capturedNotesListProps.totalNotes).toBe(0);
    });

    it("sort parse returns the value for valid NoteSort keys", () => {
        render(<NotesPage />);
        expect(capturedSortParse?.("updatedAt")).toBe("updatedAt");
        expect(capturedSortParse?.("createdAt")).toBe("createdAt");
        expect(capturedSortParse?.("title")).toBe("title");
    });

    it("sort parse falls back to 'updatedAt' for invalid values", () => {
        render(<NotesPage />);
        expect(capturedSortParse?.("unknown")).toBe("updatedAt");
    });

    it("page parse returns a valid integer", () => {
        render(<NotesPage />);
        expect(capturedPageParse?.("3")).toBe(3);
    });

    it("page parse returns 1 for non-numeric strings", () => {
        render(<NotesPage />);
        expect(capturedPageParse?.("abc")).toBe(1);
    });

    it("page parse returns 1 for values less than 1", () => {
        render(<NotesPage />);
        expect(capturedPageParse?.("0")).toBe(1);
        expect(capturedPageParse?.("-5")).toBe(1);
    });
});
