import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, Home, Sparkles } from "lucide-react";
import { countWords } from "@/lib/notes-utils";
import { MarkdownEditor } from "@/components/notes/markdown-editor";
import { Button } from "@/components/ui/button";
import type { INote } from "@/types/note";

interface IReadNoteViewProps {
    note: INote;
    folderName?: string;
    onEdit: () => void;
}

export function ReadNoteView({ note, folderName, onEdit }: IReadNoteViewProps) {
    const wordCount = countWords(note.content);
    const formattedDate = note.createdAt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
                <Link
                    to="/notes"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                    <Home className="size-3.5" />
                    Home
                </Link>
                <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
                <span className="text-muted-foreground">
                    {folderName ?? "All Notes"}
                </span>
                <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />
                <span className="text-foreground max-w-48 truncate font-medium">
                    {note.title || "Untitled"}
                </span>
            </nav>

            <div className="flex items-start justify-between gap-4">
                <h1 className="text-foreground text-3xl leading-tight font-bold">
                    {note.title || "Untitled"}
                </h1>
                <Button variant="secondary" size="sm" onClick={onEdit}>
                    Edit
                </Button>
            </div>

            {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {formattedDate}
                </span>
                <span>{wordCount.toLocaleString()} words</span>
            </div>

            {note.summary && <AiInsightBox summary={note.summary} />}

            <MarkdownEditor key={note.id} initialContent={note.content} readOnly />
        </div>
    );
}

function AiInsightBox({ summary }: { summary: string }) {
    return (
        <div className="bg-secondary rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2">
                <Sparkles className="text-primary size-4" />
                <span className="text-foreground text-sm font-medium">AI Insight</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
        </div>
    );
}
