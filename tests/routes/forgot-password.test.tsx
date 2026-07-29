import { screen } from "@testing-library/react";
import { Route } from "@/routes/forgot-password";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/lib/auth-service");
jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("forgot-password route", () => {
    it("should render forgot password page component", () => {
        renderRouteComponent(Route.options.component);

        expect(screen.getByText("forgotPassword.requestTitle")).toBeInTheDocument();
    });
});
