import { ArrowRight, Bot, Coins, FileText, FilePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentNoteCard } from "@/components/dashboard/RecentNoteCard";
import { useAuthStore } from "@/stores/authStore";
import { useRecentNotes } from "@/hooks/useRecentNotes";
import { formatTimeAgo } from "@/lib/utils";

export function ClientDashboardHome() {
    const { user } = useAuthStore();
    const firstName = user?.displayName?.trim().split(/\s+/)[0] ?? "there";
    const { data, isLoading } = useRecentNotes();

    const notes = data?.notes ?? [];
    const totalCount = data?.totalCount ?? 0;
    const lastEdited = notes[0]?.title ?? "—";
    const recentNotes = notes.slice(0, 2);

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <section>
                <Bot className="text-muted-foreground mb-2 size-8" />
                <h1 className="text-foreground text-4xl font-bold">
                    Welcome back, {firstName}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Your knowledge base is organized and ready for insights.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button size="default">
                        <FilePlus className="size-4" />
                        New Note
                    </Button>
                    <Button
                        variant="secondary"
                        size="default"
                        className="bg-brand-500 text-brand-50 hover:bg-brand-600"
                    >
                        <Upload className="size-4" />
                        Upload Document
                    </Button>
                </div>
            </section>

            {/* Stats row */}
            <section
                className="flex gap-4 overflow-x-auto pb-2"
                aria-label="Stats overview"
            >
                <StatsCard
                    icon={FileText}
                    label="Notes"
                    value={isLoading ? "—" : totalCount}
                />
                <StatsCard
                    icon={Coins}
                    label="Tokens"
                    value={user?.tokenBalance ?? 0}
                    action={{ label: "Request More" }}
                />
                <StatsCard
                    icon={FileText}
                    label="Last Edited"
                    value={isLoading ? "—" : lastEdited}
                />
            </section>

            {/* Recent notes */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-foreground text-xl font-bold">Recent Notes</h2>
                    <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium">
                        Show More
                        <ArrowRight className="size-4" />
                    </button>
                </div>
                {!isLoading && recentNotes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No notes yet. Create your first note!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {recentNotes.map((note) => (
                            <RecentNoteCard
                                key={note.id}
                                folder={note.folderId ?? "Notes"}
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
