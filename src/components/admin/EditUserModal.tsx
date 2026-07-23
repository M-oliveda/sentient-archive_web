import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { IAdminUser } from "@/types/admin";
import { toast } from "sonner";

interface EditUserModalProps {
    user: IAdminUser | null;
    isOpen: boolean;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (
        userId: string,
        updates: Partial<{
            role: "client" | "admin";
            isActive: boolean;
            tokenBalance: number;
        }>,
    ) => Promise<void>;
}

export function EditUserModal({
    user,
    isOpen,
    isLoading,
    onOpenChange,
    onSubmit,
}: EditUserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [role, setRole] = useState<"client" | "admin">(user?.role || "client");
    const [isActive, setIsActive] = useState(user?.isActive ?? true);
    const [tokenBalance, setTokenBalance] = useState(user?.tokenBalance || 0);

    useEffect(() => {
        if (!user) return;
        setRole(user.role);
        setIsActive(user.isActive);
        setTokenBalance(user.tokenBalance);
    }, [user, isOpen]);

    const handleSubmit = async (currentUser: IAdminUser) => {
        setIsSubmitting(true);
        try {
            await onSubmit(currentUser.uid, {
                role,
                isActive,
                tokenBalance,
            });
            toast.success("User updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update user",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.5">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user details: {user?.email}
                    </DialogDescription>
                </DialogHeader>

                {user && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Role</Label>
                            <div className="flex gap-2">
                                {(["client", "admin"] as const).map((r) => (
                                    <Badge
                                        key={r}
                                        variant={role === r ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-2 text-sm font-medium capitalize"
                                        onClick={() => setRole(r)}
                                    >
                                        {r}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="flex gap-2">
                                {(["Active", "Inactive"] as const).map((status) => {
                                    const isActiveValue = status === "Active";
                                    return (
                                        <Badge
                                            key={status}
                                            variant={
                                                isActive === isActiveValue
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="cursor-pointer px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsActive(isActiveValue)}
                                        >
                                            {status}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="tokenBalance"
                                className="text-sm font-medium"
                            >
                                Token Balance
                            </Label>
                            <Input
                                id="tokenBalance"
                                type="number"
                                placeholder="0"
                                value={tokenBalance}
                                onChange={(e) =>
                                    setTokenBalance(parseInt(e.target.value) || 0)
                                }
                                disabled={isSubmitting || isLoading}
                                min="0"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting || isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleSubmit(user)}
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
