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
        expect(screen.getByTestId("activity-filter-ai")).toHaveTextContent(
            "filters.ai",
        );
        expect(screen.getByTestId("activity-filter-tokens")).toHaveTextContent(
            "filters.tokens",
        );
        expect(screen.getByTestId("activity-filter-notes")).toHaveTextContent(
            "filters.notes",
        );
        expect(screen.getByTestId("activity-filter-all")).toHaveTextContent(
            "filters.all",
        );
        expect(screen.getByTestId("activity-filter-folders")).toHaveTextContent(
            "filters.folders",
        );
        expect(screen.getByTestId("activity-search-input")).toHaveAttribute(
            "placeholder",
            "filters.searchPlaceholder",
        );
        expect(screen.getByLabelText("filters.searchAriaLabel")).toBeInTheDocument();
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
