import { History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ITokenRequest } from "@/types/admin";
import { cn, formatTimeAgo, formatTokenAmount } from "@/lib/utils";

interface TokenRequestCardProps {
    request: ITokenRequest;
    onApprove: (request: ITokenRequest) => void;
    onReject: (request: ITokenRequest) => void;
    isProcessing?: boolean;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export function TokenRequestCard({
    request,
    onApprove,
    onReject,
    isProcessing = false,
}: TokenRequestCardProps) {
    const { t } = useTranslation("admin");
    const displayName =
        request.userName ||
        request.userDisplayName ||
        request.userEmail ||
        t("tokenRequests.card.unknownUser");
    const isPending = request.status === "pending";
    const isUrgent = Boolean(request.isUrgent) && isPending;
    const currentBalance = request.currentBalance ?? 0;

    return (
        <div
            className={cn(
                "bg-card flex flex-col overflow-hidden rounded-[32px] border",
                isUrgent ? "border-error border-2" : "border-border",
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="lg" className="shrink-0">
                        <AvatarImage src={request.userAvatarUrl} alt={displayName} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-bold">
                            {displayName}
                        </p>
                        {request.userEmail && (
                            <p className="text-muted-foreground truncate text-xs">
                                {request.userEmail}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    {isUrgent && (
                        <Badge className="bg-error border-transparent text-white">
                            {t("tokenRequests.card.urgent")}
                        </Badge>
                    )}
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatTimeAgo(new Date(request.createdAt))}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-4 px-5 py-2">
                <div className="flex gap-3">
                    <div className="bg-muted flex-1 rounded-3xl p-3">
                        <p className="text-muted-foreground text-xs tracking-wider uppercase">
                            {t("tokenRequests.card.current")}
                        </p>
                        <p
                            className={cn(
                                "text-lg font-bold",
                                isUrgent ? "text-error" : "text-foreground",
                            )}
                        >
                            {formatTokenAmount(currentBalance)}
                        </p>
                    </div>
                    <div className="bg-primary text-primary-foreground flex-1 rounded-3xl p-3">
                        <p className="text-xs tracking-wider uppercase opacity-80">
                            {t("tokenRequests.card.requested")}
                        </p>
                        <p
                            className={cn(
                                "text-lg font-bold",
                                isUrgent && "text-error",
                            )}
                        >
                            {formatTokenAmount(request.amount)}
                        </p>
                    </div>
                </div>

                {request.justification && (
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-bold">
                            {t("tokenRequests.card.justification")}
                        </p>
                        <p className="text-foreground text-sm">
                            &ldquo;{request.justification}&rdquo;
                        </p>
                    </div>
                )}

                {request.lastGrantAt && (
                    <div className="border-border flex items-center gap-2 border-t pt-3">
                        <History className="text-muted-foreground size-4" />
                        <span className="text-muted-foreground text-xs">
                            {t("tokenRequests.card.lastGrant", {
                                time: formatTimeAgo(new Date(request.lastGrantAt)),
                            })}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3">
                {isPending ? (
                    <>
                        <Button
                            className="bg-error hover:bg-error/90 border-none text-white"
                            onClick={() => onReject(request)}
                            disabled={isProcessing}
                        >
                            {t("tokenRequests.card.reject")}
                        </Button>
                        <Button
                            className="bg-success hover:bg-success/90 border-none text-white"
                            onClick={() => onApprove(request)}
                            disabled={isProcessing}
                        >
                            {t("tokenRequests.card.approve")}
                        </Button>
                    </>
                ) : (
                    <Badge
                        variant={
                            request.status === "approved" ? "success" : "destructive"
                        }
                        className="capitalize"
                    >
                        {request.status === "rejected"
                            ? t("tokenRequests.card.denied")
                            : t("tokenRequests.card.approved")}
                    </Badge>
                )}
            </div>
        </div>
    );
}
