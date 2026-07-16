import type { NoteSort } from "@/hooks/useNotes";

export const NOTES_PER_PAGE = 6;

export const SORT_OPTIONS: { value: NoteSort; label: string }[] = [
    { value: "updatedAt", label: "Last edited" },
    { value: "createdAt", label: "Created" },
    { value: "title", label: "Title" },
];
