import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminActivityLogs } from "@/hooks/useAdminActivityLogs";
import type { IAdminActivityEntry } from "@/types/admin";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Bot, Coins, FileText, Pencil, Folder, type LucideIcon } from "lucide-react";

const DEFAULT_LIMIT = 50;

type CategoryFilter = "all" | "ai" | "tokens" | "notes" | "folders";

const ICON_MAP: Record<IAdminActivityEntry["iconHint"], LucideIcon> = {
    bot: Bot,
    coins: Coins,
    "file-text": FileText,
    pencil: Pencil,
    folder: Folder,
};

const CATEGORY_COLORS: Record<CategoryFilter, string> = {
    all: "text-foreground",
    ai: "text-brand-600 dark:text-brand-400",
    tokens: "text-success",
    notes: "text-info",
    folders: "text-warning",
};

export function AdminActivityLogsPage() {
    const { t } = useTranslation("admin");
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const {
        data: response,
        isLoading,
        isError,
    } = useAdminActivityLogs({
        category,
        q: search,
        limit,
        offset: 0,
    });

    const entries = response?.entries || [];
    const total = response?.total || 0;
    const hasMore = entries.length < total;

    const categoryTabs: Array<{ value: CategoryFilter; label: string }> = [
        { value: "all", label: t("activityLogs.tabs.all") },
        { value: "ai", label: t("activityLogs.tabs.ai") },
        { value: "tokens", label: t("activityLogs.tabs.tokens") },
        { value: "notes", label: t("activityLogs.tabs.notes") },
        { value: "folders", label: t("activityLogs.tabs.folders") },
    ];

    const handleLoadMore = () => {
        setLimit((prev) => prev + DEFAULT_LIMIT);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setLimit(DEFAULT_LIMIT); // Reset limit when searching
    };

    const handleCategoryChange = (newCategory: CategoryFilter) => {
        setCategory(newCategory);
        setLimit(DEFAULT_LIMIT); // Reset limit when changing category
    };

    return (
        <div className="mx-auto flex w-full flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col gap-4">
                <div className="text-muted-foreground flex items-center gap-2">
                    <Clock className="size-5" aria-hidden />
                    <span className="text-sm font-medium tracking-wider uppercase">
                        {t("activityLogs.eyebrow")}
                    </span>
                </div>
                <h1 className="text-foreground text-4xl font-bold tracking-tighter">
                    {t("activityLogs.title")}
                </h1>
                <p className="text-foreground text-lg leading-7">
                    {t("activityLogs.subtitle")}
                </p>
            </header>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
                {categoryTabs.map(({ value, label }) => {
                    const isActive = category === value;
                    return (
                        <Badge
                            key={value}
                            variant={isActive ? "default" : "outline"}
                            className="cursor-pointer px-4 py-2 text-sm font-medium"
                            onClick={() => handleCategoryChange(value)}
                        >
                            {label}
                        </Badge>
                    );
                })}
            </div>

            {/* Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                    <Input
                        placeholder={t("activityLogs.searchPlaceholder")}
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full"
                    />
                </div>
                {search && (
                    <Button
                        variant="outline"
                        onClick={() => handleSearchChange("")}
                        className="gap-2"
                    >
                        {t("activityLogs.clear")}
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {isLoading && entries.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">
                        {t("activityLogs.loading")}
                    </div>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <Alert variant="destructive">
                    <AlertDescription>{t("activityLogs.loadError")}</AlertDescription>
                </Alert>
            )}

            {/* Empty State */}
            {!isLoading && !isError && entries.length === 0 && (
                <Alert>
                    <AlertDescription>{t("activityLogs.empty")}</AlertDescription>
                </Alert>
            )}

            {/* Activity Timeline */}
            {entries.length > 0 && (
                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        {t("activityLogs.showing", {
                            count: entries.length,
                            total: total.toLocaleString(),
                        })}
                    </div>

                    <div className="space-y-3">
                        {entries.map((entry) => (
                            <ActivityLogCard key={entry.id} entry={entry} />
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="gap-2"
                                variant="outline"
                            >
                                {t("activityLogs.loadMore")}
                                <RefreshCw
                                    className={cn(
                                        "size-4",
                                        isLoading && "animate-spin",
                                    )}
                                />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ActivityLogCardProps {
    entry: IAdminActivityEntry;
}

function ActivityLogCard({ entry }: ActivityLogCardProps) {
    const Icon = ICON_MAP[entry.iconHint] || FileText;
    const colorClass = CATEGORY_COLORS[entry.category] || "text-foreground";

    return (
        <div className="bg-card border-border hover:bg-accent/50 group rounded-2xl border p-4 transition-colors">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className={cn(
                        "bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl",
                        "transition-transform group-hover:scale-110",
                    )}
                >
                    <Icon className={cn("size-5", colorClass)} aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-foreground text-sm font-semibold">
                            {entry.title}
                        </p>
                        <time
                            className="text-muted-foreground text-xs"
                            dateTime={entry.createdAt}
                        >
                            {formatTimeAgo(new Date(entry.createdAt))}
                        </time>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 text-sm">
                        {entry.description}
                    </p>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium">{entry.userEmail}</span>
                        {entry.userName && (
                            <>
                                <span>·</span>
                                <span>{entry.userName}</span>
                            </>
                        )}
                        <span>·</span>
                        <Badge variant="outline" className="text-xs">
                            {entry.category}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}
