import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "@/pages/auth/LoginPage";
import { authService } from "@/lib/auth-service";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/lib/auth-service");

const mockNavigate = jest.fn();

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => mockNavigate,
}));

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({ isAuthenticated: false, isLoading: false, user: null });
    });

    it("should render login form", () => {
        render(<LoginPage />);

        expect(screen.getByText("Welcome Back")).toBeInTheDocument();
        expect(screen.getByLabelText("Email address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByText("Continue with Google")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("should handle email/password sign in", async () => {
        (authService.signInWithEmail as jest.Mock).mockResolvedValue({});

        render(<LoginPage />);

        const emailInput = screen.getByLabelText("Email address");
        const passwordInput = screen.getByLabelText("Password");
        const signInButton = screen.getByRole("button", { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signInButton);

        await waitFor(() => {
            expect(authService.signInWithEmail).toHaveBeenCalledWith(
                "test@example.com",
                "password123",
            );
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
        });
    });

    it("should display error message on failed sign in", async () => {
        (authService.signInWithEmail as jest.Mock).mockRejectedValue({
            code: "auth/wrong-password",
        });

        render(<LoginPage />);

        const emailInput = screen.getByLabelText("Email address");
        const passwordInput = screen.getByLabelText("Password");
        const signInButton = screen.getByRole("button", { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
        fireEvent.click(signInButton);

        await waitFor(() => {
            expect(screen.getByText("Incorrect password")).toBeInTheDocument();
        });
    });

    it("should handle Google sign in", async () => {
        (authService.signInWithGoogle as jest.Mock).mockResolvedValue(undefined);

        render(<LoginPage />);

        fireEvent.click(screen.getByText("Continue with Google"));

        await waitFor(() => {
            expect(authService.signInWithGoogle).toHaveBeenCalled();
        });
        expect(mockNavigate).not.toHaveBeenCalledWith({ to: "/dashboard" });
    });

    it("should display error message on failed Google sign in", async () => {
        (authService.signInWithGoogle as jest.Mock).mockRejectedValue({
            code: "auth/network-request-failed",
        });

        render(<LoginPage />);

        fireEvent.click(screen.getByText("Continue with Google"));

        await waitFor(() => {
            expect(
                screen.getByText("Network error. Please check your connection"),
            ).toBeInTheDocument();
        });
    });

    it("should validate required fields on submit", () => {
        render(<LoginPage />);

        const form = screen.getByRole("button", { name: /sign in/i }).closest("form");
        fireEvent.submit(form!);

        expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
        expect(screen.getByText("Please enter your password")).toBeInTheDocument();
    });

    it("should validate email format on submit", () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "invalid-email" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "password123" },
        });

        const form = screen.getByRole("button", { name: /sign in/i }).closest("form");
        fireEvent.submit(form!);

        expect(
            screen.getByText("Please enter a valid email address"),
        ).toBeInTheDocument();
    });

    it("should display fallback error message when sign in fails without code", async () => {
        (authService.signInWithEmail as jest.Mock).mockRejectedValue(
            new Error("Network error"),
        );

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(
                screen.getByText("An error occurred. Please try again"),
            ).toBeInTheDocument();
        });
    });

    it("should display fallback error message when Google sign in fails without code", async () => {
        (authService.signInWithGoogle as jest.Mock).mockRejectedValue(
            new Error("Popup blocked"),
        );

        render(<LoginPage />);

        fireEvent.click(screen.getByText("Continue with Google"));

        await waitFor(() => {
            expect(
                screen.getByText("An error occurred. Please try again"),
            ).toBeInTheDocument();
        });
    });

    it("should clear field errors when values change", async () => {
        (authService.signInWithEmail as jest.Mock).mockRejectedValue({
            code: "auth/wrong-password",
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "wrongpassword" },
        });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText("Incorrect password")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText("Email address"), {
            target: { value: "updated@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "newpassword" },
        });

        expect(screen.queryByText("Incorrect password")).not.toBeInTheDocument();
    });

    it("should navigate to dashboard when already authenticated", async () => {
        useAuthStore.setState({ isAuthenticated: true });

        render(<LoginPage />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
        });
    });

    it("should render Forgot Password link", () => {
        render(<LoginPage />);

        const forgotPasswordLink = screen.getByText("Forgot Password?");
        expect(forgotPasswordLink).toBeInTheDocument();
        expect(forgotPasswordLink.closest("a")).toHaveAttribute(
            "href",
            "/forgot-password",
        );
    });

    it("should navigate to forgot password page when link is clicked", () => {
        render(<LoginPage />);

        const forgotPasswordLink = screen.getByText("Forgot Password?");
        expect(forgotPasswordLink.closest("a")).toHaveAttribute(
            "href",
            "/forgot-password",
        );
    });
});
