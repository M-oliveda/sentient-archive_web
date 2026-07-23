import { useState } from "react";
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

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Denied" },
    { value: "all", label: "All History" },
];

export function AdminTokenRequestsPage() {
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
            toast.success("Token request approved");
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to approve request",
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
            toast.success("Token request rejected");
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to reject request",
            );
        }
    };

    if (isLoading && !requestsResponse) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading token requests...</div>
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

    return (
        <section className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-foreground text-4xl font-bold tracking-tight">
                    Token Requests
                </h1>
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {STATUS_TABS.map(({ value, label }) => {
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
                            {label === "Pending" && urgentCount > 0 && (
                                <span className="text-error">
                                    {urgentCount} Urgent (Low Balance)
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
                    Failed to load token requests. Please try again.
                </div>
            ) : requests.length === 0 ? (
                <Alert>
                    <AlertDescription>No token requests found.</AlertDescription>
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
                        Load More
                        <RefreshCw className="size-4" />
                    </Button>
                </div>
            )}

            {requests.length > 0 && (
                <div className="text-muted-foreground text-center text-sm">
                    Showing {requests.length} of {total}
                </div>
            )}

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Token Request</DialogTitle>
                        <DialogDescription>
                            From{" "}
                            {selectedRequest?.userName || selectedRequest?.userEmail}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Amount</Label>
                                <Input
                                    type="number"
                                    value={approveAmount}
                                    onChange={(e) => setApproveAmount(e.target.value)}
                                    disabled={approveMutation.isPending}
                                    min="1"
                                />
                                <p className="text-muted-foreground text-xs">
                                    Original request: {selectedRequest.amount} tokens
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">
                                    Notes (Optional)
                                </Label>
                                <Input
                                    id="notes"
                                    placeholder="Approval notes..."
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
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleSubmitApprove(selectedRequest)}
                                    disabled={approveMutation.isPending}
                                >
                                    {approveMutation.isPending
                                        ? "Approving..."
                                        : "Approve"}
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
                        <DialogTitle>Reject Token Request</DialogTitle>
                        <DialogDescription>
                            From{" "}
                            {selectedRequest?.userName || selectedRequest?.userEmail}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-sm font-medium">
                                    Reason (Optional)
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder="Rejection reason..."
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
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleSubmitReject(selectedRequest)}
                                    disabled={rejectMutation.isPending}
                                >
                                    {rejectMutation.isPending
                                        ? "Rejecting..."
                                        : "Reject"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
