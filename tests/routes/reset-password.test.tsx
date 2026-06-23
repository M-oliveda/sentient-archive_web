import { screen } from "@testing-library/react";
import { Route } from "@/routes/reset-password";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/lib/auth-service");
jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: Record<string, unknown>) => ({
        options,
    }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => jest.fn(),
    useSearch: () => ({}),
}));

describe("reset-password route", () => {
    it("should render reset password page component", async () => {
        renderRouteComponent(Route.options.component);

        expect(await screen.findByText("Invalid Reset Link")).toBeInTheDocument();
    });

    it("should validate search params", () => {
        const validateSearch = Route.options.validateSearch as (
            search: Record<string, unknown>,
        ) => { oobCode: string | undefined };

        expect(validateSearch({ oobCode: "abc123" })).toEqual({ oobCode: "abc123" });
        expect(validateSearch({})).toEqual({ oobCode: undefined });
    });
});
