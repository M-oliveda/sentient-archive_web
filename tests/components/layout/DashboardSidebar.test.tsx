import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/auth-service";

jest.mock("@/stores/authStore");
jest.mock("@/lib/auth-service", () => ({
    authService: { signOut: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("@/components/layout/LanguageSwitcher", () => ({
    LanguageSwitcher: () => <div data-testid="language-switcher">Language</div>,
}));

const mockUseRouterState = jest.fn();
jest.mock("@tanstack/react-router", () => ({
    Link: ({
        to,
        children,
        className,
        "aria-current": ariaCurrent,
    }: {
        to: string;
        children: React.ReactNode;
        className?: string;
        "aria-current"?: React.AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
    }) => (
        <a href={to} className={className} aria-current={ariaCurrent}>
            {children}
        </a>
    ),
    useRouterState: () => mockUseRouterState(),
}));

const mockNavItems = [
    {
        label: "Dashboard",
        icon: () => <svg />,
        to: "/dashboard",
    },
    {
        label: "Settings",
        icon: () => <svg />,
        to: "/settings",
    },
];

describe("DashboardSidebar", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouterState.mockReturnValue({
            location: { pathname: "/dashboard" },
        });
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { tokenBalance: 2500, displayName: "Alex" },
        });
    });

    it("renders all nav items", () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={false} />);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("marks the active nav item with aria-current", () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={false} />);
        const activeLink = screen.getByRole("link", { name: /Dashboard/ });
        expect(activeLink).toHaveAttribute("aria-current", "page");
    });

    it("does not mark inactive items with aria-current", () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={false} />);
        const inactiveLink = screen.getByRole("link", { name: /Settings/ });
        expect(inactiveLink).not.toHaveAttribute("aria-current", "page");
    });

    it("shows TokenWidget when showTokenWidget is true and user exists", () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={true} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("defaults TokenWidget balance to 0 when tokenBalance is undefined", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { displayName: "Alex", tokenBalance: undefined },
        });
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={true} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("hides TokenWidget when user is null even if showTokenWidget is true", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
        });
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={true} />);
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("hides TokenWidget when showTokenWidget is false", () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={false} />);
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("calls authService.signOut when Log Out is clicked", async () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={false} />);
        fireEvent.click(screen.getByText("Log Out"));
        expect(authService.signOut).toHaveBeenCalledTimes(1);
    });

    it("renders Log Out button", () => {
        render(<DashboardSidebar navItems={mockNavItems} showTokenWidget={false} />);
        expect(screen.getByRole("button", { name: /Log Out/ })).toBeInTheDocument();
    });

    it("defaults to hiding TokenWidget when showTokenWidget prop is omitted", () => {
        render(<DashboardSidebar navItems={mockNavItems} />);
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
});
