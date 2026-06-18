import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    SentientInput,
    SentientInputPassword,
    defaultPasswordRules,
} from "@/components/branding";
import { authService } from "@/lib/auth-service";
import { getAuthErrorMessage } from "@/lib/auth-errors";

function GoogleIcon() {
    return (
        <svg
            className="size-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

export function SignupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [displayNameError, setDisplayNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
        null,
    );

    const passwordsMatch = useMemo(() => {
        if (!confirmPassword) {
            return true;
        }

        return password === confirmPassword;
    }, [password, confirmPassword]);

    const passwordIsValid = useMemo(
        () => defaultPasswordRules.every((rule) => rule.test(password)),
        [password],
    );

    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        let hasErrors = false;

        if (!displayName.trim()) {
            setDisplayNameError("Please enter your display name");
            hasErrors = true;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address");
            hasErrors = true;
        }

        if (!hasErrors) {
            setStep(2);
        }
    };

    const handleBackStep = () => {
        setStep(1);
        setPasswordError(null);
        setShowPasswordValidation(false);
        setConfirmPasswordError(null);
    };

    const handleGoogleSignUp = async () => {
        try {
            setIsLoading(true);
            setDisplayNameError(null);
            setEmailError(null);
            setPasswordError(null);
            setConfirmPasswordError(null);
            await authService.signInWithGoogle();
            navigate({ to: "/dashboard" });
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            const errorMessage = getAuthErrorMessage(errorCode);
            setEmailError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        let hasErrors = false;

        if (!passwordIsValid) {
            setShowPasswordValidation(true);
            hasErrors = true;
        }

        if (!passwordsMatch) {
            setConfirmPasswordError("Passwords do not match");
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        try {
            setIsLoading(true);
            setPasswordError(null);
            setConfirmPasswordError(null);
            await authService.signUpWithEmail(email, password, displayName.trim());
            navigate({ to: "/dashboard" });
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            const errorMessage = getAuthErrorMessage(errorCode);
            setPasswordError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <Card className="h-[540px] w-full max-w-md justify-between gap-2">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        {step === 1
                            ? "Step 1 of 2: Enter your details"
                            : "Step 2 of 2: Create a password"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {step === 1 ? (
                        <>
                            <form
                                onSubmit={handleNextStep}
                                className="flex flex-col space-y-2"
                            >
                                <SentientInput
                                    id="signup-display-name"
                                    label="Display Name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={displayName}
                                    onChange={(e) => {
                                        setDisplayName(e.target.value);
                                        setDisplayNameError(null);
                                    }}
                                    validationState={
                                        displayNameError ? "error" : "idle"
                                    }
                                    errorMessage={displayNameError || undefined}
                                />
                                <SentientInput
                                    id="signup-email"
                                    label="Email"
                                    type="email"
                                    placeholder="jhondoe@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError(null);
                                    }}
                                    validationState={emailError ? "error" : "idle"}
                                    errorMessage={emailError || undefined}
                                />

                                <Button type="submit" className="w-full">
                                    Next
                                </Button>
                            </form>

                            <div className="flex items-center gap-2">
                                <Separator className="flex-1" />
                                <span className="text-muted-foreground text-sm">
                                    Or
                                </span>
                                <Separator className="flex-1" />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                            >
                                <GoogleIcon />
                                Continue with Google
                            </Button>
                        </>
                    ) : (
                        <form
                            onSubmit={handleEmailSignUp}
                            className="flex flex-col space-y-2"
                        >
                            {passwordError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{passwordError}</AlertDescription>
                                </Alert>
                            )}
                            <SentientInputPassword
                                id="signup-password"
                                label="Password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(null);
                                    setShowPasswordValidation(false);
                                }}
                                disabled={isLoading}
                                showValidation={showPasswordValidation}
                                validationState={
                                    passwordError ||
                                    (showPasswordValidation && !passwordIsValid)
                                        ? "error"
                                        : "idle"
                                }
                            />
                            <SentientInput
                                id="signup-confirm-password"
                                label="Confirm Password"
                                type="password"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setConfirmPasswordError(null);
                                }}
                                validationState={
                                    confirmPasswordError ||
                                    (confirmPassword && !passwordsMatch)
                                        ? "error"
                                        : "idle"
                                }
                                errorMessage={
                                    confirmPasswordError ||
                                    (confirmPassword && !passwordsMatch
                                        ? "Passwords do not match"
                                        : undefined)
                                }
                                disabled={isLoading}
                            />

                            <div className="flex w-full gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleBackStep}
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating account..." : "Sign Up"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary font-medium underline-offset-4 hover:underline"
                        >
                            Sign In
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
        </div>
    );
}
