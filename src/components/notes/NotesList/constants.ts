import type { NoteSort } from "@/hooks/useNotes";

export const NOTES_PER_PAGE = 6;

export const SORT_OPTIONS: { value: NoteSort; labelKey: string }[] = [
    { value: "updatedAt", labelKey: "list.sort.updatedAt" },
    { value: "createdAt", labelKey: "list.sort.createdAt" },
    { value: "title", labelKey: "list.sort.title" },
];
