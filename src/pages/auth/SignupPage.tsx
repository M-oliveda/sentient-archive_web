import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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
    type IPasswordRule,
} from "@/components/branding";
import { authService } from "@/lib/auth-service";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { useAuthStore } from "@/stores/authStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@/components/branding/google-icon";

export function SignupPage() {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [step, setStep] = useState(1);

    // Translate password rules
    const translatedPasswordRules: IPasswordRule[] = useMemo(
        () =>
            defaultPasswordRules.map((rule) => ({
                ...rule,
                label: t(`signup.passwordRules.${rule.key}`),
            })),
        [t],
    );
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

    useEffect(() => {
        if (isAuthenticated) {
            navigate({ to: "/dashboard" });
        }
    }, [isAuthenticated, navigate]);

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
            setDisplayNameError(t("signup.validation.displayNameRequired"));
            hasErrors = true;
        }

        if (!email.trim()) {
            setEmailError(t("signup.validation.emailRequired"));
            hasErrors = true;
        } else if (!validateEmail(email)) {
            setEmailError(t("signup.validation.emailInvalid"));
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
        setIsLoading(true);
        setDisplayNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);
        try {
            await authService.signInWithGoogle();
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            setEmailError(getAuthErrorMessage(errorCode));
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
            setConfirmPasswordError(t("signup.validation.passwordsMismatch"));
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
            <Card className="h-155 w-full max-w-sm justify-between gap-2">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        {t("signup.title")}
                    </CardTitle>
                    <CardDescription>
                        {step === 1
                            ? t("signup.step1Description")
                            : t("signup.step2Description")}
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
                                    label={t("signup.displayNameLabel")}
                                    type="text"
                                    placeholder={t("signup.displayNamePlaceholder")}
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
                                    label={t("signup.emailLabel")}
                                    type="text"
                                    inputMode="email"
                                    placeholder={t("signup.emailPlaceholder")}
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
                                    {t("signup.nextButton")}
                                </Button>
                            </form>

                            <div className="flex items-center gap-2">
                                <Separator className="flex-1" />
                                <span className="text-muted-foreground text-sm">
                                    {t("shared.or")}
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
                                {t("shared.continueWithGoogle")}
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
                                label={t("signup.passwordLabel")}
                                placeholder={t("signup.passwordPlaceholder")}
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
                                rules={translatedPasswordRules}
                            />
                            <SentientInput
                                id="signup-confirm-password"
                                label={t("signup.confirmPasswordLabel")}
                                type="password"
                                placeholder={t("signup.confirmPasswordPlaceholder")}
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
                                        ? t("signup.validation.passwordsMismatch")
                                        : undefined)
                                }
                                disabled={isLoading}
                            />

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="signup-terms-of-service"
                                    aria-label={t("signup.termsPrefix")}
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) =>
                                        setTermsAccepted(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="signup-terms-of-service"
                                    className="flex-wrap text-sm md:flex-nowrap md:gap-3"
                                >
                                    <span className="text-nowrap">
                                        {t("signup.termsPrefix")}{" "}
                                    </span>
                                    <Link
                                        to="/terms-and-privacy"
                                        className="text-primary font-medium underline-offset-4 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {t("signup.termsLink")}
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
                                    {t("signup.backButton")}
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isLoading || !isStep2Valid}
                                >
                                    {isLoading
                                        ? t("signup.submittingButton")
                                        : t("signup.submitButton")}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-center text-sm">
                        {t("signup.alreadyHaveAccount")}{" "}
                        <Link
                            to="/login"
                            className="text-primary font-medium underline-offset-4 hover:underline"
                        >
                            {t("signup.signInLink")}
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
                            {t("shared.appName")}
                        </span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
