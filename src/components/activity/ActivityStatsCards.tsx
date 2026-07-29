import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { IActivityStats } from "@/types/activity";

interface IActivityStatsCardsProps {
    stats?: IActivityStats;
    isLoading?: boolean;
}

interface IStatCardProps {
    label: string;
    value: string;
    deltaPct?: number;
    className?: string;
}

function StatCard({ label, value, deltaPct, className }: IStatCardProps) {
    const showDelta = typeof deltaPct === "number";

    return (
        <div
            className={cn(
                "bg-secondary flex flex-col justify-between overflow-hidden rounded-2xl p-5",
                className,
            )}
            data-testid="activity-stat-card"
        >
            <p className="text-foreground text-sm font-medium">{label}</p>
            <div className="flex items-end gap-0">
                <p className="text-foreground text-3xl font-bold tabular-nums">
                    {value}
                </p>
                {showDelta ? (
                    <div className="flex items-center gap-0 px-2 py-1">
                        <ArrowUp
                            className="size-4 text-[hsl(var(--success))]"
                            aria-hidden
                        />
                        <span className="text-xs font-bold text-[hsl(var(--success))]">
                            {Math.abs(deltaPct)}%
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="flex flex-col gap-4" data-testid="activity-stats-loading">
            <div className="flex gap-2">
                <div className="bg-muted h-30 flex-1 animate-pulse rounded-2xl" />
                <div className="bg-muted h-30 flex-1 animate-pulse rounded-2xl" />
            </div>
            <div className="bg-muted h-30w-full animate-pulse rounded-2xl md:hidden" />
            <div className="bg-muted hidden h-30 flex-1 animate-pulse rounded-2xl md:block" />
        </div>
    );
}

export function ActivityStatsCards({
    stats,
    isLoading = false,
}: IActivityStatsCardsProps) {
    const { t, i18n } = useTranslation("activity");

    if (isLoading || !stats) {
        return <StatsSkeleton />;
    }

    function formatCount(value: number): string {
        return value.toLocaleString(i18n.language);
    }

    return (
        <div
            className="flex flex-col gap-4 md:flex-row"
            data-testid="activity-stats-cards"
        >
            <div className="flex gap-2 md:contents">
                <StatCard
                    label={t("stats.actionsToday")}
                    value={formatCount(stats.actionsToday)}
                    deltaPct={stats.actionsTodayDeltaPct}
                    className="flex-1"
                />
                <StatCard
                    label={t("stats.aiOpsThisWeek")}
                    value={formatCount(stats.aiOpsThisWeek)}
                    deltaPct={stats.aiOpsThisWeekDeltaPct}
                    className="flex-1"
                />
            </div>
            <StatCard
                label={t("stats.totalActions")}
                value={formatCount(stats.totalActions)}
                className="w-full md:flex-1"
            />
        </div>
    );
}
