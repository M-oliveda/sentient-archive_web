import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityFilterBar } from "@/components/activity/ActivityFilterBar";

describe("ActivityFilterBar", () => {
    const onCategoryChange = jest.fn();
    const onSearchChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders filter chips and search input", () => {
        render(
            <ActivityFilterBar
                category="all"
                search=""
                onCategoryChange={onCategoryChange}
                onSearchChange={onSearchChange}
            />,
        );

        expect(screen.getByTestId("activity-filter-bar")).toBeInTheDocument();
        expect(screen.getByTestId("activity-filter-ai")).toBeInTheDocument();
        expect(screen.getByTestId("activity-filter-tokens")).toBeInTheDocument();
        expect(screen.getByTestId("activity-filter-notes")).toBeInTheDocument();
        expect(screen.getByTestId("activity-filter-all")).toBeInTheDocument();
        expect(screen.getByTestId("activity-filter-folders")).toBeInTheDocument();
        expect(screen.getByTestId("activity-search-input")).toBeInTheDocument();
    });

    it("marks the active category as pressed", () => {
        render(
            <ActivityFilterBar
                category="ai"
                search=""
                onCategoryChange={onCategoryChange}
                onSearchChange={onSearchChange}
            />,
        );

        expect(screen.getByTestId("activity-filter-ai")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByTestId("activity-filter-all")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("calls onCategoryChange when a chip is clicked", () => {
        render(
            <ActivityFilterBar
                category="all"
                search=""
                onCategoryChange={onCategoryChange}
                onSearchChange={onSearchChange}
            />,
        );

        fireEvent.click(screen.getByTestId("activity-filter-notes"));
        expect(onCategoryChange).toHaveBeenCalledWith("notes");
    });

    it("calls onSearchChange when typing in search", () => {
        render(
            <ActivityFilterBar
                category="all"
                search=""
                onCategoryChange={onCategoryChange}
                onSearchChange={onSearchChange}
            />,
        );

        fireEvent.change(screen.getByTestId("activity-search-input"), {
            target: { value: "summary" },
        });
        expect(onSearchChange).toHaveBeenCalledWith("summary");
    });
});
