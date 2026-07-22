import { Bot, Coins, FileText, Folder, Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityIconHint, IActivityEntry } from "@/types/activity";

const ICON_MAP: Record<ActivityIconHint, LucideIcon> = {
    bot: Bot,
    coins: Coins,
    "file-text": FileText,
    folder: Folder,
    pencil: Pencil,
};

interface IActivityTimelineItemProps {
    entry: IActivityEntry;
    isLast?: boolean;
}

export function ActivityTimelineItem({
    entry,
    isLast = false,
}: IActivityTimelineItemProps) {
    const Icon = entry.iconHint ? (ICON_MAP[entry.iconHint] ?? Pencil) : Pencil;

    return (
        <div className="relative flex gap-4 pb-8" data-testid="activity-timeline-item">
            {!isLast ? (
                <div
                    className="bg-secondary absolute top-10 bottom-0 left-6 w-0.5"
                    aria-hidden
                />
            ) : null}
            <div className="bg-secondary relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl">
                <Icon className="text-foreground size-6" aria-hidden />
            </div>
            <div className="bg-secondary flex min-w-0 flex-1 flex-col gap-3 self-stretch rounded-2xl p-3">
                <p className="text-foreground text-lg leading-5 font-medium">
                    {entry.title}
                </p>
                <p className="text-muted-foreground text-sm leading-5">
                    {entry.description}
                </p>
            </div>
        </div>
    );
}
