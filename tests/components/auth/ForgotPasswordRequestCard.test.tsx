import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordRequestCard } from "@/components/auth/ForgotPasswordRequestCard";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("ForgotPasswordRequestCard", () => {
    test("renders card with all elements", () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
        expect(
            screen.getByText(/Enter your email address and we'll send you a link/),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Email address")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Send Reset Link" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Remember your password?")).toBeInTheDocument();
        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
    });

    test("validates empty email", async () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const submitButton = screen.getByRole("button", {
            name: "Send Reset Link",
        });

        // Button should be disabled when email is empty
        expect(submitButton).toBeDisabled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("shows error when form is submitted with empty email", async () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const form = screen
            .getByRole("button", { name: "Send Reset Link" })
            .closest("form");
        fireEvent.submit(form!);

        expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("validates invalid email format", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("Email address");
        fireEvent.change(emailInput, { target: { value: "invalidemail" } });

        const submitButton = screen.getByRole("button", {
            name: "Send Reset Link",
        });

        // Button should be enabled now since email is not empty
        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("Please enter a valid email address"),
            ).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("submits valid email", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("Email address");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "Send Reset Link",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith("test@example.com");
        });
    });

    test("handles submission error", async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue(new Error("Network error"));
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("Email address");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "Send Reset Link",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });
    });

    test("handles submission error with non-error rejection", async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue("Network error");
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("Email address");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

        await waitFor(() => {
            expect(
                screen.getByText("Failed to send reset link. Please try again."),
            ).toBeInTheDocument();
        });
    });

    test("disables form during loading", () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={true} />);

        const emailInput = screen.getByLabelText("Email address");
        const submitButton = screen.getByRole("button", { name: "Sending..." });

        expect(emailInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });

    test("clears error when email is changed", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        // First, enter an invalid email and submit
        const emailInput = screen.getByLabelText("Email address");
        fireEvent.change(emailInput, { target: { value: "invalidemail" } });

        const submitButton = screen.getByRole("button", {
            name: "Send Reset Link",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("Please enter a valid email address"),
            ).toBeInTheDocument();
        });

        // Then change the email to a valid one
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        await waitFor(() => {
            expect(
                screen.queryByText("Please enter a valid email address"),
            ).not.toBeInTheDocument();
        });
    });

    test("submit button is disabled when email is empty", () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const submitButton = screen.getByRole("button", {
            name: "Send Reset Link",
        });
        expect(submitButton).toBeDisabled();
    });
});
