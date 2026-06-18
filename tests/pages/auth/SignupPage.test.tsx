import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignupPage } from "@/pages/auth/SignupPage";
import { authService } from "@/lib/auth-service";

jest.mock("@/lib/auth-service");
jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => jest.fn(),
}));

async function goToPasswordStep(displayName = "Test User", email = "test@example.com") {
    fireEvent.change(screen.getByLabelText("Display Name"), {
        target: { value: displayName },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: email },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });
}

describe("SignupPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render signup form", () => {
        render(<SignupPage />);

        expect(screen.getByText("Create Account")).toBeInTheDocument();
        expect(screen.getByText("Step 1 of 2: Enter your details")).toBeInTheDocument();
        expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Confirm Password")).not.toBeInTheDocument();
        expect(screen.getByText("Continue with Google")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    });

    it("should validate password strength", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        const passwordInput = screen.getByLabelText("Password");

        fireEvent.change(passwordInput, { target: { value: "weak" } });

        await waitFor(() => {
            expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
            expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
        });
    });

    it("should validate password confirmation match", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm Password");

        fireEvent.change(passwordInput, {
            target: { value: "Password123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "Different123!" },
        });

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
        });
    });

    it("should handle successful signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockResolvedValue({});

        render(<SignupPage />);
        await goToPasswordStep();

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm Password");
        const signUpButton = screen.getByRole("button", { name: /sign up/i });

        fireEvent.change(passwordInput, {
            target: { value: "Password123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "Password123!" },
        });
        fireEvent.click(signUpButton);

        await waitFor(() => {
            expect(authService.signUpWithEmail).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!",
                "Test User",
            );
        });
    });

    it("should display error message on failed signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockRejectedValue({
            code: "auth/email-already-in-use",
        });

        render(<SignupPage />);
        await goToPasswordStep();

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm Password");
        const signUpButton = screen.getByRole("button", { name: /sign up/i });

        fireEvent.change(passwordInput, {
            target: { value: "Password123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "Password123!" },
        });
        fireEvent.click(signUpButton);

        await waitFor(() => {
            expect(
                screen.getByText("An account already exists with this email"),
            ).toBeInTheDocument();
        });
    });
});
