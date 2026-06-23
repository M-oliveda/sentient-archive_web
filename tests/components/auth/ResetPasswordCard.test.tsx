import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordCard } from "@/components/auth/ResetPasswordCard";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("ResetPasswordCard", () => {
    test("renders card with all elements", () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText("Set New Password")).toBeInTheDocument();
        expect(
            screen.getByText("Enter and confirm your new password below"),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Reset Password" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Remember your password?")).toBeInTheDocument();
        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
    });

    test("displays password validation rules", () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
        expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
        expect(screen.getByText("One lowercase letter")).toBeInTheDocument();
        expect(screen.getByText("One number")).toBeInTheDocument();
        expect(screen.getByText(/One special character/)).toBeInTheDocument();
    });

    test("validates password strength", async () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        fireEvent.change(passwordInput, { target: { value: "weak" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        expect(submitButton).toBeDisabled();

        const form = submitButton.closest("form");
        fireEvent.submit(form!);

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("shows mismatch error when form is submitted with non-matching passwords", async () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "DifferentPass123!" } });

        const form = screen
            .getByRole("button", { name: "Reset Password" })
            .closest("form");
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("validates password confirmation match", async () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "DifferentPass123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });

        // Button should be disabled when passwords don't match
        expect(submitButton).toBeDisabled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("submits valid password", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith("StrongPass123!");
        });
    });

    test("handles submission error", async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue(new Error("Reset failed"));
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Reset failed")).toBeInTheDocument();
        });
    });

    test("handles submission error with non-error rejection", async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue("Reset failed");
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

        fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

        await waitFor(() => {
            expect(
                screen.getByText("Failed to reset password. Please try again."),
            ).toBeInTheDocument();
        });
    });

    test("disables form during loading", () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={true} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");
        const submitButton = screen.getByRole("button", { name: "Resetting..." });

        expect(passwordInput).toBeDisabled();
        expect(confirmInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });

    test("clears confirmation error when password is changed", async () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        // First, enter matching valid passwords
        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

        // Wait for passwords to be validated as matching
        await waitFor(() => {
            const submitButton = screen.getByRole("button", {
                name: "Reset Password",
            });
            expect(submitButton).not.toBeDisabled();
        });

        // Now change confirm password to not match
        fireEvent.change(confirmInput, { target: { value: "DifferentPass123!" } });

        // Button should be disabled when passwords don't match
        await waitFor(() => {
            const submitButton = screen.getByRole("button", {
                name: "Reset Password",
            });
            expect(submitButton).toBeDisabled();
        });

        // Now fix it by making them match again
        fireEvent.change(confirmInput, { target: { value: "StrongPass123!" } });

        // Button should be enabled again
        await waitFor(() => {
            const submitButton = screen.getByRole("button", {
                name: "Reset Password",
            });
            expect(submitButton).not.toBeDisabled();
        });
    });

    test("submit button is disabled when passwords don't match", () => {
        const mockOnSubmit = jest.fn();
        render(<ResetPasswordCard onSubmit={mockOnSubmit} isLoading={false} />);

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "StrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "Different123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        expect(submitButton).toBeDisabled();
    });
});
