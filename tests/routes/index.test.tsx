import { screen } from "@testing-library/react";
import { Route } from "@/routes/index";
import { useAuthStore } from "@/stores/authStore";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@/stores/authStore");

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
    Navigate: ({ to }: { to: string }) => <div>Navigate to: {to}</div>,
}));

describe("index route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should show loading spinner while auth is loading", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            isLoading: true,
        });

        renderRouteComponent(Route.options.component);

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should redirect authenticated users to dashboard", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
        });

        renderRouteComponent(Route.options.component);

        expect(screen.getByText("Navigate to: /dashboard")).toBeInTheDocument();
    });

    it("should redirect unauthenticated users to login", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
        });

        renderRouteComponent(Route.options.component);

        expect(screen.getByText("Navigate to: /login")).toBeInTheDocument();
    });
});
