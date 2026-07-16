import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { countWords } from "@/lib/notes-utils";
import type { INote } from "@/types/note";

const MAX_VISIBLE_TAGS = 3;

interface INoteCardProps {
    note: INote;
    folderName?: string;
    onClick: (noteId: string) => void;
}

export function NoteCard({ note, folderName, onClick }: INoteCardProps) {
    const wordCount = countWords(note.content);
    const visibleTags = note.tags.slice(0, MAX_VISIBLE_TAGS);
    const hiddenCount = note.tags.length - MAX_VISIBLE_TAGS;

    return (
        <button
            type="button"
            onClick={() => onClick(note.id)}
            className={cn(
                "border-border bg-card hover:bg-secondary/50 w-full rounded-xl border p-5 text-left transition-colors",
            )}
        >
            <h3 className="text-foreground mb-2 line-clamp-2 text-lg leading-snug font-bold">
                {note.title || "Untitled"}
            </h3>

            {note.excerpt && (
                <p className="text-muted-foreground mb-3 line-clamp-3 text-sm leading-relaxed">
                    {note.excerpt}
                </p>
            )}

            {note.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {visibleTags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-foreground text-background rounded-full px-2.5 py-0.5 text-xs font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="text-muted-foreground self-center text-xs">
                            +{hiddenCount}
                        </span>
                    )}
                </div>
            )}

            <div className="text-muted-foreground flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                    <Folder className="size-3.5" />
                    {folderName ?? "Unfiled"}
                </span>
                <span>{formatTimeAgo(note.updatedAt)}</span>
                <span>{wordCount} words</span>
            </div>
        </button>
    );
}
