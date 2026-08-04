import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/admin.users";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
}));

jest.mock("@/components/auth/ProtectedRoute", () => ({
    ProtectedRoute: ({
        children,
        requireAdmin,
    }: {
        children: React.ReactNode;
        requireAdmin?: boolean;
    }) => (
        <div data-testid="protected-route" data-require-admin={String(!!requireAdmin)}>
            {children}
        </div>
    ),
}));

jest.mock("@/components/layout/DashboardLayout", () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    ),
}));

jest.mock("@/pages/dashboard/AdminUsersPage", () => ({
    AdminUsersPage: () => <div data-testid="admin-users-page" />,
}));

describe("admin.users route", () => {
    it("renders AdminUsersPage inside admin-protected DashboardLayout", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByTestId("protected-route")).toHaveAttribute(
            "data-require-admin",
            "true",
        );
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("admin-users-page")).toBeInTheDocument();
    });
});
