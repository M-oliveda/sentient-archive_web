import { useState } from "react";
import { ForgotPasswordRequestCard } from "@/components/auth/ForgotPasswordRequestCard";
import { ForgotPasswordConfirmationCard } from "@/components/auth/ForgotPasswordConfirmationCard";
import { authService } from "@/lib/auth-service";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleSendResetEmail = async (emailAddress: string) => {
        try {
            setIsLoading(true);
            await authService.sendPasswordResetEmail(emailAddress);
            setEmail(emailAddress);
            setShowConfirmation(true);
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            const errorMessage = getAuthErrorMessage(errorCode);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsResending(true);
            await authService.sendPasswordResetEmail(email);
        } catch (err: unknown) {
            console.error("Failed to resend email:", err);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            {!showConfirmation ? (
                <ForgotPasswordRequestCard
                    onSubmit={handleSendResetEmail}
                    isLoading={isLoading}
                />
            ) : (
                <ForgotPasswordConfirmationCard
                    email={email}
                    onResend={handleResend}
                    isResending={isResending}
                />
            )}
        </div>
    );
}
