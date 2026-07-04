import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignupPage } from "@/pages/auth/SignupPage";
import { authService } from "@/lib/auth-service";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/lib/auth-service");

jest.mock("@/components/ui/checkbox", () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        id,
        "aria-label": ariaLabel,
    }: {
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        id?: string;
        "aria-label"?: string;
    }) => (
        <input
            type="checkbox"
            id={id}
            aria-label={ariaLabel}
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
    ),
}));

const mockNavigate = jest.fn();

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
    useNavigate: () => mockNavigate,
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
        expect(screen.getByText("Step 2 of 2: Create a password")).toBeInTheDocument();
    });
}

async function acceptTerms() {
    fireEvent.click(screen.getByRole("checkbox", { name: /terms of service/i }));
}

function fillPasswordFields(password = "Password123!") {
    fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: password },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: password },
    });
}

describe("SignupPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({ isAuthenticated: false, isLoading: false, user: null });
    });

    it("should navigate to dashboard when already authenticated", async () => {
        useAuthStore.setState({ isAuthenticated: true });

        render(<SignupPage />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
        });
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

    it("should validate step 1 fields on submit", () => {
        render(<SignupPage />);

        const form = screen.getByRole("button", { name: /next/i }).closest("form");
        fireEvent.submit(form!);

        expect(screen.getByText("Please enter your display name")).toBeInTheDocument();
        expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
    });

    it("should validate email format on step 1 submit", () => {
        render(<SignupPage />);

        fireEvent.change(screen.getByLabelText("Display Name"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "invalid-email" },
        });

        const form = screen.getByRole("button", { name: /next/i }).closest("form");
        fireEvent.submit(form!);

        expect(
            screen.getByText("Please enter a valid email address"),
        ).toBeInTheDocument();
    });

    it("should clear step 1 field errors when values change", () => {
        render(<SignupPage />);

        const form = screen.getByRole("button", { name: /next/i }).closest("form");
        fireEvent.submit(form!);

        expect(screen.getByText("Please enter your display name")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Display Name"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "test@example.com" },
        });

        expect(
            screen.queryByText("Please enter your display name"),
        ).not.toBeInTheDocument();
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

    it("should return to step 1 when back is clicked", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fireEvent.click(screen.getByRole("button", { name: /back/i }));

        await waitFor(() => {
            expect(
                screen.getByText("Step 1 of 2: Enter your details"),
            ).toBeInTheDocument();
        });
    });

    it("should handle Google sign up", async () => {
        (authService.signInWithGoogle as jest.Mock).mockResolvedValue(undefined);

        render(<SignupPage />);

        fireEvent.click(screen.getByText("Continue with Google"));

        await waitFor(() => {
            expect(authService.signInWithGoogle).toHaveBeenCalled();
        });
        expect(mockNavigate).not.toHaveBeenCalledWith({ to: "/dashboard" });
    });

    it("should display error message on failed Google sign up", async () => {
        (authService.signInWithGoogle as jest.Mock).mockRejectedValue({
            code: "auth/network-request-failed",
        });

        render(<SignupPage />);

        fireEvent.click(screen.getByText("Continue with Google"));

        await waitFor(() => {
            expect(
                screen.getByText("Network error. Please check your connection"),
            ).toBeInTheDocument();
        });
    });

    it("should display fallback error message on failed Google sign up without code", async () => {
        (authService.signInWithGoogle as jest.Mock).mockRejectedValue(
            new Error("Popup blocked"),
        );

        render(<SignupPage />);

        fireEvent.click(screen.getByText("Continue with Google"));

        await waitFor(() => {
            expect(
                screen.getByText("An error occurred. Please try again"),
            ).toBeInTheDocument();
        });
    });

    it("should display fallback error message on failed signup without code", async () => {
        (authService.signUpWithEmail as jest.Mock).mockRejectedValue(
            new Error("Unknown error"),
        );

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText("An error occurred. Please try again"),
            ).toBeInTheDocument();
        });
    });

    it("should block submit when password rules fail", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "weak" },
        });
        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: { value: "weak" },
        });

        const form = screen.getByRole("button", { name: /sign up/i }).closest("form");
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(authService.signUpWithEmail).not.toHaveBeenCalled();
            expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
        });
    });

    it("should block submit when passwords do not match", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "Password123!" },
        });
        fireEvent.change(screen.getByLabelText("Confirm Password"), {
            target: { value: "Different123!" },
        });

        const form = screen.getByRole("button", { name: /sign up/i }).closest("form");
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(authService.signUpWithEmail).not.toHaveBeenCalled();
            expect(
                screen.getAllByText("Passwords do not match").length,
            ).toBeGreaterThan(0);
        });
    });

    it("should handle successful signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockResolvedValue({});

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(authService.signUpWithEmail).toHaveBeenCalledWith(
                "test@example.com",
                "Password123!",
                "Test User",
            );
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
        });
    });

    it("should display error message on failed signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockRejectedValue({
            code: "auth/email-already-in-use",
        });

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText("An account already exists with this email"),
            ).toBeInTheDocument();
        });
    });

    it("should clear password errors when password changes on step 2", async () => {
        (authService.signUpWithEmail as jest.Mock).mockRejectedValue({
            code: "auth/email-already-in-use",
        });

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(
                screen.getByText("An account already exists with this email"),
            ).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "Password123!@" },
        });

        expect(
            screen.queryByText("An account already exists with this email"),
        ).not.toBeInTheDocument();
    });

    it("should disable sign up until terms are accepted", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();

        expect(screen.getByRole("button", { name: /sign up/i })).toBeDisabled();

        await acceptTerms();

        expect(screen.getByRole("button", { name: /sign up/i })).not.toBeDisabled();
    });

    it("should show loading state during signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        expect(
            screen.getByRole("button", { name: /creating account/i }),
        ).toBeInTheDocument();
    });
});
