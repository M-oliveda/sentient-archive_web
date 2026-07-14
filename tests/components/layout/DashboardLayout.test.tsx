import { render, screen } from "@testing-library/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");
jest.mock("@/lib/auth-service", () => ({
    authService: { signOut: jest.fn() },
}));

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useRouterState: () => ({ location: { pathname: "/dashboard" } }),
}));

const clientUser = {
    uid: "1",
    email: "client@test.com",
    displayName: "Alex",
    photoURL: null,
    role: "client" as const,
    isActive: true,
    tokenBalance: 2500,
};

const adminUser = { ...clientUser, role: "admin" as const };

describe("DashboardLayout", () => {
    it("renders children", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: clientUser,
        });
        render(
            <DashboardLayout>
                <div>Page Content</div>
            </DashboardLayout>,
        );
        expect(screen.getByText("Page Content")).toBeInTheDocument();
    });

    it("renders client nav items for client role", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: clientUser,
        });
        render(
            <DashboardLayout>
                <div />
            </DashboardLayout>,
        );
        expect(screen.getByText("My Notes")).toBeInTheDocument();
        expect(screen.getByText("AI Features")).toBeInTheDocument();
        expect(screen.getByText("Activity")).toBeInTheDocument();
        expect(screen.queryByText("Users")).not.toBeInTheDocument();
    });

    it("renders admin nav items for admin role", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: adminUser,
        });
        render(
            <DashboardLayout>
                <div />
            </DashboardLayout>,
        );
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText("Token Economy")).toBeInTheDocument();
        expect(screen.queryByText("My Notes")).not.toBeInTheDocument();
    });

    it("shows token widget for client role", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: clientUser,
        });
        render(
            <DashboardLayout>
                <div />
            </DashboardLayout>,
        );
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("hides token widget for admin role", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: adminUser,
        });
        render(
            <DashboardLayout>
                <div />
            </DashboardLayout>,
        );
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("renders SentientArchive brand in navbar", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: clientUser,
        });
        render(
            <DashboardLayout>
                <div />
            </DashboardLayout>,
        );
        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
    });
});
