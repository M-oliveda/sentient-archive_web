import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");
jest.mock("@tanstack/react-router", () => ({
    Navigate: ({ to }: { to: string }) => <div>Navigate to: {to}</div>,
}));

describe("ProtectedRoute", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should show loading spinner while auth is loading", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        });

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should redirect to login if not authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        });

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Navigate to: /login")).toBeInTheDocument();
    });

    it("should render children if authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "test-uid", role: "client" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should redirect to dashboard if user is not admin and admin is required", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "test-uid", role: "client" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Navigate to: /dashboard")).toBeInTheDocument();
    });

    it("should render children if user is admin and admin is required", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "test-uid", role: "admin" },
            isLoading: false,
            isAuthenticated: true,
        });

        render(
            <ProtectedRoute requireAdmin>
                <div>Admin Content</div>
            </ProtectedRoute>,
        );

        expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });
});
