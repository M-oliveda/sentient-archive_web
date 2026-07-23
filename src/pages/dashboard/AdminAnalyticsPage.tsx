import { useState } from "react";
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

export function AdminAnalyticsPage() {
    const [dateRange, setDateRange] = useState<AnalyticsDateRange>("30d");
    const { data: analytics, isLoading, isError } = useAdminAnalytics(dateRange);

    const getDateRangeText = () => {
        switch (dateRange) {
            case "7d":
                return "Last 7 days";
            case "30d":
                return "Last 30 days";
            case "90d":
                return "Last 90 days";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading analytics...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-destructive">
                    Failed to load analytics. Please try again.
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-foreground text-4xl font-bold">Analytics</h1>
                <p className="text-muted-foreground text-lg">
                    System-wide usage statistics and insights
                </p>
            </div>

            {/* Date range selector */}
            <div className="flex flex-wrap gap-2">
                <span className="text-foreground flex items-center text-sm font-medium">
                    Period:
                </span>
                {(["7d", "30d", "90d"] as const).map((range) => (
                    <Badge
                        key={range}
                        variant={dateRange === range ? "default" : "outline"}
                        className="cursor-pointer px-3 py-2 text-sm font-medium"
                        onClick={() => setDateRange(range)}
                    >
                        {range === "7d"
                            ? "7 days"
                            : range === "30d"
                              ? "30 days"
                              : "90 days"}
                    </Badge>
                ))}
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Users className="text-muted-foreground h-4 w-4" />
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.users?.total || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {analytics?.users?.active || 0} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            Total Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.notes?.total || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Created by users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Coins className="text-muted-foreground h-4 w-4" />
                            Tokens Spent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.tokens?.totalSpent || 0}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {analytics?.tokens?.netBalance || 0} net balance
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <Bot className="text-muted-foreground h-4 w-4" />
                            AI Operations
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
                        AI Operations Breakdown
                    </CardTitle>
                    <CardDescription>Usage by operation type</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={[
                                {
                                    name: "Summarization",
                                    count:
                                        analytics?.aiOperations?.byType?.summarize || 0,
                                },
                                {
                                    name: "Auto-Tagging",
                                    count:
                                        analytics?.aiOperations?.byType?.autoTag || 0,
                                },
                                {
                                    name: "Flashcards",
                                    count:
                                        analytics?.aiOperations?.byType?.flashcards ||
                                        0,
                                },
                                {
                                    name: "Q&A",
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
                            AI Operations Trend
                        </CardTitle>
                        <CardDescription>
                            Operations over time ({getDateRangeText()})
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
                                    tickFormatter={(date) =>
                                        new Date(date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                />
                                <YAxis className="text-muted-foreground text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                    }}
                                    labelFormatter={(date) =>
                                        new Date(date).toLocaleDateString()
                                    }
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
                            Token Usage Trend
                        </CardTitle>
                        <CardDescription>
                            Granted vs spent ({getDateRangeText()})
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
                                    tickFormatter={(date) =>
                                        new Date(date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                />
                                <YAxis className="text-muted-foreground text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                    }}
                                    labelFormatter={(date) =>
                                        new Date(date).toLocaleDateString()
                                    }
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="granted"
                                    stroke="hsl(var(--success))"
                                    strokeWidth={2}
                                    name="Granted"
                                    dot={{ fill: "hsl(var(--success))" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="spent"
                                    stroke="hsl(var(--error))"
                                    strokeWidth={2}
                                    name="Spent"
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
                            User Growth
                        </CardTitle>
                        <CardDescription>
                            Total and new users ({getDateRangeText()})
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
                                    tickFormatter={(date) =>
                                        new Date(date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                />
                                <YAxis className="text-muted-foreground text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                    }}
                                    labelFormatter={(date) =>
                                        new Date(date).toLocaleDateString()
                                    }
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="totalUsers"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    name="Total Users"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* User Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>User count by role and status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.clients || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                Clients
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.admins || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                Admins
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.active || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                Active
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {analytics?.users?.inactive || 0}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                Inactive
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
