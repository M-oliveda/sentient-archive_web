import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminAnalytics, type AnalyticsDateRange } from "@/hooks/useAdminAnalytics";
import {
    Bot,
    FileText,
    Users,
    Coins,
    BarChart3,
    TrendingUp,
    Activity,
} from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminAnalyticsPage() {
    const { t, i18n } = useTranslation("admin");
    const [dateRange, setDateRange] = useState<AnalyticsDateRange>("30d");
    const { data: analytics, isLoading, isError } = useAdminAnalytics(dateRange);

    const getDateRangeText = () => t(`analytics.lastDays.${dateRange}`);

    const formatShortDate = (date: string) =>
        new Date(date).toLocaleDateString(i18n.language, {
            month: "short",
            day: "numeric",
        });

    const formatFullDate = (date: string) =>
        new Date(date).toLocaleDateString(i18n.language);

    if (isLoading) {
        return (
            <div className="space-y-8" data-testid="admin-analytics-loading">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-96 max-w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-destructive">{t("analytics.loadError")}</div>
            </div>
        );
    }

    return (
        <section className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-foreground text-4xl font-bold">
                    {t("analytics.title")}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("analytics.subtitle")}
                </p>
            </div>

            {/* Date range selector */}
            <div className="flex flex-wrap gap-2">
                <span className="text-foreground flex items-center text-sm font-medium">
                    {t("analytics.period")}
                </span>
                {(["7d", "30d", "90d"] as const).map((range) => (
                    <Badge
                        key={range}
                        variant={dateRange === range ? "default" : "outline"}
                        className="cursor-pointer px-3 py-2 text-sm font-medium"
                        onClick={() => setDateRange(range)}
                    >
                        {t(`analytics.ranges.${range}`)}
                    </Badge>
                ))}
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Users className="text-muted-foreground h-4 w-4" />
                            {t("analytics.cards.totalUsers")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.users?.total || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {t("analytics.cards.activeCount", {
                                count: analytics?.users?.active || 0,
                            })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            {t("analytics.cards.totalNotes")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.notes?.total || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {t("analytics.cards.notesCreated")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Coins className="text-muted-foreground h-4 w-4" />
                            {t("analytics.cards.tokensSpent")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.tokens?.totalSpent || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {t("analytics.cards.netBalance", {
                                count: analytics?.tokens?.netBalance || 0,
                            })}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Bot className="text-muted-foreground h-4 w-4" />
                            {t("analytics.cards.aiOperations")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.aiOperations?.total || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {getDateRangeText()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Operations Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {t("analytics.aiBreakdown.title")}
                    </CardTitle>
                    <CardDescription>
                        {t("analytics.aiBreakdown.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={[
                                {
                                    name: t("analytics.aiBreakdown.summarization"),
                                    count:
                                        analytics?.aiOperations?.byType?.summarize || 0,
                                },
                                {
                                    name: t("analytics.aiBreakdown.autoTagging"),
                                    count:
                                        analytics?.aiOperations?.byType?.autoTag || 0,
                                },
                                {
                                    name: t("analytics.aiBreakdown.flashcards"),
                                    count:
                                        analytics?.aiOperations?.byType?.flashcards ||
                                        0,
                                },
                                {
                                    name: t("analytics.aiBreakdown.qa"),
                                    count:
                                        analytics?.aiOperations?.byType?.ragQuery || 0,
                                },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="name"
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis className="text-muted-foreground text-xs" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="hsl(var(--primary))"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* AI Operations Trend */}
            {analytics?.trends?.aiOperationsOverTime && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            {t("analytics.aiTrend.title")}
                        </CardTitle>
                        <CardDescription>
                            {t("analytics.aiTrend.description", {
                                range: getDateRangeText(),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={analytics.trends.aiOperationsOverTime}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="date"
                                    className="text-muted-foreground text-xs"
                                    tickFormatter={formatShortDate}
                                />
                                <YAxis className="text-muted-foreground text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                    }}
                                    labelFormatter={formatFullDate}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: "hsl(var(--primary))" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Token Usage Trend */}
            {analytics?.trends?.tokenUsageOverTime && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            {t("analytics.tokenTrend.title")}
                        </CardTitle>
                        <CardDescription>
                            {t("analytics.tokenTrend.description", {
                                range: getDateRangeText(),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={analytics.trends.tokenUsageOverTime}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="date"
                                    className="text-muted-foreground text-xs"
                                    tickFormatter={formatShortDate}
                                />
                                <YAxis className="text-muted-foreground text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                    }}
                                    labelFormatter={formatFullDate}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="granted"
                                    stroke="hsl(var(--success))"
                                    strokeWidth={2}
                                    name={t("analytics.tokenTrend.granted")}
                                    dot={{ fill: "hsl(var(--success))" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="spent"
                                    stroke="hsl(var(--error))"
                                    strokeWidth={2}
                                    name={t("analytics.tokenTrend.spent")}
                                    dot={{ fill: "hsl(var(--error))" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* User Growth Trend */}
            {analytics?.trends?.userGrowthOverTime && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            {t("analytics.userGrowth.title")}
                        </CardTitle>
                        <CardDescription>
                            {t("analytics.userGrowth.description", {
                                range: getDateRangeText(),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={analytics.trends.userGrowthOverTime}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorTotal"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="date"
                                    className="text-muted-foreground text-xs"
                                    tickFormatter={formatShortDate}
                                />
                                <YAxis className="text-muted-foreground text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                    }}
                                    labelFormatter={formatFullDate}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="totalUsers"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    name={t("analytics.userGrowth.totalUsers")}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* User Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("analytics.distribution.title")}</CardTitle>
                    <CardDescription>
                        {t("analytics.distribution.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.clients || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                {t("analytics.distribution.clients")}
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.admins || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                {t("analytics.distribution.admins")}
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.active || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                {t("analytics.distribution.active")}
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.inactive || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                {t("analytics.distribution.inactive")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
