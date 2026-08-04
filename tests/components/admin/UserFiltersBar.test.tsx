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
            screen.getByPlaceholderText("users.filters.searchPlaceholder"),
        ).toBeInTheDocument();
        expect(screen.getByText("users.filters.allRoles")).toBeInTheDocument();
        expect(screen.getByText("users.filters.clients")).toBeInTheDocument();
        expect(screen.getByText("users.filters.admins")).toBeInTheDocument();
        expect(screen.getByText("users.filters.allStatuses")).toBeInTheDocument();
        expect(screen.getByText("users.filters.active")).toBeInTheDocument();
        expect(screen.getByText("users.filters.inactive")).toBeInTheDocument();
    });

    it("debounces search input changes", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        await user.type(
            screen.getByPlaceholderText("users.filters.searchPlaceholder"),
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

        await user.click(screen.getByText("users.filters.admins"));
        expect(handlers.onRoleChange).toHaveBeenCalledWith("admin");

        await user.click(screen.getByText("users.filters.clients"));
        expect(handlers.onRoleChange).toHaveBeenCalledWith("client");

        await user.click(screen.getByText("users.filters.allRoles"));
        expect(handlers.onRoleChange).toHaveBeenCalledWith("all");
    });

    it("calls onStatusChange for all, active, and inactive", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        await user.click(screen.getByText("users.filters.active"));
        expect(handlers.onStatusChange).toHaveBeenCalledWith(true);

        await user.click(screen.getByText("users.filters.inactive"));
        expect(handlers.onStatusChange).toHaveBeenCalledWith(false);

        await user.click(screen.getByText("users.filters.allStatuses"));
        expect(handlers.onStatusChange).toHaveBeenCalledWith("all");
    });

    it("shows Clear button when filters are active and resets on click", async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<UserFiltersBar {...handlers} />);

        expect(screen.queryByText("users.filters.clear")).not.toBeInTheDocument();

        await user.click(screen.getByText("users.filters.admins"));
        expect(screen.getByText("users.filters.clear")).toBeInTheDocument();

        await user.click(screen.getByText("users.filters.clear"));

        expect(handlers.onReset).toHaveBeenCalled();
        expect(screen.queryByText("users.filters.clear")).not.toBeInTheDocument();
    });

    it("disables search input when loading", () => {
        render(<UserFiltersBar {...handlers} isLoading={true} />);

        expect(
            screen.getByPlaceholderText("users.filters.searchPlaceholder"),
        ).toBeDisabled();
    });
});
