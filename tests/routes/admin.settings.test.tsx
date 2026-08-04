import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/admin.settings";
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

jest.mock("@/pages/dashboard/AdminSystemConfigPage", () => ({
    AdminSystemConfigPage: () => <div data-testid="admin-system-config-page" />,
}));

describe("admin.settings route", () => {
    it("renders AdminSystemConfigPage inside admin-protected DashboardLayout", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByTestId("protected-route")).toHaveAttribute(
            "data-require-admin",
            "true",
        );
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("admin-system-config-page")).toBeInTheDocument();
    });
});
