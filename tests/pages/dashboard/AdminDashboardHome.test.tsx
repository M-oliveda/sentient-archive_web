import { render, screen } from "@testing-library/react";
import { AdminDashboardHome } from "@/pages/dashboard/AdminDashboardHome";
import { useAdminStats } from "@/hooks/useAdminStats";

jest.mock("@/hooks/useAdminStats");

const mockStats = {
    totalUsers: 1240,
    totalNotes: 123,
    totalTokens: 123000,
    totalAIOperations: 456,
    systemHealth: [
        { service: "Core API", status: "Operational" as const },
        { service: "Gemini Quota", status: "In Danger" as const },
        { service: "Firestore", status: "Operational" as const },
        { service: "Auth", status: "Down" as const },
    ],
    recentActivity: [
        {
            id: "1",
            name: "Sarah K.",
            action: "minted 500 tokens.",
            timeAgo: "2 mins ago",
        },
        {
            id: "2",
            name: "Mike R.",
            action: "generated a large summary.",
            timeAgo: "15 mins ago",
        },
    ],
};

/** Stats render in both the mobile carousel and the desktop grid. */
const STATS_LAYOUT_COUNT = 2;

describe("AdminDashboardHome", () => {
    it("renders Admin Dashboard heading", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("admin.title")).toBeInTheDocument();
    });

    it("renders System Overview subtitle", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("admin.subtitle")).toBeInTheDocument();
    });

    it("renders all four stat card labels", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getAllByText("admin.stats.totalUsers")).toHaveLength(
            STATS_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("admin.stats.totalNotes")).toHaveLength(
            STATS_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("admin.stats.totalTokens")).toHaveLength(
            STATS_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("admin.stats.totalAiOps")).toHaveLength(
            STATS_LAYOUT_COUNT,
        );
    });

    it("shows loading skeletons while data is loading", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        });
        render(<AdminDashboardHome />);
        expect(screen.queryByText("admin.stats.totalUsers")).not.toBeInTheDocument();
        // 4 carousel skeletons + 4 grid skeletons
        expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(8);
    });

    it("renders a mobile carousel with navigation controls", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: mockStats,
            isLoading: false,
        });
        render(<AdminDashboardHome />);

        expect(document.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
        expect(
            screen.getByRole("region", { name: "admin.stats.ariaLabel" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Previous slide")).toBeInTheDocument();
        expect(screen.getByText("Next slide")).toBeInTheDocument();
        expect(document.querySelectorAll('[data-slot="carousel-item"]').length).toBe(4);
    });

    it("renders stat values from API data", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: mockStats,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getAllByText("1,240")).toHaveLength(STATS_LAYOUT_COUNT);
        expect(screen.getAllByText("123")).toHaveLength(STATS_LAYOUT_COUNT);
        expect(screen.getAllByText("123,000")).toHaveLength(STATS_LAYOUT_COUNT);
        expect(screen.getAllByText("456")).toHaveLength(STATS_LAYOUT_COUNT);
    });

    it("renders zeros when loaded data has zero counts", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: {
                ...mockStats,
                totalUsers: 0,
                totalNotes: 0,
                totalTokens: 0,
                totalAIOperations: 0,
            },
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        const zeros = screen.getAllByText("0");
        expect(zeros).toHaveLength(4 * STATS_LAYOUT_COUNT);
    });

    it("renders System Health section with all statuses", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: mockStats,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("admin.health.title")).toBeInTheDocument();
        expect(screen.getByText("Core API")).toBeInTheDocument();
        expect(screen.getByText("Gemini Quota")).toBeInTheDocument();
        expect(screen.getByText("Firestore")).toBeInTheDocument();
        expect(screen.getByText("Auth")).toBeInTheDocument();
        // Status badges - multiple services can have the same status
        const operational = screen.getAllByText("admin.health.operational");
        expect(operational.length).toBeGreaterThan(0);
        expect(screen.getByText("admin.health.inDanger")).toBeInTheDocument();
        expect(screen.getByText("admin.health.down")).toBeInTheDocument();
    });

    it("renders Degraded health status with outline badge and raw status label", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: {
                ...mockStats,
                systemHealth: [{ service: "Storage", status: "Degraded" as const }],
            },
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("Storage")).toBeInTheDocument();
        expect(screen.getByText("Degraded")).toBeInTheDocument();
    });

    it("renders empty System Health list when no data", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("admin.health.title")).toBeInTheDocument();
        expect(screen.queryByText("Core API")).not.toBeInTheDocument();
    });

    it("renders Recent Activity section", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: mockStats,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("admin.activity.title")).toBeInTheDocument();
        expect(screen.getByText("Sarah K.")).toBeInTheDocument();
        expect(screen.getByText("Mike R.")).toBeInTheDocument();
    });

    it("renders empty Recent Activity list when no data", () => {
        (useAdminStats as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        render(<AdminDashboardHome />);
        expect(screen.getByText("admin.activity.title")).toBeInTheDocument();
        expect(screen.queryByText("Sarah K.")).not.toBeInTheDocument();
    });
});
