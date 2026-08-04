import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NoteSort } from "@/hooks/useNotes";
import { SORT_OPTIONS } from "./constants";

interface INotesSearchBarProps {
    search: string;
    sort: NoteSort;
    onSearchChange: (value: string) => void;
    onSortChange: (value: NoteSort) => void;
}

export function NotesSearchBar({
    search,
    sort,
    onSearchChange,
    onSortChange,
}: INotesSearchBarProps) {
    const { t } = useTranslation("notes");

    return (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div className="relative min-w-48 flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                    placeholder={t("list.searchPlaceholder")}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-8 pl-8 text-sm"
                    aria-label={t("list.searchAriaLabel")}
                />
            </div>
            <div className="flex gap-1">
                {SORT_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onSortChange(opt.value)}
                        className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                            sort === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {t(opt.labelKey)}
                    </button>
                ))}
            </div>
        </div>
    );
}
