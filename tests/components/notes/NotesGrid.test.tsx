import { render, screen } from "@testing-library/react";
import { NotesGrid } from "@/components/notes/NotesList/NotesGrid";
import type { INote } from "@/types/note";

jest.mock("@/components/notes/NoteCard", () => ({
    NoteCard: ({ note }: { note: INote }) => <div>{note.title}</div>,
}));

const NOTE: INote = {
    id: "n1",
    userId: "u1",
    title: "Alpha Note",
    content: "",
    excerpt: "Some text",
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

const BASE_PROPS = {
    notes: [NOTE],
    isLoading: false,
    search: "",
    folderMap: {},
    onNoteClick: jest.fn(),
};

describe("NotesGrid", () => {
    it("renders notes when isError is omitted (default false)", () => {
        render(<NotesGrid {...BASE_PROPS} />);
        expect(screen.getByText("Alpha Note")).toBeInTheDocument();
    });
});
