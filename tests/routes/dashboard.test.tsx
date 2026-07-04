import { screen } from "@testing-library/react";
import { Route } from "@/routes/dashboard";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/components/auth/ProtectedRoute", () => ({
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
}));

describe("dashboard route", () => {
    it("should render dashboard content inside protected route", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(
            screen.getByText("Welcome to your SentientArchive dashboard"),
        ).toBeInTheDocument();
    });
});
