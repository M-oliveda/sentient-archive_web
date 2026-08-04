import { useCallback, useMemo } from "react";
import { useQueryState } from "nuqs";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { useFolders } from "@/hooks/useFolders";
import { useCreateNote } from "@/hooks/useNotesMutations";
import { NotesList, NOTES_PER_PAGE } from "@/components/notes/NotesList";
import { Button } from "@/components/ui/button";
import type { NoteSort } from "@/hooks/useNotes";

export function NotesPage() {
    const { t } = useTranslation("notes");
    const navigate = useNavigate();

    const [search, setSearch] = useQueryState("q", { defaultValue: "" });
    const [folderId] = useQueryState("folder");
    const [sort, setSort] = useQueryState<NoteSort>("sort", {
        defaultValue: "updatedAt",
        parse: (v) =>
            ["updatedAt", "createdAt", "title"].includes(v)
                ? (v as NoteSort)
                : "updatedAt",
    });
    const [page, setPage] = useQueryState("page", {
        defaultValue: 1,
        parse: (v) => Math.max(1, parseInt(v, 10) || 1),
        serialize: String,
    });

    const {
        data: notes = [],
        isLoading,
        isError,
        error,
    } = useNotes({
        folderId: folderId ?? undefined,
        sort,
        search,
    });
    const { data: folders = [] } = useFolders();
    const createNote = useCreateNote();

    const folderMap = useMemo(
        () => Object.fromEntries(folders.map((f) => [f.id, f.name])),
        [folders],
    );

    const pagedNotes = useMemo(() => {
        const start = (page - 1) * NOTES_PER_PAGE;
        return notes.slice(start, start + NOTES_PER_PAGE);
    }, [notes, page]);

    const handleNewNote = useCallback(async () => {
        const id = await createNote.mutateAsync(folderId ?? null);
        void navigate({
            to: "/notes/$noteId",
            params: { noteId: id },
            search: { edit: "1" },
        });
    }, [createNote, folderId, navigate]);

    const handleNoteClick = useCallback(
        (noteId: string) => void navigate({ to: "/notes/$noteId", params: { noteId } }),
        [navigate],
    );

    const handleSearchChange = useCallback(
        (v: string) => {
            setSearch(v);
            setPage(1);
        },
        [setSearch, setPage],
    );

    const handleSortChange = useCallback(
        (v: NoteSort) => {
            setSort(v);
            setPage(1);
        },
        [setSort, setPage],
    );

    const handlePageChange = useCallback(
        (newPage: number) => setPage(newPage),
        [setPage],
    );

    return (
        <div className="flex h-full flex-col gap-6">
            <div className="bg-secondary flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-xl p-6">
                <div>
                    <h1 className="text-foreground text-2xl font-bold">
                        {t("list.title")}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t(notes.length === 1 ? "list.noteTotal" : "list.notesTotal", {
                            count: notes.length,
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => void handleNewNote()}
                        disabled={createNote.isPending}
                    >
                        <Plus className="size-4" />
                        {t("list.newNote")}
                    </Button>
                </div>
            </div>

            <NotesList
                notes={pagedNotes}
                isLoading={isLoading}
                isError={isError}
                errorMessage={error instanceof Error ? error.message : undefined}
                search={search}
                sort={sort}
                page={page}
                totalNotes={notes.length}
                folderMap={folderMap}
                onNoteClick={handleNoteClick}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
