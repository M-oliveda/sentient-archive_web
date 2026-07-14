import { screen } from "@testing-library/react";
import { Route } from "@/routes/index";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/pages/landing/LandingPage", () => ({
    LandingPage: () => <div>Landing Page</div>,
}));

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
}));

describe("index route", () => {
    it("should render landing page for all users", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByText("Landing Page")).toBeInTheDocument();
    });
});
