import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActivityFilterCategory } from "@/types/activity";

const FILTER_CHIPS: ActivityFilterCategory[] = [
    "ai",
    "tokens",
    "notes",
    "all",
    "folders",
];

interface IActivityFilterBarProps {
    category: ActivityFilterCategory;
    search: string;
    onCategoryChange: (category: ActivityFilterCategory) => void;
    onSearchChange: (search: string) => void;
}

export function ActivityFilterBar({
    category,
    search,
    onCategoryChange,
    onSearchChange,
}: IActivityFilterBarProps) {
    const { t } = useTranslation("activity");

    return (
        <div
            className="flex shrink-0 flex-wrap items-center gap-3"
            data-testid="activity-filter-bar"
        >
            <div className="relative min-w-48 flex-1">
                <Search
                    className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                    aria-hidden
                />
                <Input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t("filters.searchPlaceholder")}
                    className="h-8 pl-8 text-sm"
                    aria-label={t("filters.searchAriaLabel")}
                    data-testid="activity-search-input"
                />
            </div>
            <div className="flex flex-wrap gap-1">
                {FILTER_CHIPS.map((chip) => {
                    const isActive = category === chip;
                    return (
                        <Button
                            key={chip}
                            type="button"
                            size="sm"
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                                !isActive &&
                                    "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => onCategoryChange(chip)}
                            data-testid={`activity-filter-${chip}`}
                            aria-pressed={isActive}
                        >
                            {t(`filters.${chip}`)}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
