import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IRecentNoteCardProps {
    folder: string;
    title: string;
    excerpt: string;
    tags: string[];
    timeAgo: string;
}

export function RecentNoteCard({
    folder,
    title,
    excerpt,
    tags,
    timeAgo,
}: IRecentNoteCardProps) {
    return (
        <article className="border-border bg-card rounded-2xl border p-6">
            <div className="mb-3">
                <Badge variant="secondary">
                    <Folder />
                    {folder}
                </Badge>
            </div>
            <h3 className="text-foreground mb-2 text-lg font-bold">{title}</h3>
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">{excerpt}</p>
            <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                            #{tag}
                        </Badge>
                    ))}
                </div>
                <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                    {timeAgo}
                </span>
            </div>
        </article>
    );
}
