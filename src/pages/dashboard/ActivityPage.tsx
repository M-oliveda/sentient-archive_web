import { useQueryState } from "nuqs";
import { Clock } from "lucide-react";
import {
    ActivityFilterBar,
    ActivityStatsCards,
    ActivityTimeline,
} from "@/components/activity";
import { useActivityFeed, useActivityStats } from "@/hooks/useActivity";
import type { ActivityFilterCategory } from "@/types/activity";

const VALID_CATEGORIES: ActivityFilterCategory[] = [
    "all",
    "ai",
    "tokens",
    "notes",
    "folders",
];

function parseCategory(value: string): ActivityFilterCategory {
    return VALID_CATEGORIES.includes(value as ActivityFilterCategory)
        ? (value as ActivityFilterCategory)
        : "all";
}

export function ActivityPage() {
    const [category, setCategory] = useQueryState<ActivityFilterCategory>("category", {
        defaultValue: "all",
        parse: parseCategory,
    });
    const [search, setSearch] = useQueryState("q", { defaultValue: "" });

    const { data: stats, isLoading: isStatsLoading } = useActivityStats();
    const {
        data: entries = [],
        isLoading: isFeedLoading,
        isError: isFeedError,
    } = useActivityFeed({
        category: category ?? "all",
        q: search ?? "",
    });

    return (
        <div className="mx-auto flex w-full flex-col gap-10">
            <header className="flex flex-col gap-5">
                <div className="text-muted-foreground flex items-center gap-2">
                    <Clock className="size-5" aria-hidden />
                    <span className="text-sm font-medium tracking-wider uppercase">
                        Activity
                    </span>
                </div>
                <h1 className="text-foreground text-4xl font-bold tracking-tighter">
                    Activity Log
                </h1>
                <p className="text-foreground text-lg leading-7">
                    Track all your actions, AI operations, and token usage history.
                </p>
            </header>

            <ActivityStatsCards stats={stats} isLoading={isStatsLoading} />

            <ActivityFilterBar
                category={category ?? "all"}
                search={search ?? ""}
                onCategoryChange={(next) => {
                    void setCategory(next);
                }}
                onSearchChange={(next) => {
                    void setSearch(next);
                }}
            />

            <ActivityTimeline
                entries={entries}
                isLoading={isFeedLoading}
                isError={isFeedError}
            />
        </div>
    );
}
