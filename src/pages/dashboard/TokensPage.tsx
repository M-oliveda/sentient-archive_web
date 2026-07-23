import { useState } from "react";
import { Coins } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TokenBalance } from "@/components/tokens/TokenBalance";
import { TransactionHistory } from "@/components/tokens/TransactionHistory";
import { PendingRequests } from "@/components/tokens/PendingRequests";
import { RequestTokensModal } from "@/components/tokens/RequestTokensModal";

export function TokensPage() {
    const { user } = useAuthStore();
    const { data: tokenBalanceData } = useTokenBalance();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const balance = tokenBalanceData?.balance ?? user?.tokenBalance ?? 0;

    return (
        <>
            <div className="space-y-10">
                {/* Header */}
                <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="text-muted-foreground mb-2 flex items-center gap-2">
                            <Coins className="size-5" />
                            <span className="text-sm font-medium tracking-wider uppercase">
                                Token Management
                            </span>
                        </div>
                        <h1 className="text-foreground text-3xl font-bold">
                            Token Balance
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Track your token usage and request more when needed.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full px-5 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:shrink-0"
                        data-testid="request-tokens-button"
                    >
                        Request More Tokens
                    </button>
                </section>

                {/* Balance card */}
                <section className="bg-muted rounded-2xl p-6">
                    <TokenBalance balance={balance} />
                </section>

                {/* Token requests */}
                <PendingRequests />

                {/* Transaction history */}
                <section className="space-y-4">
                    <h2 className="text-foreground text-xl font-bold">
                        Transaction History
                    </h2>
                    <TransactionHistory />
                </section>
            </div>

            <RequestTokensModal
                open={isRequestModalOpen}
                onOpenChange={setIsRequestModalOpen}
            />
        </>
    );
}
