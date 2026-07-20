import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/ai-features";
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

jest.mock("@/pages/dashboard/AIFeaturesPage", () => ({
    AIFeaturesPage: () => <div data-testid="ai-features-page" />,
}));

describe("ai-features route", () => {
    it("renders AIFeaturesPage inside DashboardLayout", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        expect(screen.getByTestId("ai-features-page")).toBeInTheDocument();
    });
});
