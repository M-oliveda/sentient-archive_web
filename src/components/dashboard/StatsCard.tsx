import { cn } from "@/lib/utils";

interface IStatsCardAction {
    label: string;
    onClick?: () => void;
}

interface IStatsCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    action?: IStatsCardAction;
    variant?: "default" | "accent";
    className?: string;
}

export function StatsCard({
    icon: Icon,
    label,
    value,
    action,
    variant = "default",
    className,
}: IStatsCardProps) {
    const isAccent = variant === "accent";

    return (
        <div
            className={cn(
                "flex min-w-45 flex-col gap-2 rounded-2xl p-5",
                isAccent ? "bg-accent" : "bg-muted",
                className,
            )}
        >
            <div className="flex size-10 items-center justify-center rounded-full bg-white/30">
                <Icon
                    className={cn(
                        "size-5",
                        isAccent ? "text-accent-foreground" : "text-foreground",
                    )}
                />
            </div>
            <p
                className={cn(
                    "text-sm font-medium",
                    isAccent ? "text-accent-foreground/70" : "text-muted-foreground",
                )}
            >
                {label}
            </p>
            <p
                className={cn(
                    "text-2xl font-bold",
                    isAccent ? "text-accent-foreground" : "text-foreground",
                )}
            >
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value.length > 10
                      ? value.substring(0, 10) + "..."
                      : value}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className={cn(
                        "mt-auto self-end text-left text-xs font-semibold underline-offset-2 hover:underline",
                        isAccent ? "text-accent-foreground" : "text-foreground",
                    )}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
