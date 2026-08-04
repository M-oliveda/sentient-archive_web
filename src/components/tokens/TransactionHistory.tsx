import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import type { ITransaction, TransactionReason } from "@/types/transaction";

const REASON_KEYS: Record<TransactionReason, string> = {
    ai_summarize: "history.reasons.aiSummarize",
    ai_autotag: "history.reasons.aiAutotag",
    ai_flashcards: "history.reasons.aiFlashcards",
    ai_ragquery: "history.reasons.aiRagquery",
    admin_grant: "history.reasons.adminGrant",
    initial_grant: "history.reasons.initialGrant",
};

function formatDate(date: Date, language: string): string {
    return date.toLocaleDateString(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface ITransactionRowProps {
    tx: ITransaction;
}

function TransactionRow({ tx }: ITransactionRowProps) {
    const { t, i18n } = useTranslation("tokens");
    const isCredit = tx.type === "credit";
    const reasonKey = REASON_KEYS[tx.reason];

    return (
        <tr className="border-border border-b last:border-0">
            <td className="text-muted-foreground py-3 pr-4 text-sm">
                {formatDate(tx.createdAt, i18n.language)}
            </td>
            <td className="text-foreground py-3 pr-4 text-sm font-medium">
                {reasonKey ? t(reasonKey) : tx.reason}
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
    const { t } = useTranslation("tokens");
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
                {t("history.empty")}
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full" data-testid="transaction-history-table">
                <thead>
                    <tr className="border-border border-b">
                        <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                            {t("history.date")}
                        </th>
                        <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                            {t("history.action")}
                        </th>
                        <th className="text-muted-foreground pr-4 pb-3 text-right text-xs font-medium tracking-wider uppercase">
                            {t("history.change")}
                        </th>
                        <th className="text-muted-foreground pb-3 text-right text-xs font-medium tracking-wider uppercase">
                            {t("history.balance")}
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
