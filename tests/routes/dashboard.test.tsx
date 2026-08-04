import { screen } from "@testing-library/react";
import { Route } from "@/routes/dashboard";
import { useAuthStore } from "@/stores/authStore";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/stores/authStore");

jest.mock("@/components/auth/ProtectedRoute", () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/layout/DashboardLayout", () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    ),
}));

jest.mock("@/pages/dashboard/ClientDashboardHome", () => ({
    ClientDashboardHome: () => <div>Client Dashboard Home</div>,
}));

jest.mock("@/pages/dashboard/AdminDashboardHome", () => ({
    AdminDashboardHome: () => <div>Admin Dashboard Home</div>,
}));

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
}));

const clientUser = {
    uid: "1",
    email: "client@test.com",
    displayName: "Alex",
    photoURL: null,
    role: "client" as const,
    isActive: true,
    tokenBalance: 100,
};

const adminUser = { ...clientUser, role: "admin" as const };

describe("dashboard route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders ClientDashboardHome for client role", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: clientUser,
        });
        renderRouteComponent(Route.options.component);
        expect(screen.getByText("Client Dashboard Home")).toBeInTheDocument();
        expect(screen.queryByText("Admin Dashboard Home")).not.toBeInTheDocument();
    });

    it("renders AdminDashboardHome for admin role", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: adminUser,
        });
        renderRouteComponent(Route.options.component);
        expect(screen.getByText("Admin Dashboard Home")).toBeInTheDocument();
        expect(screen.queryByText("Client Dashboard Home")).not.toBeInTheDocument();
    });

    it("renders ClientDashboardHome when user is null (default)", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        renderRouteComponent(Route.options.component);
        expect(screen.getByText("Client Dashboard Home")).toBeInTheDocument();
    });

    it("wraps content in DashboardLayout", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: clientUser,
        });
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    });
});
