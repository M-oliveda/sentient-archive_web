import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/admin.token-economy";
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

jest.mock("@/pages/dashboard/AdminTokenRequestsPage", () => ({
    AdminTokenRequestsPage: () => <div data-testid="admin-token-requests-page" />,
}));

describe("admin.token-economy route", () => {
    it("renders AdminTokenRequestsPage inside admin-protected DashboardLayout", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByTestId("protected-route")).toHaveAttribute(
            "data-require-admin",
            "true",
        );
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("admin-token-requests-page")).toBeInTheDocument();
    });
});
