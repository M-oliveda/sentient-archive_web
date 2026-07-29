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

        expect(screen.getByText("forgotPassword.requestTitle")).toBeInTheDocument();
        expect(
            screen.getByText("forgotPassword.requestDescription"),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("forgotPassword.emailLabel")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "forgotPassword.submitButton" }),
        ).toBeInTheDocument();
        expect(screen.getByText("forgotPassword.rememberPassword")).toBeInTheDocument();
        expect(screen.getByText("forgotPassword.signInLink")).toBeInTheDocument();
        expect(screen.getByText("shared.appName")).toBeInTheDocument();
    });

    test("validates empty email", async () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });

        // Button should be disabled when email is empty
        expect(submitButton).toBeDisabled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("shows error when form is submitted with empty email", async () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const form = screen
            .getByRole("button", { name: "forgotPassword.submitButton" })
            .closest("form");
        fireEvent.submit(form!);

        expect(
            screen.getByText("forgotPassword.validation.emailRequired"),
        ).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("validates invalid email format", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "invalidemail" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });

        // Button should be enabled now since email is not empty
        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.validation.emailInvalid"),
            ).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("submits valid email", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith("test@example.com");
        });
    });

    test("handles submission error", async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue(new Error("Network error"));
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });
    });

    test("handles submission error with non-error rejection", async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue("Network error");
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        fireEvent.click(
            screen.getByRole("button", { name: "forgotPassword.submitButton" }),
        );

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.validation.sendFailed"),
            ).toBeInTheDocument();
        });
    });

    test("disables form during loading", () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={true} />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submittingButton",
        });

        expect(emailInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });

    test("clears error when email is changed", async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        // First, enter an invalid email and submit
        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "invalidemail" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.validation.emailInvalid"),
            ).toBeInTheDocument();
        });

        // Then change the email to a valid one
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        await waitFor(() => {
            expect(
                screen.queryByText("forgotPassword.validation.emailInvalid"),
            ).not.toBeInTheDocument();
        });
    });

    test("submit button is disabled when email is empty", () => {
        const mockOnSubmit = jest.fn();
        render(<ForgotPasswordRequestCard onSubmit={mockOnSubmit} isLoading={false} />);

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        expect(submitButton).toBeDisabled();
    });
});
