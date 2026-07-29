import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { authService } from "@/lib/auth-service";

jest.mock("@/lib/auth-service");
jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("ForgotPasswordPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders request card initially", () => {
        render(<ForgotPasswordPage />);

        expect(screen.getByText("forgotPassword.requestTitle")).toBeInTheDocument();
        expect(screen.getByLabelText("forgotPassword.emailLabel")).toBeInTheDocument();
    });

    test("shows confirmation card after successful email submission", async () => {
        const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
        (authService.sendPasswordResetEmail as jest.Mock) = mockSendPasswordResetEmail;

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSendPasswordResetEmail).toHaveBeenCalledWith("test@example.com");
        });

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.confirmationTitle"),
            ).toBeInTheDocument();
            expect(screen.getByText("test@example.com")).toBeInTheDocument();
        });
    });

    test("handles email submission error", async () => {
        const mockSendPasswordResetEmail = jest
            .fn()
            .mockRejectedValue({ code: "auth/user-not-found" });
        (authService.sendPasswordResetEmail as jest.Mock) = mockSendPasswordResetEmail;

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "notfound@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("errors.userNotFound")).toBeInTheDocument();
        });

        expect(
            screen.queryByText("forgotPassword.confirmationTitle"),
        ).not.toBeInTheDocument();
    });

    test("allows resending email from confirmation card", async () => {
        const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
        (authService.sendPasswordResetEmail as jest.Mock) = mockSendPasswordResetEmail;

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.confirmationTitle"),
            ).toBeInTheDocument();
        });

        const resendButton = screen.getByText("forgotPassword.resendLink");
        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(2);
            expect(mockSendPasswordResetEmail).toHaveBeenLastCalledWith(
                "test@example.com",
            );
        });
    });

    test("handles resend error gracefully", async () => {
        const mockSendPasswordResetEmail = jest
            .fn()
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error("Network error"));
        (authService.sendPasswordResetEmail as jest.Mock) = mockSendPasswordResetEmail;

        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.confirmationTitle"),
            ).toBeInTheDocument();
        });

        const resendButton = screen.getByText("forgotPassword.resendLink");
        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(2);
        });

        consoleErrorSpy.mockRestore();
    });

    test("handles email submission error without auth code", async () => {
        const mockSendPasswordResetEmail = jest
            .fn()
            .mockRejectedValue(new Error("Service unavailable"));
        (authService.sendPasswordResetEmail as jest.Mock) = mockSendPasswordResetEmail;

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("errors.generic")).toBeInTheDocument();
        });
    });

    test("displays loading state during submission", async () => {
        const mockSendPasswordResetEmail = jest
            .fn()
            .mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );
        (authService.sendPasswordResetEmail as jest.Mock) = mockSendPasswordResetEmail;

        render(<ForgotPasswordPage />);

        const emailInput = screen.getByLabelText("forgotPassword.emailLabel");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByRole("button", {
            name: "forgotPassword.submitButton",
        });
        fireEvent.click(submitButton);

        expect(
            screen.getByRole("button", { name: "forgotPassword.submittingButton" }),
        ).toBeInTheDocument();
        expect(emailInput).toBeDisabled();

        await waitFor(() => {
            expect(
                screen.getByText("forgotPassword.confirmationTitle"),
            ).toBeInTheDocument();
        });
    });
});
