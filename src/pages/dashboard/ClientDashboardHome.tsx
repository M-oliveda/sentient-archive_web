import { useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    Bot,
    Coins,
    FileText,
    FilePlus,
    TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentNoteCard } from "@/components/dashboard/RecentNoteCard";
import { FileExtractor } from "@/components/notes/FileExtractor";
import { useAuthStore } from "@/stores/authStore";
import { useRecentNotes } from "@/hooks/useRecentNotes";
import { useCreateNote } from "@/hooks/useNotesMutations";
import { formatTimeAgo } from "@/lib/utils";

const LOW_BALANCE_THRESHOLD = 20;

export function ClientDashboardHome() {
    const { t } = useTranslation("dashboard");
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const firstName =
        user?.displayName?.trim().split(/\s+/)[0] ?? t("client.welcomeFallback");
    const { data, isLoading } = useRecentNotes();
    const createNote = useCreateNote();

    const notes = data?.notes ?? [];
    const totalCount = data?.totalCount ?? 0;
    const lastEdited = notes[0]?.title ?? "—";
    const recentNotes = notes.slice(0, 2);

    const handleNewNote = useCallback(async () => {
        const id = await createNote.mutateAsync(null);
        void navigate({
            to: "/notes/$noteId",
            params: { noteId: id },
            search: { edit: "1" },
        });
    }, [createNote, navigate]);

    const handleNoteCreated = useCallback(
        (noteId: string) => void navigate({ to: "/notes/$noteId", params: { noteId } }),
        [navigate],
    );

    return (
        <div className="space-y-8">
            {/* Low balance warning */}
            {(user?.tokenBalance ?? 0) < LOW_BALANCE_THRESHOLD && (
                <Alert variant="destructive" data-testid="low-balance-alert">
                    <TriangleAlert className="size-4" />
                    <AlertDescription>
                        {t("client.lowBalance.message")}{" "}
                        <Link
                            to="/tokens"
                            className="font-semibold underline underline-offset-2"
                        >
                            {t("client.lowBalance.link")}
                        </Link>{" "}
                        {t("client.lowBalance.suffix")}
                    </AlertDescription>
                </Alert>
            )}

            {/* Welcome */}
            <section>
                <Bot className="text-muted-foreground mb-2 size-8" />
                <h1 className="text-foreground text-4xl font-bold">
                    {t("client.welcome", { firstName })}
                </h1>
                <p className="text-muted-foreground mt-2">{t("client.subtitle")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        size="default"
                        onClick={() => void handleNewNote()}
                        disabled={createNote.isPending}
                    >
                        <FilePlus className="size-4" />
                        {t("client.actions.newNote")}
                    </Button>
                    <FileExtractor
                        onNoteCreated={handleNoteCreated}
                        className="bg-brand-500 text-brand-50 hover:bg-brand-600"
                    />
                </div>
            </section>

            {/* Stats row */}
            <section
                className="flex gap-4 overflow-x-auto pb-2"
                aria-label={t("client.stats.ariaLabel")}
            >
                <StatsCard
                    icon={FileText}
                    label={t("client.stats.notes")}
                    value={isLoading ? "—" : totalCount}
                />
                <StatsCard
                    icon={Coins}
                    label={t("client.stats.tokens")}
                    value={user?.tokenBalance ?? 0}
                    action={{
                        label: t("client.stats.requestMore"),
                        onClick: () => void navigate({ to: "/tokens" }),
                    }}
                />
                <StatsCard
                    icon={FileText}
                    label={t("client.stats.lastEdited")}
                    value={isLoading ? "—" : lastEdited}
                />
            </section>

            {/* Recent notes */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-foreground text-xl font-bold">
                        {t("client.recentNotes.title")}
                    </h2>
                    <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium">
                        {t("client.recentNotes.showMore")}
                        <ArrowRight className="size-4" />
                    </button>
                </div>
                {!isLoading && recentNotes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        {t("client.recentNotes.empty")}
                    </p>
                ) : isLoading ? (
                    <div className="space-y-4" data-testid="recent-notes-loading">
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentNotes.map((note) => (
                            <RecentNoteCard
                                key={note.id}
                                folder={
                                    note.folderId ??
                                    t("client.recentNotes.folderFallback")
                                }
                                title={note.title}
                                excerpt={note.excerpt}
                                tags={note.tags}
                                timeAgo={formatTimeAgo(note.updatedAt)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
