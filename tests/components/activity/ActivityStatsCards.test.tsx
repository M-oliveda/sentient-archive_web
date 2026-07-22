import { render, screen } from "@testing-library/react";
import { ActivityStatsCards } from "@/components/activity/ActivityStatsCards";
import type { IActivityStats } from "@/types/activity";

const stats: IActivityStats = {
    actionsToday: 24,
    actionsTodayDeltaPct: 12,
    aiOpsThisWeek: 10,
    aiOpsThisWeekDeltaPct: 12,
    totalActions: 11240,
};

describe("ActivityStatsCards", () => {
    it("shows loading skeleton when loading", () => {
        render(<ActivityStatsCards isLoading />);
        expect(screen.getByTestId("activity-stats-loading")).toBeInTheDocument();
    });

    it("shows loading skeleton when stats are missing", () => {
        render(<ActivityStatsCards />);
        expect(screen.getByTestId("activity-stats-loading")).toBeInTheDocument();
    });

    it("renders all three stat cards", () => {
        render(<ActivityStatsCards stats={stats} />);
        expect(screen.getByTestId("activity-stats-cards")).toBeInTheDocument();
        expect(screen.getByText("Actions today")).toBeInTheDocument();
        expect(screen.getByText("AI Ops This Week")).toBeInTheDocument();
        expect(screen.getByText("Total Actions")).toBeInTheDocument();
        expect(screen.getByText("24")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("11,240")).toBeInTheDocument();
        expect(screen.getAllByText("12%")).toHaveLength(2);
    });
});
