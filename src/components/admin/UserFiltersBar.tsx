import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface UserFiltersBarProps {
    onSearchChange: (search: string) => void;
    onRoleChange: (role: "all" | "client" | "admin") => void;
    onStatusChange: (status: "all" | true | false) => void;
    onReset: () => void;
    isLoading?: boolean;
}

export function UserFiltersBar({
    onSearchChange,
    onRoleChange,
    onStatusChange,
    onReset,
    isLoading = false,
}: UserFiltersBarProps) {
    const { t } = useTranslation("admin");
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<"all" | "client" | "admin">("all");
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, onSearchChange]);

    const handleRoleChange = (newRole: "all" | "client" | "admin") => {
        setRole(newRole);
        onRoleChange(newRole);
    };

    const handleStatusChange = (newStatus: "all" | "active" | "inactive") => {
        setStatus(newStatus);
        if (newStatus === "all") {
            onStatusChange("all");
        } else if (newStatus === "active") {
            onStatusChange(true);
        } else {
            onStatusChange(false);
        }
    };

    const handleReset = useCallback(() => {
        setSearch("");
        setRole("all");
        setStatus("all");
        onReset();
    }, [onReset]);

    const hasActiveFilters = search || role !== "all" || status !== "all";

    const roleLabels: Record<"all" | "client" | "admin", string> = {
        all: t("users.filters.allRoles"),
        admin: t("users.filters.admins"),
        client: t("users.filters.clients"),
    };

    const statusLabels: Record<"all" | "active" | "inactive", string> = {
        all: t("users.filters.allStatuses"),
        active: t("users.filters.active"),
        inactive: t("users.filters.inactive"),
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="min-w-0 flex-1">
                    <label className="text-foreground mb-2 block text-sm font-medium">
                        {t("users.filters.search")}
                    </label>
                    <Input
                        placeholder={t("users.filters.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <div className="text-foreground flex items-center text-sm font-medium">
                    {t("users.filters.filtersLabel")}
                </div>

                {/* Role filter */}
                <div className="flex gap-2">
                    {(["all", "client", "admin"] as const).map((r) => (
                        <Badge
                            key={r}
                            variant={role === r ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1 text-xs font-medium"
                            onClick={() => handleRoleChange(r)}
                        >
                            {roleLabels[r]}
                        </Badge>
                    ))}
                </div>

                {/* Status filter */}
                <div className="ml-auto flex gap-2">
                    {(["all", "active", "inactive"] as const).map((s) => (
                        <Badge
                            key={s}
                            variant={status === s ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1 text-xs font-medium"
                            onClick={() => handleStatusChange(s)}
                        >
                            {statusLabels[s]}
                        </Badge>
                    ))}
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="ml-auto h-8 gap-2 px-2 text-xs"
                    >
                        <X className="h-3 w-3" />
                        {t("users.filters.clear")}
                    </Button>
                )}
            </div>
        </div>
    );
}
