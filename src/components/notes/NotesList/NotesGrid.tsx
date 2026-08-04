import { useTranslation } from "react-i18next";
import { NoteCard } from "@/components/notes/NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { INote } from "@/types/note";

interface INotesGridProps {
    notes: INote[];
    isLoading: boolean;
    isError?: boolean;
    errorMessage?: string;
    search: string;
    folderMap: Record<string, string>;
    onNoteClick: (noteId: string) => void;
}

export function NotesGrid({
    notes,
    isLoading,
    isError = false,
    errorMessage,
    search,
    folderMap,
    onNoteClick,
}: INotesGridProps) {
    const { t } = useTranslation("notes");

    if (isLoading) {
        return (
            <div
                className="min-h-0 flex-1 overflow-y-auto"
                data-testid="notes-grid-loading"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className="flex min-h-0 flex-1 items-center justify-center"
                data-testid="notes-grid-error"
                role="alert"
            >
                <p className="text-destructive text-center text-sm">
                    {errorMessage ?? t("list.loadError")}
                </p>
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center">
                <p className="text-muted-foreground text-center text-sm">
                    {search ? t("list.emptySearch") : t("list.empty")}
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
