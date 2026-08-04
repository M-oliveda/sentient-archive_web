import type { INote } from "@/types/note";
import type { NoteSort } from "@/hooks/useNotes";
import { NotesSearchBar } from "./NotesSearchBar";
import { NotesGrid } from "./NotesGrid";
import { NotesPagination } from "./NotesPagination";

interface INotesListProps {
    notes: INote[];
    isLoading: boolean;
    isError?: boolean;
    errorMessage?: string;
    search: string;
    sort: NoteSort;
    page: number;
    totalNotes: number;
    folderMap: Record<string, string>;
    onNoteClick: (noteId: string) => void;
    onSearchChange: (value: string) => void;
    onSortChange: (value: NoteSort) => void;
    onPageChange: (page: number) => void;
}

export function NotesList({
    notes,
    isLoading,
    isError = false,
    errorMessage,
    search,
    sort,
    page,
    totalNotes,
    folderMap,
    onNoteClick,
    onSearchChange,
    onSortChange,
    onPageChange,
}: INotesListProps) {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <NotesSearchBar
                search={search}
                sort={sort}
                onSearchChange={onSearchChange}
                onSortChange={onSortChange}
            />
            <NotesGrid
                notes={notes}
                isLoading={isLoading}
                isError={isError}
                errorMessage={errorMessage}
                search={search}
                folderMap={folderMap}
                onNoteClick={onNoteClick}
            />
            {totalNotes > 0 && (
                <NotesPagination
                    page={page}
                    totalNotes={totalNotes}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}
