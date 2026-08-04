import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/notes";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
    Outlet: () => <div data-testid="outlet">Outlet</div>,
}));

jest.mock("nuqs/adapters/react", () => ({
    NuqsAdapter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/auth/ProtectedRoute", () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/layout/DashboardLayout", () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    ),
}));

describe("notes layout route", () => {
    it("renders DashboardLayout wrapping an Outlet for child routes", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
});
