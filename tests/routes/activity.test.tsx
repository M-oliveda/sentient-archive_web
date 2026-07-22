import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/activity";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
}));

jest.mock("@/components/auth/ProtectedRoute", () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/layout/DashboardLayout", () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    ),
}));

jest.mock("nuqs/adapters/react", () => ({
    NuqsAdapter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/pages/dashboard/ActivityPage", () => ({
    ActivityPage: () => <div data-testid="activity-page" />,
}));

describe("activity route", () => {
    it("renders ActivityPage inside DashboardLayout", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("activity-page")).toBeInTheDocument();
    });
});
