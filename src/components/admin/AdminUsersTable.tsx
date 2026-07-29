import { Coins, MoreVertical, Pencil, Shield, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { IAdminUser } from "@/types/admin";
import { cn, formatTimeAgo } from "@/lib/utils";

const LOW_TOKEN_THRESHOLD = 1000;

interface AdminUsersTableProps {
    data: IAdminUser[];
    isLoading: boolean;
    onEditUser: (user: IAdminUser) => void;
    onToggleActive: (user: IAdminUser) => void;
    onToggleAdmin: (user: IAdminUser) => void;
    isUpdating?: boolean;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function RoleBadge({ role }: { role: IAdminUser["role"] }) {
    const { t } = useTranslation("admin");
    const isAdmin = role === "admin";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
                isAdmin
                    ? "border-brand-500/30 bg-brand-800/15 text-brand-600 dark:border-brand-400/20 dark:bg-brand-900/80 dark:text-brand-300"
                    : "border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted/60 dark:text-muted-foreground",
            )}
        >
            {isAdmin ? (
                <Shield className="size-3 opacity-80" aria-hidden="true" />
            ) : (
                <User className="size-3 opacity-80" aria-hidden="true" />
            )}
            {isAdmin ? t("users.table.admin") : t("users.table.client")}
        </span>
    );
}

function RowActionsMenu({
    user,
    onEditUser,
    onToggleAdmin,
}: {
    user: IAdminUser;
    onEditUser: (user: IAdminUser) => void;
    onToggleAdmin: (user: IAdminUser) => void;
}) {
    const { t } = useTranslation("admin");
    const displayName = user.displayName || user.email;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={t("users.table.actionsFor", { name: displayName })}
                    />
                }
            >
                <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem onClick={() => onEditUser(user)}>
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {t("users.table.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleAdmin(user)}>
                    <Shield className="size-3.5" aria-hidden="true" />
                    {user.role === "admin"
                        ? t("users.table.revokeAdmin")
                        : t("users.table.grantAdmin")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AdminUsersTable({
    data,
    isLoading,
    onEditUser,
    onToggleActive,
    onToggleAdmin,
    isUpdating = false,
}: AdminUsersTableProps) {
    const { t } = useTranslation("admin");

    if (isLoading) {
        return (
            <div className="border-border flex items-center justify-center rounded-3xl border py-16">
                <p className="text-muted-foreground text-sm">{t("users.loading")}</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <Alert className="rounded-3xl">
                <AlertDescription>{t("users.empty")}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Table
            className="w-full min-w-[320px] table-fixed"
            containerClassName="border-border rounded-3xl border shadow-sm ring-0"
        >
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground px-3 py-4 font-bold sm:px-4 sm:py-6">
                        {t("users.table.user")}
                    </TableHead>
                    <TableHead className="text-muted-foreground w-24 px-3 py-4 font-bold sm:w-28 sm:px-4 sm:py-6">
                        {t("users.table.role")}
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden w-40 px-4 py-6 font-bold whitespace-nowrap md:table-cell">
                        {t("users.table.tokenBalance")}
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden w-28 px-4 py-6 font-bold whitespace-nowrap lg:table-cell">
                        {t("users.table.lastActive")}
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden w-16 py-6 pr-1 pl-4 font-bold whitespace-nowrap md:table-cell">
                        {t("users.table.status")}
                    </TableHead>
                    <TableHead className="w-12 px-1 py-4 sm:py-6">
                        <span className="sr-only">{t("users.table.actions")}</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((user) => {
                    const displayName = user.displayName || user.email;
                    const isLowBalance = user.tokenBalance < LOW_TOKEN_THRESHOLD;
                    const lastActive = user.lastLoginAt
                        ? formatTimeAgo(new Date(user.lastLoginAt))
                        : "—";

                    return (
                        <TableRow key={user.uid} className="hover:bg-muted/30">
                            <TableCell className="max-w-0 px-3 py-3 whitespace-normal sm:px-4 sm:py-4">
                                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                    <Avatar
                                        size="lg"
                                        className="size-9 shrink-0 after:hidden sm:size-10"
                                    >
                                        <AvatarImage
                                            src={user.photoURL ?? undefined}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            {getInitials(displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-foreground truncate text-sm font-bold">
                                            {displayName}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="w-24 px-2 py-3 whitespace-nowrap sm:w-28 sm:px-4 sm:py-4">
                                <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell className="hidden w-40 px-4 py-4 whitespace-nowrap md:table-cell">
                                <div className="flex items-center gap-2">
                                    <Coins
                                        className={cn(
                                            "size-4 shrink-0",
                                            isLowBalance
                                                ? "text-error/80"
                                                : "text-brand-400 dark:text-brand-300",
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="text-foreground font-mono text-base font-semibold tabular-nums">
                                        {user.tokenBalance.toLocaleString()}
                                    </span>
                                    {isLowBalance && (
                                        <span className="border-error/20 bg-error/10 text-error dark:border-error/30 dark:bg-error/15 rounded-md border px-1.5 py-0.5 text-xs font-medium dark:text-red-300/90">
                                            {t("users.table.low")}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden w-28 px-4 py-4 text-sm whitespace-nowrap lg:table-cell">
                                {lastActive}
                            </TableCell>
                            <TableCell className="hidden w-16 py-4 pr-0 pl-4 whitespace-nowrap md:table-cell">
                                <Switch
                                    checked={user.isActive}
                                    disabled={isUpdating}
                                    onCheckedChange={() => onToggleActive(user)}
                                    aria-label={t("users.table.toggleActive", {
                                        name: displayName,
                                    })}
                                    className="data-checked:bg-brand-700 dark:data-checked:bg-brand-400"
                                />
                            </TableCell>
                            <TableCell className="w-12 px-1 py-3 whitespace-nowrap sm:py-4 sm:pr-3 sm:pl-1">
                                <RowActionsMenu
                                    user={user}
                                    onEditUser={onEditUser}
                                    onToggleAdmin={onToggleAdmin}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
