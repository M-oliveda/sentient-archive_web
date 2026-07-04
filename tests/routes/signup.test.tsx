import { screen } from "@testing-library/react";
import { Route } from "@/routes/signup";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/lib/auth-service");
jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => jest.fn(),
}));

describe("signup route", () => {
    it("should render signup page component", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByText("Create Account")).toBeInTheDocument();
    });
});
