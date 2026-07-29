import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AdminAnalyticsPage } from "@/pages/dashboard/AdminAnalyticsPage";
import type { IAdminAnalytics } from "@/types/admin";
import * as useAdminAnalyticsModule from "@/hooks/useAdminAnalytics";

jest.mock("@/hooks/useAdminAnalytics", () => ({
    ...jest.requireActual("@/hooks/useAdminAnalytics"),
    useAdminAnalytics: jest.fn(),
}));

jest.mock("recharts", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");

    return {
        ResponsiveContainer: function ResponsiveContainer({
            children,
        }: {
            children?: ReactNode;
        }) {
            return React.createElement(
                "div",
                { "data-testid": "responsive-container" },
                children,
            );
        },
        BarChart: function BarChart({ children }: { children?: ReactNode }) {
            return React.createElement("div", { "data-testid": "bar-chart" }, children);
        },
        LineChart: function LineChart({ children }: { children?: ReactNode }) {
            return React.createElement(
                "div",
                { "data-testid": "line-chart" },
                children,
            );
        },
        AreaChart: function AreaChart({ children }: { children?: ReactNode }) {
            return React.createElement(
                "svg",
                { "data-testid": "area-chart" },
                children,
            );
        },
        CartesianGrid: function CartesianGrid() {
            return null;
        },
        XAxis: function XAxis(props: { tickFormatter?: (value: string) => string }) {
            if (typeof props.tickFormatter === "function") {
                props.tickFormatter("2026-01-15");
            }
            return null;
        },
        YAxis: function YAxis() {
            return null;
        },
        Tooltip: function Tooltip(props: {
            labelFormatter?: (value: string) => string;
        }) {
            if (typeof props.labelFormatter === "function") {
                props.labelFormatter("2026-01-15");
            }
            return null;
        },
        Legend: function Legend() {
            return null;
        },
        Bar: function Bar() {
            return null;
        },
        Line: function Line() {
            return null;
        },
        Area: function Area() {
            return null;
        },
    };
});

const mockAnalytics: IAdminAnalytics = {
    users: {
        total: 100,
        active: 80,
        inactive: 20,
        admins: 5,
        clients: 95,
    },
    notes: { total: 500 },
    tokens: { totalGranted: 3500, totalSpent: 1000, netBalance: 2500 },
    aiOperations: {
        total: 200,
        byType: {
            summarize: 50,
            autoTag: 40,
            flashcards: 60,
            ragQuery: 50,
        },
    },
    trends: {
        aiOperationsOverTime: [
            { date: "2026-01-15", count: 10 },
            { date: "2026-01-16", count: 14 },
        ],
        tokenUsageOverTime: [
            { date: "2026-01-15", granted: 100, spent: 40 },
            { date: "2026-01-16", granted: 80, spent: 50 },
        ],
        userGrowthOverTime: [
            { date: "2026-01-15", totalUsers: 90, newUsers: 5 },
            { date: "2026-01-16", totalUsers: 100, newUsers: 10 },
        ],
    },
};

const createWrapper = () => {
    const queryClient = new QueryClient();

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    }

    return Wrapper;
};

