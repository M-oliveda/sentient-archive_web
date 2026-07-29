/**
 * Integration: admin RBAC via ProtectedRoute
 *
 * Non-admin users are redirected to /dashboard; admins see admin content.
 */

import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");
jest.mock("@tanstack/react-router", () => ({
    Navigate: ({ to }: { to: string }) => <div>Navigate to: {to}</div>,
}));

describe("integration: admin RBAC", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("blocks client users from admin routes", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "client-1", role: "client" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Users Page</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Navigate to: /dashboard")).toBeInTheDocument();
        expect(screen.queryByText("Admin Users Page")).not.toBeInTheDocument();
    });

    it("allows admin users to access admin routes", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "admin-1", role: "admin" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Users Page</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Admin Users Page")).toBeInTheDocument();
        expect(screen.queryByText(/Navigate to:/)).not.toBeInTheDocument();
    });

    it("redirects unauthenticated users to login before RBAC check", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });

        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Users Page</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Navigate to: /login")).toBeInTheDocument();
        expect(screen.queryByText("Admin Users Page")).not.toBeInTheDocument();
    });
});
