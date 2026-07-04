import { screen } from "@testing-library/react";
import { Route } from "@/routes/terms-and-privacy";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("terms-and-privacy route", () => {
    it("should render terms and privacy page component", () => {
        renderRouteComponent(Route.options.component);

        expect(
            screen.getByText("Terms of Service & Privacy Policy"),
        ).toBeInTheDocument();
    });
});
