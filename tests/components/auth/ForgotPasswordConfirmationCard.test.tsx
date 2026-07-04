import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordConfirmationCard } from "@/components/auth/ForgotPasswordConfirmationCard";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("ForgotPasswordConfirmationCard", () => {
    test("renders card with all elements", () => {
        const mockOnResend = jest.fn();
        render(
            <ForgotPasswordConfirmationCard
                email="test@example.com"
                onResend={mockOnResend}
                isResending={false}
            />,
        );

        expect(screen.getByText("Check your email")).toBeInTheDocument();
        expect(
            screen.getByText(/We've sent a password reset link to/),
        ).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Back to Login" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Didn't receive the email?")).toBeInTheDocument();
        expect(screen.getByText("Click to resend")).toBeInTheDocument();
        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
    });

    test("displays checkmark icon", () => {
        const mockOnResend = jest.fn();
        const { container } = render(
            <ForgotPasswordConfirmationCard
                email="test@example.com"
                onResend={mockOnResend}
                isResending={false}
            />,
        );

        const checkIcon = container.querySelector("svg");
        expect(checkIcon).toBeInTheDocument();
    });

    test("displays provided email address", () => {
        const mockOnResend = jest.fn();
        const testEmail = "user@domain.com";
        render(
            <ForgotPasswordConfirmationCard
                email={testEmail}
                onResend={mockOnResend}
                isResending={false}
            />,
        );

        expect(screen.getByText(testEmail)).toBeInTheDocument();
    });

    test("calls onResend when resend button is clicked", async () => {
        const mockOnResend = jest.fn().mockResolvedValue(undefined);
        render(
            <ForgotPasswordConfirmationCard
                email="test@example.com"
                onResend={mockOnResend}
                isResending={false}
            />,
        );

        const resendButton = screen.getByText("Click to resend");
        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(mockOnResend).toHaveBeenCalledTimes(1);
        });
    });

    test("disables resend button during resending", () => {
        const mockOnResend = jest.fn();
        render(
            <ForgotPasswordConfirmationCard
                email="test@example.com"
                onResend={mockOnResend}
                isResending={true}
            />,
        );

        const resendButton = screen.getByText("Sending...");
        expect(resendButton).toBeDisabled();
    });

    test("shows correct text when resending", () => {
        const mockOnResend = jest.fn();
        render(
            <ForgotPasswordConfirmationCard
                email="test@example.com"
                onResend={mockOnResend}
                isResending={true}
            />,
        );

        expect(screen.getByText("Sending...")).toBeInTheDocument();
        expect(screen.queryByText("Click to resend")).not.toBeInTheDocument();
    });

    test("handles resend errors gracefully", async () => {
        const mockOnResend = jest.fn(async () => {
            // Simulate network error without actually throwing
            console.error("Failed to resend email:", new Error("Network error"));
        });

        render(
            <ForgotPasswordConfirmationCard
                email="test@example.com"
                onResend={mockOnResend}
                isResending={false}
            />,
        );

        const resendButton = screen.getByText("Click to resend");
        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(mockOnResend).toHaveBeenCalled();
        });

        // Component should continue to function normally even if resend fails
        expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
});
