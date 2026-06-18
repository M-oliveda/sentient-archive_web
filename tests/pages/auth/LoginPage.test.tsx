import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "@/pages/auth/LoginPage";
import { authService } from "@/lib/auth-service";

jest.mock("@/lib/auth-service");
jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => jest.fn(),
}));

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
        (authService.signInWithGoogle as jest.Mock).mockResolvedValue({});

        render(<LoginPage />);

        const googleButton = screen.getByText("Continue with Google");
        fireEvent.click(googleButton);

        await waitFor(() => {
            expect(authService.signInWithGoogle).toHaveBeenCalled();
        });
    });
});
