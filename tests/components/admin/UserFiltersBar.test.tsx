import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserFiltersBar } from "@/components/admin/UserFiltersBar";

describe("UserFiltersBar", () => {
    const handlers = {
        onSearchChange: jest.fn(),
        onRoleChange: jest.fn(),
        onStatusChange: jest.fn(),
        onReset: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers({ advanceTimers: true });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("renders search input and filter badges", () => {
        render(<UserFiltersBar {...handlers} />);

        expect(
            screen.getByPlaceholderText("Search by email or name..."),
        ).toBeInTheDocument();
        expect(screen.getByText("All Roles")).toBeInTheDocument();
        expect(screen.getByText("Clients")).toBeInTheDocument();
        expect(screen.getByText("Admins")).toBeInTheDocument();
        expect(screen.getByText("All Statuses")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
        expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("debounces search input changes", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        await user.type(
            screen.getByPlaceholderText("Search by email or name..."),
            "alice",
        );

        expect(handlers.onSearchChange).not.toHaveBeenCalledWith("alice");

        jest.advanceTimersByTime(300);

        await waitFor(() => {
            expect(handlers.onSearchChange).toHaveBeenCalledWith("alice");
        });
    });

    it("calls onRoleChange when a role filter is clicked", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        await user.click(screen.getByText("Admins"));
        expect(handlers.onRoleChange).toHaveBeenCalledWith("admin");

        await user.click(screen.getByText("Clients"));
        expect(handlers.onRoleChange).toHaveBeenCalledWith("client");

        await user.click(screen.getByText("All Roles"));
        expect(handlers.onRoleChange).toHaveBeenCalledWith("all");
    });

    it("calls onStatusChange for all, active, and inactive", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        await user.click(screen.getByText("Active"));
        expect(handlers.onStatusChange).toHaveBeenCalledWith(true);

        await user.click(screen.getByText("Inactive"));
        expect(handlers.onStatusChange).toHaveBeenCalledWith(false);

        await user.click(screen.getByText("All Statuses"));
        expect(handlers.onStatusChange).toHaveBeenCalledWith("all");
    });

    it("shows Clear button when filters are active and resets on click", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        expect(screen.queryByText("Clear")).not.toBeInTheDocument();

        await user.click(screen.getByText("Admins"));
        expect(screen.getByText("Clear")).toBeInTheDocument();

        await user.click(screen.getByText("Clear"));

        expect(handlers.onReset).toHaveBeenCalled();
        expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    });

    it("disables search input when loading", () => {
        render(<UserFiltersBar {...handlers} isLoading={true} />);

        expect(
            screen.getByPlaceholderText("Search by email or name..."),
        ).toBeDisabled();
    });
});
