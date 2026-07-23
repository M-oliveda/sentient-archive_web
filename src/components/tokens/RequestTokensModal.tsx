import { useState } from "react";
import { Coins, ArrowRight, CheckCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/stores/authStore";
import { useRequestTokens } from "@/hooks/useRequestTokens";

interface IRequestTokensModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RequestTokensModal({ open, onOpenChange }: IRequestTokensModalProps) {
    const { user } = useAuthStore();
    const [amount, setAmount] = useState("");
    const [justification, setJustification] = useState("");
    const [succeeded, setSucceeded] = useState(false);
    const requestTokens = useRequestTokens();

    const parsedAmount = parseInt(amount, 10);
    const trimmedJustification = justification.trim();
    const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
    const isValidJustification = trimmedJustification.length >= 3;
    const canSubmit = isValidAmount && isValidJustification;

    const handleSubmit = () => {
        requestTokens.mutate(
            { amount: parsedAmount, justification: trimmedJustification },
            {
                onSuccess: () => {
                    setSucceeded(true);
                },
            },
        );
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) {
            setAmount("");
            setJustification("");
            setSucceeded(false);
            requestTokens.reset();
        }
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card text-card-foreground max-w-md gap-6 rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Coins className="size-5" />
                        Request Tokens
                    </DialogTitle>
                </DialogHeader>

                {succeeded ? (
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <CheckCircle className="text-success size-12" />
                        <p className="text-foreground font-medium">Request sent!</p>
                        <p className="text-muted-foreground text-sm">
                            An admin will review your request and grant tokens shortly.
                        </p>
                        <Button
                            variant="secondary"
                            size="default"
                            onClick={() => handleClose(false)}
                            className="mt-2 rounded-full px-6"
                        >
                            Done
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="bg-muted rounded-xl px-5 py-4">
                            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
                                Current Balance
                            </p>
                            <p className="text-foreground text-2xl font-bold">
                                {(user?.tokenBalance ?? 0).toLocaleString()} Tokens
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token-amount">
                                How many tokens do you need?
                            </Label>
                            <Input
                                id="token-amount"
                                type="number"
                                min={1}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 500"
                                disabled={requestTokens.isPending}
                                size="default"
                                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token-reason">Reason</Label>
                            <Input
                                id="token-reason"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Why do you need more tokens?"
                                disabled={requestTokens.isPending}
                                size="default"
                                maxLength={500}
                            />
                        </div>

                        {requestTokens.isError && (
                            <p className="text-destructive text-sm">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => handleClose(false)}
                                disabled={requestTokens.isPending}
                                className="rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="default"
                                onClick={handleSubmit}
                                disabled={!canSubmit || requestTokens.isPending}
                                className="rounded-full"
                            >
                                {requestTokens.isPending ? (
                                    <>
                                        <Spinner className="size-4" />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        Submit Request
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