describe("AdminAnalyticsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;
        mockUseAdminAnalytics.mockReturnValue({
            data: mockAnalytics,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<IAdminAnalytics>);
    });

    it("renders page title", () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.title")).toBeInTheDocument();
    });

    it("displays period selector", () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.period")).toBeInTheDocument();
        expect(screen.getByText("analytics.ranges.7d")).toBeInTheDocument();
        expect(screen.getByText("analytics.ranges.30d")).toBeInTheDocument();
        expect(screen.getByText("analytics.ranges.90d")).toBeInTheDocument();
    });

    it("displays AI Operations Breakdown section", () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.aiBreakdown.title")).toBeInTheDocument();
    });

    it("displays User Distribution section", () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.distribution.title")).toBeInTheDocument();
        expect(screen.getByText("analytics.distribution.clients")).toBeInTheDocument();
        expect(screen.getByText("analytics.distribution.admins")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;
        mockUseAdminAnalytics.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<IAdminAnalytics>);

        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByTestId("admin-analytics-loading")).toBeInTheDocument();
    });

    it("shows error state when analytics fail to load", () => {
        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;
        mockUseAdminAnalytics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error("Failed"),
        } as unknown as UseQueryResult<IAdminAnalytics>);

        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.loadError")).toBeInTheDocument();
    });

    it("updates date range text when period badges are clicked", async () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.lastDays.30d")).toBeInTheDocument();

        await userEvent.click(screen.getByText("analytics.ranges.7d"));
        await waitFor(() => {
            expect(screen.getByText("analytics.lastDays.7d")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText("analytics.ranges.90d"));
        await waitFor(() => {
            expect(screen.getByText("analytics.lastDays.90d")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText("analytics.ranges.30d"));
        await waitFor(() => {
            expect(screen.getByText("analytics.lastDays.30d")).toBeInTheDocument();
        });
    });

    it("passes the selected date range to useAdminAnalytics", async () => {
        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;

        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(mockUseAdminAnalytics).toHaveBeenCalledWith("30d");

        await userEvent.click(screen.getByText("analytics.ranges.7d"));
        await waitFor(() => {
            expect(mockUseAdminAnalytics).toHaveBeenCalledWith("7d");
        });
    });

    it("renders analytics metrics from unwrapped data", () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("analytics.cards.activeCount")).toBeInTheDocument();
        expect(screen.getByText("500")).toBeInTheDocument();
        expect(screen.getByText("1000")).toBeInTheDocument();
        expect(screen.getByText("analytics.cards.netBalance")).toBeInTheDocument();
        expect(screen.getByText("200")).toBeInTheDocument();
        expect(screen.getByText("95")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders zeroed metrics when analytics data is absent", () => {
        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;
        mockUseAdminAnalytics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<IAdminAnalytics>);

        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getAllByText("0").length).toBeGreaterThan(0);
        expect(screen.getByText("analytics.lastDays.30d")).toBeInTheDocument();
    });

    it("renders chart with zero AI operations without errors", () => {
        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;
        mockUseAdminAnalytics.mockReturnValue({
            data: {
                ...mockAnalytics,
                aiOperations: {
                    total: 0,
                    byType: {
                        summarize: 0,
                        autoTag: 0,
                        flashcards: 0,
                        ragQuery: 0,
                    },
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<IAdminAnalytics>);

        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        // With Recharts BarChart, the section still renders
        expect(screen.getByText("analytics.aiBreakdown.title")).toBeInTheDocument();
    });

    it("renders trend charts and invokes axis/tooltip formatters", () => {
        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("analytics.aiTrend.title")).toBeInTheDocument();
        expect(screen.getByText("analytics.tokenTrend.title")).toBeInTheDocument();
        expect(screen.getByText("analytics.userGrowth.title")).toBeInTheDocument();
        expect(screen.getAllByTestId("line-chart").length).toBeGreaterThan(0);
        expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });

    it("hides trend charts when trends data is absent", () => {
        const mockUseAdminAnalytics =
            useAdminAnalyticsModule.useAdminAnalytics as jest.MockedFunction<
                typeof useAdminAnalyticsModule.useAdminAnalytics
            >;
        const { trends: _trends, ...withoutTrends } = mockAnalytics;
        mockUseAdminAnalytics.mockReturnValue({
            data: withoutTrends,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<IAdminAnalytics>);

        render(<AdminAnalyticsPage />, { wrapper: createWrapper() });

        expect(screen.queryByText("analytics.aiTrend.title")).not.toBeInTheDocument();
        expect(
            screen.queryByText("analytics.tokenTrend.title"),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("analytics.userGrowth.title"),
        ).not.toBeInTheDocument();
    });
});
