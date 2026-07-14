import { Bot, Coins, FileText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { useAdminStats } from "@/hooks/useAdminStats";
import type { ServiceStatus } from "@/types/admin";

function statusVariant(status: ServiceStatus): "success" | "destructive" | "outline" {
    if (status === "Operational") return "success";
    if (status === "In Danger" || status === "Down") return "destructive";
    return "outline";
}

export function AdminDashboardHome() {
    const { data, isLoading } = useAdminStats();
    const stats = data?.data;

    return (
        <div className="space-y-8">
            {/* Heading */}
            <section>
                <h1 className="text-foreground text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    System Overview &amp; Health Monitoring
                </p>
            </section>

            {/* Stats grid */}
            <section
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                aria-label="System stats"
            >
                <StatsCard
                    icon={Users}
                    label="Total Users"
                    value={isLoading ? "—" : (stats?.totalUsers ?? 0)}
                    variant="accent"
                />
                <StatsCard
                    icon={FileText}
                    label="Total Notes"
                    value={isLoading ? "—" : (stats?.totalNotes ?? 0)}
                    variant="accent"
                />
                <StatsCard
                    icon={Coins}
                    label="Total Tokens"
                    value={isLoading ? "—" : (stats?.totalTokens ?? 0)}
                    variant="accent"
                />
                <StatsCard
                    icon={Bot}
                    label="Total AI Operations"
                    value={isLoading ? "—" : (stats?.totalAIOperations ?? 0)}
                    variant="accent"
                />
            </section>

            {/* Lower panels */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* System Health */}
                <section
                    className="bg-card border-border rounded-2xl border p-6"
                    aria-label="System health"
                >
                    <h2 className="text-foreground mb-4 text-lg font-bold">
                        System Health
                    </h2>
                    <ul className="space-y-3">
                        {(stats?.systemHealth ?? []).map(({ service, status }) => (
                            <li
                                key={service}
                                className="bg-secondary flex items-center justify-between rounded-xl px-4 py-3"
                            >
                                <span className="text-foreground text-sm font-medium">
                                    {service}
                                </span>
                                <Badge variant={statusVariant(status)}>{status}</Badge>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Recent Activity */}
                <section
                    className="bg-card border-border rounded-2xl border p-6"
                    aria-label="Recent activity"
                >
                    <h2 className="text-foreground mb-4 text-lg font-bold">
                        Recent Activity
                    </h2>
                    <ul className="flex flex-col space-y-4 overflow-x-auto pb-2">
                        {(stats?.recentActivity ?? []).map((item) => (
                            <div
                                key={item.id}
                                className="bg-secondary min-w-[250px] shrink-0 rounded-xl p-3"
                            >
                                <ActivityItem
                                    name={item.name}
                                    action={item.action}
                                    timeAgo={item.timeAgo}
                                />
                            </div>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
