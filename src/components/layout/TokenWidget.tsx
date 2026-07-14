import { Progress } from "../ui/progress";

interface ITokenWidgetProps {
    balance: number;
    maxBalance?: number;
}

export function TokenWidget({ balance, maxBalance = 5000 }: ITokenWidgetProps) {
    return (
        <div className="bg-secondary dark:bg-brand-900 space-y-2 rounded-xl p-4">
            <p className="text-muted-foreground mb-1 text-xs font-medium">Tokens</p>
            <p>
                <span className="text-foreground font-medium">
                    {balance.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-xs">
                    /{maxBalance.toLocaleString()}
                </span>
            </p>
            <Progress value={balance} max={maxBalance} />
        </div>
    );
}
