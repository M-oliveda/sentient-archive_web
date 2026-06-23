import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SentientInputPassword } from "@/components/branding";
import { defaultPasswordRules } from "@/components/branding/password-rules";

interface IResetPasswordCardProps {
    onSubmit: (password: string) => Promise<void>;
    isLoading: boolean;
}

export function ResetPasswordCard({ onSubmit, isLoading }: IResetPasswordCardProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
        null,
    );

    const passwordValid = useMemo(() => {
        return defaultPasswordRules.every((rule) => rule.test(password));
    }, [password]);

    const passwordsMatch = useMemo(() => {
        return password === confirmPassword && confirmPassword.length > 0;
    }, [password, confirmPassword]);

    const isFormValid = useMemo(() => {
        return passwordValid && passwordsMatch;
    }, [passwordValid, passwordsMatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordValid) {
            return;
        }

        if (!passwordsMatch) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        try {
            await onSubmit(password);
        } catch (error) {
            setConfirmPasswordError(
                error instanceof Error
                    ? error.message
                    : "Failed to reset password. Please try again.",
            );
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setConfirmPasswordError(null);
    };

    return (
        <Card className="h-[580px] w-full max-w-sm justify-between gap-2">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                <CardDescription>
                    Enter and confirm your new password below
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <SentientInputPassword
                        id="new-password"
                        label="Password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        rules={defaultPasswordRules}
                        showValidation={true}
                    />

                    <SentientInputPassword
                        id="confirm-password"
                        label="Confirm password"
                        placeholder="********"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        disabled={isLoading}
                        rules={[]}
                        validationState={
                            confirmPasswordError
                                ? "error"
                                : passwordsMatch
                                  ? "success"
                                  : "idle"
                        }
                    />

                    {confirmPasswordError && (
                        <p className="text-error text-sm">{confirmPasswordError}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <p className="text-muted-foreground text-center text-sm">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
                <div className="flex items-center justify-center gap-2">
                    <img
                        src="/icon.svg"
                        alt=""
                        width={30}
                        height={36}
                        className="size-9"
                    />
                    <span className="text-foreground text-lg font-bold">
                        SentientArchive
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}
