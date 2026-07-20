import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ITokenBalanceProps {
    balance: number;
    maxBalance?: number;
    lowThreshold?: number;
    warningThreshold?: number;
    className?: string;
}

export function TokenBalance({
    balance,
    maxBalance = 5000,
    lowThreshold = 20,
    warningThreshold = 100,
    className,
}: ITokenBalanceProps) {
    const isLow = balance < lowThreshold;
    const isWarning = !isLow && balance < warningThreshold;

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-baseline gap-2">
                <span
                    className={cn(
                        "text-5xl font-bold tabular-nums",
                        isLow && "text-[hsl(var(--error))]",
                        isWarning && "text-[hsl(var(--warning))]",
                        !isLow && !isWarning && "text-foreground",
                    )}
                    data-testid="token-balance-value"
                >
                    {balance.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-xl">
                    / {maxBalance.toLocaleString()} tokens
                </span>
            </div>
            <Progress value={balance} max={maxBalance} />
            {isLow && (
                <p className="text-sm font-medium text-[hsl(var(--error))]">
                    Balance critically low — request more tokens to continue using AI
                    features.
                </p>
            )}
            {isWarning && (
                <p className="text-sm font-medium text-[hsl(var(--warning))]">
                    Balance running low.
                </p>
            )}
        </div>
    );
}
