import { render, screen, fireEvent } from "@testing-library/react";
import { NotesList } from "@/components/notes/NotesList";
import type { INote } from "@/types/note";

jest.mock("@/components/notes/NoteCard", () => ({
    NoteCard: ({
        note,
        folderName,
        onClick,
    }: {
        note: INote;
        folderName?: string;
        onClick: (id: string) => void;
    }) => (
        <button
            data-testid={`note-card-${note.id}`}
            data-folder={folderName ?? ""}
            onClick={() => onClick(note.id)}
        >
            {note.title}
        </button>
    ),
}));

const NOTE: INote = {
    id: "n1",
    userId: "u1",
    title: "Alpha Note",
    content: "",
    excerpt: "Some text",
    tags: ["tag1"],
    aiTags: [],
    folderId: "f1",
    summary: null,
    flashcards: null,
    isPinned: false,
    isArchived: false,
    sourceFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewedAt: new Date(),
};

const BASE_PROPS = {
    notes: [NOTE],
    isLoading: false,
    search: "",
    sort: "updatedAt" as const,
    page: 1,
    totalNotes: 1,
    folderMap: { f1: "Science" },
    onNoteClick: jest.fn(),
    onSearchChange: jest.fn(),
    onSortChange: jest.fn(),
    onPageChange: jest.fn(),
};

describe("NotesList", () => {
    beforeEach(() => jest.clearAllMocks());

    it("renders a NoteCard for each note", () => {
        render(<NotesList {...BASE_PROPS} />);
        expect(screen.getByText("Alpha Note")).toBeInTheDocument();
    });

    it("shows empty state when there are no notes and no search", () => {
        render(<NotesList {...BASE_PROPS} notes={[]} totalNotes={0} />);
        expect(screen.getByText("list.empty")).toBeInTheDocument();
    });

    it("shows search empty state when search is active but no results", () => {
        render(<NotesList {...BASE_PROPS} notes={[]} totalNotes={0} search="xyz" />);
        expect(screen.getByText("list.emptySearch")).toBeInTheDocument();
    });

    it("shows a spinner when isLoading is true", () => {
        render(<NotesList {...BASE_PROPS} isLoading={true} />);
        expect(screen.getByTestId("notes-grid-loading")).toBeInTheDocument();
    });

    it("calls onSearchChange when the search input changes", () => {
        render(<NotesList {...BASE_PROPS} />);
        fireEvent.change(screen.getByPlaceholderText("list.searchPlaceholder"), {
            target: { value: "hello" },
        });
        expect(BASE_PROPS.onSearchChange).toHaveBeenCalledWith("hello");
    });

    it("calls onSortChange when a sort button is clicked", () => {
        render(<NotesList {...BASE_PROPS} />);
        fireEvent.click(screen.getByText("list.sort.title"));
        expect(BASE_PROPS.onSortChange).toHaveBeenCalledWith("title");
    });

    it("highlights the active sort button", () => {
        render(<NotesList {...BASE_PROPS} sort="title" />);
        expect(screen.getByText("list.sort.title").className).toContain("bg-primary");
    });

    it("reflects the search prop value in the input", () => {
        render(<NotesList {...BASE_PROPS} search="hooks" />);
        expect(screen.getByDisplayValue("hooks")).toBeInTheDocument();
    });

    it("calls onNoteClick when a note card is clicked", () => {
        render(<NotesList {...BASE_PROPS} />);
        fireEvent.click(screen.getByTestId("note-card-n1"));
        expect(BASE_PROPS.onNoteClick).toHaveBeenCalledWith("n1");
    });

    it("passes resolved folder name to NoteCard", () => {
        render(<NotesList {...BASE_PROPS} />);
        expect(screen.getByTestId("note-card-n1")).toHaveAttribute(
            "data-folder",
            "Science",
        );
    });

    it("passes undefined folder name when folderId is null", () => {
        const note = { ...NOTE, folderId: null };
        render(<NotesList {...BASE_PROPS} notes={[note]} />);
        expect(screen.getByTestId("note-card-n1")).toHaveAttribute("data-folder", "");
    });

    it("does not render pagination when totalNotes is 0", () => {
        render(<NotesList {...BASE_PROPS} notes={[]} totalNotes={0} />);
        expect(screen.queryByText("list.showing")).not.toBeInTheDocument();
    });

    it("does not render pagination when all notes fit on one page", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={5} />);
        expect(screen.queryByText("list.showing")).not.toBeInTheDocument();
    });

    it("renders pagination when totalNotes exceeds one page", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={25} page={1} />);
        expect(screen.getByText("list.showing")).toBeInTheDocument();
    });

    it("calls onPageChange when next page button is clicked", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={25} page={1} />);
        fireEvent.click(screen.getByLabelText("list.nextPage"));
        expect(BASE_PROPS.onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange when previous page button is clicked", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={25} page={2} />);
        fireEvent.click(screen.getByLabelText("list.prevPage"));
        expect(BASE_PROPS.onPageChange).toHaveBeenCalledWith(1);
    });

    it("disables previous page button on first page", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={25} page={1} />);
        expect(screen.getByLabelText("list.prevPage")).toBeDisabled();
    });

    it("disables next page button on last page", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={25} page={5} />);
        expect(screen.getByLabelText("list.nextPage")).toBeDisabled();
    });

    it("calls onPageChange when a page number is clicked", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={25} page={1} />);
        fireEvent.click(screen.getByText("2"));
        expect(BASE_PROPS.onPageChange).toHaveBeenCalledWith(2);
    });

    it("shows right ellipsis only when on first page of many (page 1 of 34)", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={200} page={1} />);
        const ellipses = screen.getAllByText("…");
        expect(ellipses).toHaveLength(1);
        expect(screen.getByText("34")).toBeInTheDocument();
    });

    it("shows both ellipses when on a middle page of many (page 5 of 10)", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={200} page={5} />);
        const ellipses = screen.getAllByText("…");
        expect(ellipses).toHaveLength(2);
    });

    it("shows left ellipsis only when near last page of many (page 32 of 34)", () => {
        render(<NotesList {...BASE_PROPS} totalNotes={200} page={32} />);
        const ellipses = screen.getAllByText("…");
        expect(ellipses).toHaveLength(1);
        expect(screen.getByText("1")).toBeInTheDocument();
    });
});
