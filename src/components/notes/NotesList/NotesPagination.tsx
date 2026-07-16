import { cn } from "@/lib/utils";
import { NOTES_PER_PAGE } from "./constants";

interface INotesPaginationProps {
    page: number;
    totalNotes: number;
    onPageChange: (page: number) => void;
}

function getPageRange(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "…")[] = [];
    const left = Math.max(2, current - 2);
    const right = Math.min(total - 1, current + 2);

    pages.push(1);
    if (left > 2) pages.push("…");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("…");
    pages.push(total);

    return pages;
}

export function NotesPagination({
    page,
    totalNotes,
    onPageChange,
}: INotesPaginationProps) {
    const totalPages = Math.ceil(totalNotes / NOTES_PER_PAGE);
    const start = (page - 1) * NOTES_PER_PAGE + 1;
    const end = Math.min(page * NOTES_PER_PAGE, totalNotes);

    if (totalPages <= 1) return null;

    const pageRange = getPageRange(page, totalPages);

    return (
        <div className="flex shrink-0 flex-col items-center gap-3 pt-2">
            <p className="text-muted-foreground text-sm">
                Showing {start}–{end} of {totalNotes} notes
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-sm transition-colors disabled:opacity-40"
                    aria-label="Previous page"
                >
                    ←
                </button>
                {pageRange.map((p, i) =>
                    p === "…" ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="text-muted-foreground px-1 text-sm"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p as number)}
                            className={cn(
                                "size-8 rounded text-sm font-medium transition-colors",
                                p === page
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </button>
                    ),
                )}
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-sm transition-colors disabled:opacity-40"
                    aria-label="Next page"
                >
                    →
                </button>
            </div>
        </div>
    );
}
