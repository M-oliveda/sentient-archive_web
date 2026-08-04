import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { AdminUsersTable, EditUserModal, UserFiltersBar } from "@/components/admin";
import type { AdminUsersQueryParams } from "@/hooks/useAdminUsers";
import { useAdminUsers, useUpdateUser } from "@/hooks/useAdminUsers";
import type { UpdateUserPayload } from "@/hooks/useAdminUsers";
import type { IAdminUser } from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DEFAULT_PAGE_SIZE, buildPageItems, resolvePageOffset } from "@/lib/pagination";

export function AdminUsersPage() {
    const { t } = useTranslation("admin");
    const [queryParams, setQueryParams] = useState<AdminUsersQueryParams>({
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const [selectedUser, setSelectedUser] = useState<IAdminUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: usersResponse, isLoading, isError } = useAdminUsers(queryParams);
    const updateUserMutation = useUpdateUser();

    const users = usersResponse?.users ?? [];
    const total = usersResponse?.total ?? 0;
    const limit = queryParams.limit ?? DEFAULT_PAGE_SIZE;
    const offset = queryParams.offset ?? 0;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const rangeStart = total === 0 ? 0 : offset + 1;
    const rangeEnd = Math.min(offset + users.length, total);
    const canGoPrevious = currentPage > 1 && !isLoading;
    const canGoNext = currentPage < totalPages && !isLoading && total > 0;

    const pageItems = useMemo(
        () => buildPageItems(currentPage, totalPages),
        [currentPage, totalPages],
    );

    const handleEditUser = (user: IAdminUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleToggleActive = async (user: IAdminUser) => {
        try {
            await updateUserMutation.mutateAsync({
                userId: user.uid,
                updates: { isActive: !user.isActive },
            });
            toast.success(
                user.isActive ? t("users.deactivated") : t("users.activated"),
            );
        } catch {
            toast.error(t("users.statusUpdateError"));
        }
    };

    const handleToggleAdmin = async (user: IAdminUser) => {
        try {
            const newRole = user.role === "admin" ? "client" : "admin";
            await updateUserMutation.mutateAsync({
                userId: user.uid,
                updates: { role: newRole },
            });
            toast.success(
                user.role === "admin"
                    ? t("users.adminRevoked")
                    : t("users.adminGranted"),
            );
        } catch {
            toast.error(t("users.roleUpdateError"));
        }
    };

    const handleSaveUser = async (userId: string, updates: UpdateUserPayload) => {
        await updateUserMutation.mutateAsync({
            userId,
            updates,
        });
    };

    const goToPage = (page: number) => {
        setQueryParams((prev) => {
            const pageSize = prev.limit ?? DEFAULT_PAGE_SIZE;
            const nextOffset = resolvePageOffset(
                page,
                total,
                pageSize,
                prev.offset ?? 0,
            );
            if (nextOffset === null) {
                return prev;
            }
            return {
                ...prev,
                limit: pageSize,
                offset: nextOffset,
            };
        });
    };

    const handleSearchChange = (search: string) => {
        setQueryParams((prev) => ({
            ...prev,
            search: search || undefined,
            offset: 0, // Reset to first page
        }));
    };

    const handleRoleChange = (role: "all" | "client" | "admin") => {
        setQueryParams((prev) => ({
            ...prev,
            role: role === "all" ? undefined : role,
            offset: 0, // Reset to first page
        }));
    };

    const handleStatusChange = (status: "all" | true | false) => {
        setQueryParams((prev) => ({
            ...prev,
            isActive: status === "all" ? undefined : status,
            offset: 0, // Reset to first page
        }));
    };

    const handleResetFilters = () => {
        setQueryParams({
            sortBy: "createdAt",
            sortOrder: "desc",
        });
    };

    return (
        <section className="space-y-4 sm:space-y-5">
            <header className="space-y-1">
                <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("users.title")}
                </h1>
                <p className="text-muted-foreground flex items-center gap-1 text-base sm:text-lg">
                    <Users className="size-4 shrink-0" aria-hidden="true" />
                    <span>
                        {isLoading
                            ? t("users.totalUsersLoading")
                            : t("users.totalUsers", {
                                  formatted: total.toLocaleString(),
                              })}
                    </span>
                </p>
            </header>

            <UserFiltersBar
                onSearchChange={handleSearchChange}
                onRoleChange={handleRoleChange}
                onStatusChange={handleStatusChange}
                onReset={handleResetFilters}
                isLoading={isLoading}
            />

            {isError ? (
                <AlertError />
            ) : (
                <>
                    <AdminUsersTable
                        data={users}
                        isLoading={isLoading}
                        onEditUser={handleEditUser}
                        onToggleActive={handleToggleActive}
                        onToggleAdmin={handleToggleAdmin}
                        isUpdating={updateUserMutation.isPending}
                    />

                    <div className="flex flex-col items-center gap-2 pt-1 sm:flex-row sm:justify-between sm:gap-4">
                        <p className="text-muted-foreground text-center text-sm sm:text-left">
                            {t("users.showing", {
                                start: rangeStart,
                                end: rangeEnd,
                                total: total.toLocaleString(),
                            })}
                        </p>

                        <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
                            <PaginationContent className="justify-center">
                                <PaginationItem>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        disabled={!canGoPrevious}
                                        onClick={() => goToPage(currentPage - 1)}
                                        aria-label={t("users.prevPage")}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                </PaginationItem>

                                {pageItems.map((item, index) =>
                                    item === "ellipsis" ? (
                                        <PaginationItem key={`ellipsis-${index}`}>
                                            <span
                                                className="text-muted-foreground flex size-8 items-center justify-center text-sm"
                                                aria-hidden
                                            >
                                                …
                                            </span>
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={item}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={isLoading}
                                                onClick={() => goToPage(item)}
                                                aria-label={t("users.page", {
                                                    page: item,
                                                })}
                                                aria-current={
                                                    item === currentPage
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={cn(
                                                    "size-8 rounded-full text-sm font-medium",
                                                    item === currentPage &&
                                                        "bg-secondary text-foreground hover:bg-secondary",
                                                )}
                                            >
                                                {item}
                                            </Button>
                                        </PaginationItem>
                                    ),
                                )}

                                <PaginationItem>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        disabled={!canGoNext}
                                        onClick={() => goToPage(currentPage + 1)}
                                        aria-label={t("users.nextPage")}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            )}

            <EditUserModal
                user={selectedUser}
                isOpen={isModalOpen}
                isLoading={updateUserMutation.isPending}
                onOpenChange={setIsModalOpen}
                onSubmit={handleSaveUser}
            />
        </section>
    );
}

function AlertError() {
    const { t } = useTranslation("admin");

    return (
        <div
            className="border-error/40 bg-error/5 text-error rounded-3xl border px-4 py-6 text-sm"
            role="alert"
        >
            {t("users.loadError")}
        </div>
    );
}
