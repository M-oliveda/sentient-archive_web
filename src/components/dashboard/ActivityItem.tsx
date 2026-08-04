interface IActivityItemProps {
    name: string;
    action: string;
    timeAgo: string;
    avatarUrl?: string;
}

export function ActivityItem({ name, action, timeAgo, avatarUrl }: IActivityItemProps) {
    const initials = name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex items-start gap-3">
            <div className="bg-card size-8 shrink-0 overflow-hidden rounded-full">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="text-foreground flex size-full items-center justify-center text-xs font-semibold">
                        {initials}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">
                    <span className="font-semibold">{name}</span> {action}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{timeAgo}</p>
            </div>
        </div>
    );
}
