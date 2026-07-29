import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TokenRequestCard } from "@/components/admin";
import type { TokenRequestsQueryParams } from "@/hooks/useTokenRequests";
import {
    useTokenRequests,
    useApproveTokenRequest,
    useRejectTokenRequest,
} from "@/hooks/useTokenRequests";
import type { ITokenRequest } from "@/types/admin";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_LIMIT = 25;

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export function AdminTokenRequestsPage() {
    const { t } = useTranslation("admin");
    const [queryParams, setQueryParams] = useState<TokenRequestsQueryParams>({
        limit: DEFAULT_LIMIT,
        offset: 0,
        status: "pending",
    });

    const [selectedRequest, setSelectedRequest] = useState<ITokenRequest | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [approveAmount, setApproveAmount] = useState<string>("");
    const [approveNotes, setApproveNotes] = useState<string>("");
    const [rejectReason, setRejectReason] = useState<string>("");

    const {
        data: requestsResponse,
        isLoading,
        isError,
    } = useTokenRequests(queryParams);
    const approveMutation = useApproveTokenRequest();
    const rejectMutation = useRejectTokenRequest();

    const statusTabs: Array<{ value: StatusFilter; label: string }> = [
        { value: "pending", label: t("tokenRequests.tabs.pending") },
        { value: "approved", label: t("tokenRequests.tabs.approved") },
        { value: "rejected", label: t("tokenRequests.tabs.denied") },
        { value: "all", label: t("tokenRequests.tabs.allHistory") },
    ];

    const handleStatusFilter = (status: StatusFilter) => {
        setQueryParams({
            limit: DEFAULT_LIMIT,
            offset: 0,
            status,
        });
    };

    const handleApproveClick = (request: ITokenRequest) => {
        setSelectedRequest(request);
        setApproveAmount(request.amount.toString());
        setApproveNotes("");
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (request: ITokenRequest) => {
        setSelectedRequest(request);
        setRejectReason("");
        setIsRejectModalOpen(true);
    };

    const handleLoadMore = () => {
        setQueryParams((prev) => ({
            ...prev,
            limit: (prev.limit as number) + DEFAULT_LIMIT,
        }));
    };

    const handleSubmitApprove = async (request: ITokenRequest) => {
        try {
            await approveMutation.mutateAsync({
                requestId: request.id,
                payload: {
                    amount: approveAmount ? parseInt(approveAmount) : undefined,
                    notes: approveNotes || undefined,
                },
            });
            toast.success(t("tokenRequests.approveSuccess"));
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("tokenRequests.approveError"),
            );
        }
    };

    const handleSubmitReject = async (request: ITokenRequest) => {
        try {
            await rejectMutation.mutateAsync({
                requestId: request.id,
                payload: {
                    reason: rejectReason || undefined,
                },
            });
            toast.success(t("tokenRequests.rejectSuccess"));
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : t("tokenRequests.rejectError"),
            );
        }
    };

    if (isLoading && !requestsResponse) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">
                    {t("tokenRequests.loading")}
                </div>
            </div>
        );
    }

    const requests = requestsResponse?.requests || [];
    const total = requestsResponse?.total || 0;
    const urgentCount = requests.filter(
        (request) => request.isUrgent && request.status === "pending",
    ).length;
    const hasMore = requests.length > 0 && requests.length < total;
    const isProcessing = approveMutation.isPending || rejectMutation.isPending;
    const fromName = selectedRequest?.userName || selectedRequest?.userEmail || "";

    return (
        <section className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-foreground text-4xl font-bold tracking-tight">
                    {t("tokenRequests.title")}
                </h1>
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {statusTabs.map(({ value, label }) => {
                    const isActive = queryParams.status === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleStatusFilter(value)}
                            className={cn(
                                "text-sm font-bold transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground rounded-xl px-2 py-1"
                                    : "text-foreground hover:text-foreground/80",
                            )}
                        >
                            <span>{label}</span>
                            {value === "pending" && urgentCount > 0 && (
                                <span className="text-error">
                                    {t("tokenRequests.urgentCount", {
                                        count: urgentCount,
                                    })}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Requests grid */}
            {isError ? (
                <div
                    className="border-error/40 bg-error/5 text-error rounded-3xl border px-4 py-6 text-sm"
                    role="alert"
                >
                    {t("tokenRequests.loadError")}
                </div>
            ) : requests.length === 0 ? (
                <Alert>
                    <AlertDescription>{t("tokenRequests.empty")}</AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {requests.map((request) => (
                        <TokenRequestCard
                            key={request.id}
                            request={request}
                            onApprove={handleApproveClick}
                            onReject={handleRejectClick}
                            isProcessing={isProcessing}
                        />
                    ))}
                </div>
            )}

            {/* Load more */}
            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        className="gap-2"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                    >
                        {t("tokenRequests.loadMore")}
                        <RefreshCw className="size-4" />
                    </Button>
                </div>
            )}

            {requests.length > 0 && (
                <div className="text-muted-foreground text-center text-sm">
                    {t("tokenRequests.showing", {
                        count: requests.length,
                        total,
                    })}
                </div>
            )}

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("tokenRequests.approveModal.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("tokenRequests.approveModal.from", { name: fromName })}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {t("tokenRequests.approveModal.amount")}
                                </Label>
                                <Input
                                    type="number"
                                    value={approveAmount}
                                    onChange={(e) => setApproveAmount(e.target.value)}
                                    disabled={approveMutation.isPending}
                                    min="1"
                                />
                                <p className="text-muted-foreground text-xs">
                                    {t("tokenRequests.approveModal.originalRequest", {
                                        amount: selectedRequest.amount,
                                    })}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">
                                    {t("tokenRequests.approveModal.notes")}
                                </Label>
                                <Input
                                    id="notes"
                                    placeholder={t(
                                        "tokenRequests.approveModal.notesPlaceholder",
                                    )}
                                    value={approveNotes}
                                    onChange={(e) => setApproveNotes(e.target.value)}
                                    disabled={approveMutation.isPending}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsApproveModalOpen(false)}
                                    disabled={approveMutation.isPending}
                                >
                                    {t("tokenRequests.approveModal.cancel")}
                                </Button>
                                <Button
                                    onClick={() => handleSubmitApprove(selectedRequest)}
                                    disabled={approveMutation.isPending}
                                >
                                    {approveMutation.isPending
                                        ? t("tokenRequests.approveModal.approving")
                                        : t("tokenRequests.approveModal.approve")}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("tokenRequests.rejectModal.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("tokenRequests.rejectModal.from", { name: fromName })}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-sm font-medium">
                                    {t("tokenRequests.rejectModal.reason")}
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder={t(
                                        "tokenRequests.rejectModal.reasonPlaceholder",
                                    )}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    disabled={rejectMutation.isPending}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRejectModalOpen(false)}
                                    disabled={rejectMutation.isPending}
                                >
                                    {t("tokenRequests.rejectModal.cancel")}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleSubmitReject(selectedRequest)}
                                    disabled={rejectMutation.isPending}
                                >
                                    {rejectMutation.isPending
                                        ? t("tokenRequests.rejectModal.rejecting")
                                        : t("tokenRequests.rejectModal.reject")}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
