import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/settings";
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

jest.mock("@/pages/dashboard/SettingsPage", () => ({
    SettingsPage: () => <div data-testid="settings-page" />,
}));

describe("settings route", () => {
    it("renders SettingsPage inside DashboardLayout", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("settings-page")).toBeInTheDocument();
    });
});
