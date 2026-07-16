import { render, screen, fireEvent } from "@testing-library/react";
import { NoteCard } from "@/components/notes/NoteCard";
import type { INote } from "@/types/note";

jest.mock("@/lib/notes-utils", () => ({
    countWords: () => 42,
}));

const BASE_NOTE: INote = {
    id: "note-1",
    userId: "user-1",
    title: "Test Note",
    content: "Content here",
    excerpt: "Excerpt of the note",
    tags: ["react", "typescript"],
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
};

describe("NoteCard", () => {
    it("renders the note title", () => {
        render(<NoteCard note={BASE_NOTE} onClick={jest.fn()} />);
        expect(screen.getByText("Test Note")).toBeInTheDocument();
    });

    it("renders 'Untitled' when title is empty", () => {
        render(<NoteCard note={{ ...BASE_NOTE, title: "" }} onClick={jest.fn()} />);
        expect(screen.getByText("Untitled")).toBeInTheDocument();
    });

    it("renders the excerpt", () => {
        render(<NoteCard note={BASE_NOTE} onClick={jest.fn()} />);
        expect(screen.getByText("Excerpt of the note")).toBeInTheDocument();
    });

    it("renders tags with # prefix", () => {
        render(<NoteCard note={BASE_NOTE} onClick={jest.fn()} />);
        expect(screen.getByText("#react")).toBeInTheDocument();
        expect(screen.getByText("#typescript")).toBeInTheDocument();
    });

    it("shows overflow count when there are more than 3 tags", () => {
        const note = { ...BASE_NOTE, tags: ["a", "b", "c", "d", "e"] };
        render(<NoteCard note={note} onClick={jest.fn()} />);
        expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("renders the provided folder name", () => {
        render(<NoteCard note={BASE_NOTE} folderName="Science" onClick={jest.fn()} />);
        expect(screen.getByText("Science")).toBeInTheDocument();
    });

    it("renders 'Unfiled' when folderName is not provided", () => {
        render(<NoteCard note={BASE_NOTE} onClick={jest.fn()} />);
        expect(screen.getByText("Unfiled")).toBeInTheDocument();
    });

    it("renders word count from countWords", () => {
        render(<NoteCard note={BASE_NOTE} onClick={jest.fn()} />);
        expect(screen.getByText("42 words")).toBeInTheDocument();
    });

    it("calls onClick with the note id when clicked", () => {
        const onClick = jest.fn();
        render(<NoteCard note={BASE_NOTE} onClick={onClick} />);
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledWith("note-1");
    });

    it("renders without excerpt section when excerpt is empty", () => {
        render(<NoteCard note={{ ...BASE_NOTE, excerpt: "" }} onClick={jest.fn()} />);
        expect(screen.queryByText("Excerpt of the note")).not.toBeInTheDocument();
    });

    it("renders without tags section when tags array is empty", () => {
        render(<NoteCard note={{ ...BASE_NOTE, tags: [] }} onClick={jest.fn()} />);
        expect(screen.queryByText(/#/)).not.toBeInTheDocument();
    });
});
