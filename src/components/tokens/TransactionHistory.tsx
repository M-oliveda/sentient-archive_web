import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import type { ITransaction, TransactionReason } from "@/types/transaction";

const REASON_LABELS: Record<TransactionReason, string> = {
    ai_summarize: "AI Summary",
    ai_autotag: "AI Auto-Tag",
    ai_flashcards: "AI Flashcards",
    ai_ragquery: "AI Q&A",
    admin_grant: "Admin Grant",
    initial_grant: "Welcome Bonus",
};

function formatReason(reason: TransactionReason): string {
    return REASON_LABELS[reason] ?? reason;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface ITransactionRowProps {
    tx: ITransaction;
}

function TransactionRow({ tx }: ITransactionRowProps) {
    const isCredit = tx.type === "credit";

    return (
        <tr className="border-border border-b last:border-0">
            <td className="text-muted-foreground py-3 pr-4 text-sm">
                {formatDate(tx.createdAt)}
            </td>
            <td className="text-foreground py-3 pr-4 text-sm font-medium">
                {formatReason(tx.reason)}
            </td>
            <td
                className={cn(
                    "py-3 pr-4 text-right text-sm font-semibold tabular-nums",
                    isCredit
                        ? "text-[hsl(var(--success))]"
                        : "text-[hsl(var(--error))]",
                )}
            >
                {isCredit ? "+" : "−"}
                {tx.amount.toLocaleString()}
            </td>
            <td className="text-foreground py-3 text-right text-sm tabular-nums">
                {tx.balanceAfter.toLocaleString()}
            </td>
        </tr>
    );
}

export function TransactionHistory() {
    const { data: transactions, isLoading } = useTransactions();

    if (isLoading) {
        return (
            <div className="space-y-3" data-testid="transaction-history-loading">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (!transactions?.length) {
        return (
            <p
                className="text-muted-foreground py-8 text-center text-sm"
                data-testid="transaction-history-empty"
            >
                No transactions yet. AI features will appear here once you use them.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full" data-testid="transaction-history-table">
                <thead>
                    <tr className="border-border border-b">
                        <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                            Date
                        </th>
                        <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                            Action
                        </th>
                        <th className="text-muted-foreground pr-4 pb-3 text-right text-xs font-medium tracking-wider uppercase">
                            Change
                        </th>
                        <th className="text-muted-foreground pb-3 text-right text-xs font-medium tracking-wider uppercase">
                            Balance
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <TransactionRow key={tx.id} tx={tx} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
