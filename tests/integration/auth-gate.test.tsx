/**
 * Integration: auth gate via ProtectedRoute
 *
 * Unauthenticated users are redirected to /login; authenticated users see content.
 */

import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");
jest.mock("@tanstack/react-router", () => ({
    Navigate: ({ to }: { to: string }) => <div>Navigate to: {to}</div>,
}));

describe("integration: auth gate", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects unauthenticated visits of protected content to /login", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });

        render(
            <ProtectedRoute>
                <div>Dashboard Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Navigate to: /login")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    });

    it("renders protected content when authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1", role: "client" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <ProtectedRoute>
                <div>Dashboard Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
        expect(screen.queryByText(/Navigate to:/)).not.toBeInTheDocument();
    });

    it("shows loading state while auth is resolving", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        });

        render(
            <ProtectedRoute>
                <div>Dashboard Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    });
});
