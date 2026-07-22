import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityPage } from "@/pages/dashboard/ActivityPage";
import type { IActivityEntry, IActivityStats } from "@/types/activity";

const mockSetCategory = jest.fn();
const mockSetSearch = jest.fn();
let capturedCategoryParse: ((v: string) => string) | undefined;

jest.mock("nuqs", () => ({
    useQueryState: jest.fn(
        (key: string, options?: { parse?: (v: string) => string }) => {
            if (key === "category") {
                if (options?.parse) {
                    capturedCategoryParse = options.parse;
                }
                return ["all", mockSetCategory];
            }
            return ["", mockSetSearch];
        },
    ),
}));

jest.mock("@/hooks/useActivity", () => ({
    useActivityStats: jest.fn(),
    useActivityFeed: jest.fn(),
}));

import { useActivityFeed, useActivityStats } from "@/hooks/useActivity";

const stats: IActivityStats = {
    actionsToday: 2,
    actionsTodayDeltaPct: 0,
    aiOpsThisWeek: 1,
    aiOpsThisWeekDeltaPct: 0,
    totalActions: 5,
};

const entries: IActivityEntry[] = [
    {
        id: "1",
        category: "ai",
        title: "AI Summary",
        description: "Done",
        createdAt: new Date().toISOString(),
        iconHint: "bot",
    },
];

describe("ActivityPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedCategoryParse = undefined;
        (useActivityStats as jest.Mock).mockReturnValue({
            data: stats,
            isLoading: false,
        });
        (useActivityFeed as jest.Mock).mockReturnValue({
            data: entries,
            isLoading: false,
            isError: false,
        });
    });

    it("renders page header and sections", () => {
        render(<ActivityPage />);
        expect(screen.getByText("Activity Log")).toBeInTheDocument();
        expect(screen.getByTestId("activity-stats-cards")).toBeInTheDocument();
        expect(screen.getByTestId("activity-filter-bar")).toBeInTheDocument();
        expect(screen.getByTestId("activity-timeline")).toBeInTheDocument();
    });

    it("updates category filter via query state", () => {
        render(<ActivityPage />);
        fireEvent.click(screen.getByTestId("activity-filter-ai"));
        expect(mockSetCategory).toHaveBeenCalledWith("ai");
    });

    it("updates search via query state", () => {
        render(<ActivityPage />);
        fireEvent.change(screen.getByTestId("activity-search-input"), {
            target: { value: "token" },
        });
        expect(mockSetSearch).toHaveBeenCalledWith("token");
    });

    it("parses valid and invalid category query values", () => {
        render(<ActivityPage />);
        expect(capturedCategoryParse).toBeDefined();
        expect(capturedCategoryParse!("notes")).toBe("notes");
        expect(capturedCategoryParse!("nope")).toBe("all");
    });

    it("defaults null category and search query state", () => {
        const { useQueryState } = jest.requireMock("nuqs") as {
            useQueryState: jest.Mock;
        };
        useQueryState.mockImplementation((key: string) => {
            if (key === "category") {
                return [null, mockSetCategory];
            }
            return [null, mockSetSearch];
        });

        render(<ActivityPage />);
        expect(useActivityFeed).toHaveBeenCalledWith({
            category: "all",
            q: "",
        });
        expect(screen.getByTestId("activity-filter-all")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("defaults feed entries to empty array when data is undefined", () => {
        (useActivityFeed as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });

        render(<ActivityPage />);
        expect(screen.getByTestId("activity-timeline-empty")).toBeInTheDocument();
    });
});
