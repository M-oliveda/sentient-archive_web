import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { authService } from "@/lib/auth-service";
import * as authErrors from "@/lib/auth-errors";

jest.mock("@/lib/auth-service");

const mockNavigate = jest.fn();

jest.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
    useSearch: () => mockUseSearch(),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}));

const mockUseSearch = jest.fn(() => ({ oobCode: "valid-code-123" }));

describe("ResetPasswordPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSearch.mockReturnValue({ oobCode: "valid-code-123" });
    });

    test("shows error when reset code is missing from URL", async () => {
        mockUseSearch.mockReturnValue({ oobCode: "" });

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
            expect(
                screen.getByText("Invalid or missing reset code"),
            ).toBeInTheDocument();
        });
    });

    test("shows fallback error when verification fails without auth code", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockRejectedValue(new Error("Unknown verification error"));
        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
            expect(
                screen.getByText("An error occurred. Please try again"),
            ).toBeInTheDocument();
        });
    });

    test("shows default invalid link message when mapped error is empty", async () => {
        const getAuthErrorMessageSpy = jest
            .spyOn(authErrors, "getAuthErrorMessage")
            .mockReturnValue("");
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockRejectedValue({ code: "auth/invalid-action-code" });
        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(
                screen.getByText("This password reset link is invalid or has expired."),
            ).toBeInTheDocument();
        });

        getAuthErrorMessageSpy.mockRestore();
    });

    test("shows loading state while verifying code", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );
        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;

        render(<ResetPasswordPage />);

        expect(screen.getByText("Verifying reset link...")).toBeInTheDocument();
        expect(
            screen.getByText("Please wait while we verify your reset link."),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Set New Password")).toBeInTheDocument();
        });
    });

    test("shows reset password form when code is valid", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockResolvedValue("test@example.com");
        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Set New Password")).toBeInTheDocument();
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
            expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
        });

        expect(mockVerifyPasswordResetCode).toHaveBeenCalledWith("valid-code-123");
    });

    test("shows error when code is invalid", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockRejectedValue({ code: "auth/invalid-action-code" });
        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
            expect(
                screen.getByText("Reset link is invalid or has expired"),
            ).toBeInTheDocument();
        });

        expect(screen.getByText("Request New Reset Link")).toBeInTheDocument();
        expect(screen.getByText("Back to Login")).toBeInTheDocument();
    });

    // Note: Test for missing oobCode is covered by the invalid code test above
    // as both scenarios show the error state

    test("successfully resets password", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockResolvedValue("test@example.com");
        const mockConfirmPasswordReset = jest.fn().mockResolvedValue(undefined);

        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;
        (authService.confirmPasswordReset as jest.Mock) = mockConfirmPasswordReset;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Set New Password")).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "NewStrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "NewStrongPass123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockConfirmPasswordReset).toHaveBeenCalledWith(
                "valid-code-123",
                "NewStrongPass123!",
            );
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
        });
    });

    test("handles password reset error", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockResolvedValue("test@example.com");
        const mockConfirmPasswordReset = jest
            .fn()
            .mockRejectedValue({ code: "auth/weak-password" });

        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;
        (authService.confirmPasswordReset as jest.Mock) = mockConfirmPasswordReset;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Set New Password")).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "NewStrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "NewStrongPass123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("Password should be at least 8 characters"),
            ).toBeInTheDocument();
        });
    });

    test("handles password reset error without auth code", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockResolvedValue("test@example.com");
        const mockConfirmPasswordReset = jest
            .fn()
            .mockRejectedValue(new Error("Unknown reset error"));

        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;
        (authService.confirmPasswordReset as jest.Mock) = mockConfirmPasswordReset;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Set New Password")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "NewStrongPass123!" },
        });
        fireEvent.change(screen.getByLabelText("Confirm password"), {
            target: { value: "NewStrongPass123!" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

        await waitFor(() => {
            expect(
                screen.getByText("An error occurred. Please try again"),
            ).toBeInTheDocument();
        });
    });

    test("shows loading state during password reset", async () => {
        const mockVerifyPasswordResetCode = jest
            .fn()
            .mockResolvedValue("test@example.com");
        const mockConfirmPasswordReset = jest
            .fn()
            .mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );

        (authService.verifyPasswordResetCode as jest.Mock) =
            mockVerifyPasswordResetCode;
        (authService.confirmPasswordReset as jest.Mock) = mockConfirmPasswordReset;

        render(<ResetPasswordPage />);

        await waitFor(() => {
            expect(screen.getByText("Set New Password")).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");

        fireEvent.change(passwordInput, { target: { value: "NewStrongPass123!" } });
        fireEvent.change(confirmInput, { target: { value: "NewStrongPass123!" } });

        const submitButton = screen.getByRole("button", {
            name: "Reset Password",
        });
        fireEvent.click(submitButton);

        expect(
            screen.getByRole("button", { name: "Resetting..." }),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(mockConfirmPasswordReset).toHaveBeenCalled();
        });
    });
});
