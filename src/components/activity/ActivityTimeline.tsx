import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ActivityTimelineItem } from "./ActivityTimelineItem";
import type { IActivityEntry } from "@/types/activity";

interface IActivityTimelineProps {
    entries: IActivityEntry[];
    isLoading?: boolean;
    isError?: boolean;
}

interface IDateGroup {
    key: string;
    label: string;
    entries: IActivityEntry[];
}

function formatDateHeader(date: Date, language: string, t: TFunction): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const isToday = target.getTime() === today.getTime();
    const formatted = date.toLocaleDateString(language, {
        month: "short",
        day: "numeric",
    });

    if (isToday) {
        return t("timeline.today", { date: formatted });
    }

    return date.toLocaleDateString(language, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function groupByDate(
    entries: IActivityEntry[],
    language: string,
    t: TFunction,
): IDateGroup[] {
    const groups = new Map<string, IDateGroup>();

    for (const entry of entries) {
        const date = new Date(entry.createdAt);
        const key = date.toISOString().slice(0, 10);
        const existing = groups.get(key);
        if (existing) {
            existing.entries.push(entry);
        } else {
            groups.set(key, {
                key,
                label: formatDateHeader(date, language, t),
                entries: [entry],
            });
        }
    }

    return Array.from(groups.values());
}

export function ActivityTimeline({
    entries,
    isLoading = false,
    isError = false,
}: IActivityTimelineProps) {
    const { t, i18n } = useTranslation("activity");

    if (isLoading) {
        return (
            <div className="space-y-4" data-testid="activity-timeline-loading">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-muted h-24 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <p
                className="text-muted-foreground py-8 text-center text-sm"
                data-testid="activity-timeline-error"
            >
                {t("timeline.error")}
            </p>
        );
    }

    if (!entries.length) {
        return (
            <p
                className="text-muted-foreground py-8 text-center text-sm"
                data-testid="activity-timeline-empty"
            >
                {t("timeline.empty")}
            </p>
        );
    }

    const groups = groupByDate(entries, i18n.language, t);

    return (
        <div className="flex flex-col gap-6" data-testid="activity-timeline">
            {groups.map((group) => (
                <section key={group.key} className="flex flex-col gap-3">
                    <div className="bg-primary rounded-2xl px-2 py-3">
                        <h2 className="text-primary-foreground text-sm font-bold tracking-wider uppercase">
                            {group.label}
                        </h2>
                    </div>
                    <div className="px-2">
                        {group.entries.map((entry, index) => (
                            <ActivityTimelineItem
                                key={entry.id}
                                entry={entry}
                                isLast={index === group.entries.length - 1}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
