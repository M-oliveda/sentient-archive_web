import { Bot, Coins, FileText, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { useAdminStats } from "@/hooks/useAdminStats";
import type { IAdminStatsResponse, ServiceStatus } from "@/types/admin";

function statusVariant(status: ServiceStatus): "success" | "destructive" | "outline" {
    if (status === "Operational") return "success";
    if (status === "In Danger" || status === "Down") return "destructive";
    return "outline";
}

export function AdminDashboardHome() {
    const { t } = useTranslation("dashboard");
    const { data, isLoading } = useAdminStats();
    const stats = data;

    const translateStatus = (status: ServiceStatus): string => {
        if (status === "Operational") return t("admin.health.operational");
        if (status === "In Danger") return t("admin.health.inDanger");
        if (status === "Down") return t("admin.health.down");
        return status;
    };

    return (
        <div className="space-y-8">
            {/* Heading */}
            <section>
                <h1 className="text-foreground text-4xl font-bold">
                    {t("admin.title")}
                </h1>
                <p className="text-muted-foreground mt-2">{t("admin.subtitle")}</p>
            </section>

            {/* Stats grid */}
            <section
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                aria-label={t("admin.stats.ariaLabel")}
            >
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))
                ) : (
                    <>
                        <StatsCard
                            icon={Users}
                            label={t("admin.stats.totalUsers")}
                            value={stats?.totalUsers ?? 0}
                            variant="accent"
                        />
                        <StatsCard
                            icon={FileText}
                            label={t("admin.stats.totalNotes")}
                            value={stats?.totalNotes ?? 0}
                            variant="accent"
                        />
                        <StatsCard
                            icon={Coins}
                            label={t("admin.stats.totalTokens")}
                            value={stats?.totalTokens ?? 0}
                            variant="accent"
                        />
                        <StatsCard
                            icon={Bot}
                            label={t("admin.stats.totalAiOps")}
                            value={stats?.totalAIOperations ?? 0}
                            variant="accent"
                        />
                    </>
                )}
            </section>

            {/* Lower panels */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* System Health */}
                <section
                    className="bg-card border-border rounded-2xl border p-6"
                    aria-label={t("admin.health.ariaLabel")}
                >
                    <h2 className="text-foreground mb-4 text-lg font-bold">
                        {t("admin.health.title")}
                    </h2>
                    <ul className="space-y-3">
                        {(stats?.systemHealth ?? []).map(
                            ({
                                service,
                                status,
                            }: {
                                service: string;
                                status: ServiceStatus;
                            }) => (
                                <li
                                    key={service}
                                    className="bg-secondary flex items-center justify-between rounded-xl px-4 py-3"
                                >
                                    <span className="text-foreground text-sm font-medium">
                                        {service}
                                    </span>
                                    <Badge variant={statusVariant(status)}>
                                        {translateStatus(status)}
                                    </Badge>
                                </li>
                            ),
                        )}
                    </ul>
                </section>

                {/* Recent Activity */}
                <section
                    className="bg-card border-border rounded-2xl border p-6"
                    aria-label={t("admin.activity.ariaLabel")}
                >
                    <h2 className="text-foreground mb-4 text-lg font-bold">
                        {t("admin.activity.title")}
                    </h2>
                    <ul className="flex flex-col space-y-4 overflow-x-auto pb-2">
                        {(stats?.recentActivity ?? []).map(
                            (item: IAdminStatsResponse["recentActivity"][number]) => (
                                <div
                                    key={item.id}
                                    className="bg-secondary min-w-62.5 shrink-0 rounded-xl p-3"
                                >
                                    <ActivityItem
                                        name={item.name}
                                        action={item.action}
                                        timeAgo={item.timeAgo}
                                    />
                                </div>
                            ),
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
}
