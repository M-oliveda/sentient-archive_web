import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("admin");
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
            toast.success(t("users.updated"));
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : t("users.updateError"),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.5">
                <DialogHeader>
                    <DialogTitle>{t("users.edit.title")}</DialogTitle>
                    <DialogDescription>
                        {t("users.edit.description", { email: user?.email })}
                    </DialogDescription>
                </DialogHeader>

                {user && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                {t("users.edit.role")}
                            </Label>
                            <div className="flex gap-2">
                                {(["client", "admin"] as const).map((r) => (
                                    <Badge
                                        key={r}
                                        variant={role === r ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-2 text-sm font-medium capitalize"
                                        onClick={() => setRole(r)}
                                    >
                                        {t(`users.edit.${r}`)}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                {t("users.edit.status")}
                            </Label>
                            <div className="flex gap-2">
                                {(
                                    [
                                        {
                                            value: true,
                                            label: t("users.edit.active"),
                                        },
                                        {
                                            value: false,
                                            label: t("users.edit.inactive"),
                                        },
                                    ] as const
                                ).map(({ value, label }) => (
                                    <Badge
                                        key={label}
                                        variant={
                                            isActive === value ? "default" : "outline"
                                        }
                                        className="cursor-pointer px-3 py-2 text-sm font-medium"
                                        onClick={() => setIsActive(value)}
                                    >
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="tokenBalance"
                                className="text-sm font-medium"
                            >
                                {t("users.edit.tokenBalance")}
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
                                {t("users.edit.cancel")}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleSubmit(user)}
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting
                                    ? t("users.edit.saving")
                                    : t("users.edit.save")}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
