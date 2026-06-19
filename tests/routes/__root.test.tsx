import { screen } from "@testing-library/react";
import { Route } from "@/routes/__root";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/hooks/useAuth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("@tanstack/react-router", () => ({
    createRootRoute: (options: { component: React.ComponentType }) => ({
        options,
    }),
    Outlet: () => <div data-testid="outlet" />,
}));

describe("__root route", () => {
    it("should render theme provider and outlet", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
});
