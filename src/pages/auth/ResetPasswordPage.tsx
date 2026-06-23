import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ResetPasswordCard } from "@/components/auth/ResetPasswordCard";
import { authService } from "@/lib/auth-service";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const search = useSearch({ from: "/reset-password" });
    const oobCode = (search as { oobCode?: string }).oobCode;

    const [isVerifying, setIsVerifying] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const verifyCode = async () => {
            if (!oobCode) {
                setErrorMessage("Invalid or missing reset code");
                setIsVerifying(false);
                return;
            }

            try {
                await authService.verifyPasswordResetCode(oobCode);
                setIsValid(true);
            } catch (err: unknown) {
                const errorCode = (err as { code?: string }).code || "";
                const message = getAuthErrorMessage(errorCode);
                setErrorMessage(message);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyCode();
    }, [oobCode]);

    const handleResetPassword = async (newPassword: string) => {
        try {
            setIsLoading(true);
            await authService.confirmPasswordReset(oobCode!, newPassword);
            navigate({ to: "/login" });
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            const errorMessage = getAuthErrorMessage(errorCode);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center p-4">
                <Card className="h-auto w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            Verifying reset link...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-center">
                        Please wait while we verify your reset link.
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isValid || errorMessage) {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center p-4">
                <Card className="h-auto w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            Invalid Reset Link
                        </CardTitle>
                        <CardDescription>
                            {errorMessage ||
                                "This password reset link is invalid or has expired."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link to="/forgot-password">
                            <Button type="button" className="w-full">
                                Request New Reset Link
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button type="button" variant="outline" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <ResetPasswordCard onSubmit={handleResetPassword} isLoading={isLoading} />
        </div>
    );
}
