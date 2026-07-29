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
    fireEvent.change(screen.getByLabelText("signup.displayNameLabel"), {
        target: { value: displayName },
    });
    fireEvent.change(screen.getByLabelText("signup.emailLabel"), {
        target: { value: email },
    });
    fireEvent.click(screen.getByRole("button", { name: /signup\.nextButton/i }));

    await waitFor(() => {
        expect(screen.getByLabelText("signup.passwordLabel")).toBeInTheDocument();
        expect(screen.getByText("signup.step2Description")).toBeInTheDocument();
    });
}

async function acceptTerms() {
    fireEvent.click(screen.getByRole("checkbox", { name: /signup\.termsPrefix/i }));
}

function fillPasswordFields(password = "Password123!") {
    fireEvent.change(screen.getByLabelText("signup.passwordLabel"), {
        target: { value: password },
    });
    fireEvent.change(screen.getByLabelText("signup.confirmPasswordLabel"), {
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

        expect(screen.getByText("signup.title")).toBeInTheDocument();
        expect(screen.getByText("signup.step1Description")).toBeInTheDocument();
        expect(screen.getByLabelText("signup.displayNameLabel")).toBeInTheDocument();
        expect(screen.getByLabelText("signup.emailLabel")).toBeInTheDocument();
        expect(screen.queryByLabelText("signup.passwordLabel")).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText("signup.confirmPasswordLabel"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("shared.continueWithGoogle")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /signup\.nextButton/i }),
        ).toBeInTheDocument();
    });

    it("should validate step 1 fields on submit", () => {
        render(<SignupPage />);

        const form = screen
            .getByRole("button", { name: /signup\.nextButton/i })
            .closest("form");
        fireEvent.submit(form!);

        expect(
            screen.getByText("signup.validation.displayNameRequired"),
        ).toBeInTheDocument();
        expect(screen.getByText("signup.validation.emailRequired")).toBeInTheDocument();
    });

    it("should validate email format on step 1 submit", () => {
        render(<SignupPage />);

        fireEvent.change(screen.getByLabelText("signup.displayNameLabel"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByLabelText("signup.emailLabel"), {
            target: { value: "invalid-email" },
        });

        const form = screen
            .getByRole("button", { name: /signup\.nextButton/i })
            .closest("form");
        fireEvent.submit(form!);

        expect(screen.getByText("signup.validation.emailInvalid")).toBeInTheDocument();
    });

    it("should clear step 1 field errors when values change", () => {
        render(<SignupPage />);

        const form = screen
            .getByRole("button", { name: /signup\.nextButton/i })
            .closest("form");
        fireEvent.submit(form!);

        expect(
            screen.getByText("signup.validation.displayNameRequired"),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("signup.displayNameLabel"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByLabelText("signup.emailLabel"), {
            target: { value: "test@example.com" },
        });

        expect(
            screen.queryByText("signup.validation.displayNameRequired"),
        ).not.toBeInTheDocument();
    });

    it("should validate password strength", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        const passwordInput = screen.getByLabelText("signup.passwordLabel");

        fireEvent.change(passwordInput, { target: { value: "weak" } });

        await waitFor(() => {
            expect(
                screen.getByText("signup.passwordRules.min-length"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("signup.passwordRules.uppercase"),
            ).toBeInTheDocument();
        });
    });

    it("should validate password confirmation match", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        const passwordInput = screen.getByLabelText("signup.passwordLabel");
        const confirmInput = screen.getByLabelText("signup.confirmPasswordLabel");

        fireEvent.change(passwordInput, {
            target: { value: "Password123!" },
        });
        fireEvent.change(confirmInput, {
            target: { value: "Different123!" },
        });

        await waitFor(() => {
            expect(
                screen.getByText("signup.validation.passwordsMismatch"),
            ).toBeInTheDocument();
        });
    });

    it("should return to step 1 when back is clicked", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fireEvent.click(screen.getByRole("button", { name: /signup\.backButton/i }));

        await waitFor(() => {
            expect(screen.getByText("signup.step1Description")).toBeInTheDocument();
        });
    });

    it("should handle Google sign up", async () => {
        (authService.signInWithGoogle as jest.Mock).mockResolvedValue(undefined);

        render(<SignupPage />);

        fireEvent.click(screen.getByText("shared.continueWithGoogle"));

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

        fireEvent.click(screen.getByText("shared.continueWithGoogle"));

        await waitFor(() => {
            expect(screen.getByText("errors.networkError")).toBeInTheDocument();
        });
    });

    it("should display fallback error message on failed Google sign up without code", async () => {
        (authService.signInWithGoogle as jest.Mock).mockRejectedValue(
            new Error("Popup blocked"),
        );

        render(<SignupPage />);

        fireEvent.click(screen.getByText("shared.continueWithGoogle"));

        await waitFor(() => {
            expect(screen.getByText("errors.generic")).toBeInTheDocument();
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
        fireEvent.click(screen.getByRole("button", { name: /signup\.submitButton/i }));

        await waitFor(() => {
            expect(screen.getByText("errors.generic")).toBeInTheDocument();
        });
    });

    it("should block submit when password rules fail", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fireEvent.change(screen.getByLabelText("signup.passwordLabel"), {
            target: { value: "weak" },
        });
        fireEvent.change(screen.getByLabelText("signup.confirmPasswordLabel"), {
            target: { value: "weak" },
        });

        const form = screen
            .getByRole("button", { name: /signup\.submitButton/i })
            .closest("form");
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(authService.signUpWithEmail).not.toHaveBeenCalled();
            expect(
                screen.getByText("signup.passwordRules.min-length"),
            ).toBeInTheDocument();
        });
    });

    it("should block submit when passwords do not match", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fireEvent.change(screen.getByLabelText("signup.passwordLabel"), {
            target: { value: "Password123!" },
        });
        fireEvent.change(screen.getByLabelText("signup.confirmPasswordLabel"), {
            target: { value: "Different123!" },
        });

        const form = screen
            .getByRole("button", { name: /signup\.submitButton/i })
            .closest("form");
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(authService.signUpWithEmail).not.toHaveBeenCalled();
            expect(
                screen.getAllByText("signup.validation.passwordsMismatch").length,
            ).toBeGreaterThan(0);
        });
    });

    it("should handle successful signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockResolvedValue({});

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /signup\.submitButton/i }));

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
        fireEvent.click(screen.getByRole("button", { name: /signup\.submitButton/i }));

        await waitFor(() => {
            expect(screen.getByText("errors.emailAlreadyInUse")).toBeInTheDocument();
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
        fireEvent.click(screen.getByRole("button", { name: /signup\.submitButton/i }));

        await waitFor(() => {
            expect(screen.getByText("errors.emailAlreadyInUse")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText("signup.passwordLabel"), {
            target: { value: "Password123!@" },
        });

        expect(screen.queryByText("errors.emailAlreadyInUse")).not.toBeInTheDocument();
    });

    it("should disable sign up until terms are accepted", async () => {
        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();

        expect(
            screen.getByRole("button", { name: /signup\.submitButton/i }),
        ).toBeDisabled();

        await acceptTerms();

        expect(
            screen.getByRole("button", { name: /signup\.submitButton/i }),
        ).not.toBeDisabled();
    });

    it("should show loading state during signup", async () => {
        (authService.signUpWithEmail as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

        render(<SignupPage />);
        await goToPasswordStep();

        fillPasswordFields();
        await acceptTerms();
        fireEvent.click(screen.getByRole("button", { name: /signup\.submitButton/i }));

        expect(
            screen.getByRole("button", { name: /signup\.submittingButton/i }),
        ).toBeInTheDocument();
    });
});
