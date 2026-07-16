import { NoteCard } from "@/components/notes/NoteCard";
import { Spinner } from "@/components/ui/spinner";
import type { INote } from "@/types/note";

interface INotesGridProps {
    notes: INote[];
    isLoading: boolean;
    search: string;
    folderMap: Record<string, string>;
    onNoteClick: (noteId: string) => void;
}

export function NotesGrid({
    notes,
    isLoading,
    search,
    folderMap,
    onNoteClick,
}: INotesGridProps) {
    if (isLoading) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                <p className="text-muted-foreground text-center text-sm">
                    {search ? "No notes match your search." : "No notes yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        folderName={
                            note.folderId ? folderMap[note.folderId] : undefined
                        }
                        onClick={onNoteClick}
                    />
                ))}
            </div>
        </div>
    );
}
