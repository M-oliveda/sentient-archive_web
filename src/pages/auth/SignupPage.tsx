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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/components/branding/google-icon";

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
    const [termsAccepted, setTermsAccepted] = useState(false);

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

    const isStep1Valid = useMemo(() => {
        return displayName.trim() !== "" && email.trim() !== "" && validateEmail(email);
    }, [displayName, email]);

    const isStep2Valid = useMemo(() => {
        return (
            passwordIsValid &&
            confirmPassword.trim() !== "" &&
            passwordsMatch &&
            termsAccepted
        );
    }, [passwordIsValid, confirmPassword, passwordsMatch, termsAccepted]);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        let hasErrors = false;

        if (!displayName.trim()) {
            setDisplayNameError("Please enter your display name");
            hasErrors = true;
        }

        if (!email.trim()) {
            setEmailError("Please enter your email address");
            hasErrors = true;
        } else if (!validateEmail(email)) {
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
            <Card className="h-[590px] w-full max-w-sm justify-between gap-2">
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
                                    type="text"
                                    inputMode="email"
                                    placeholder="jhondoe@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError(null);
                                    }}
                                    validationState={emailError ? "error" : "idle"}
                                    errorMessage={emailError || undefined}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={!isStep1Valid}
                                >
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
                            className="flex flex-col space-y-4"
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

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="signup-terms-of-service"
                                    aria-label="I agree to the terms of service"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) =>
                                        setTermsAccepted(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="signup-terms-of-service"
                                    className="flex-wrap text-sm text-nowrap md:flex-nowrap md:gap-1"
                                >
                                    I agree to the
                                    <Link
                                        to="/terms-and-privacy"
                                        className="text-primary font-medium underline-offset-4 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        terms of service and privacy policy
                                    </Link>
                                </Label>
                            </div>

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
                                    disabled={isLoading || !isStep2Valid}
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
