import { useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { SentientInput } from "@/components/branding";

interface IForgotPasswordRequestCardProps {
    onSubmit: (email: string) => Promise<void>;
    isLoading: boolean;
}

export function ForgotPasswordRequestCard({
    onSubmit,
    isLoading,
}: IForgotPasswordRequestCardProps) {
    const { t } = useTranslation("auth");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setEmailError(t("forgotPassword.validation.emailRequired"));
            return;
        }

        if (!validateEmail(email)) {
            setEmailError(t("forgotPassword.validation.emailInvalid"));
            return;
        }

        try {
            await onSubmit(email);
        } catch (error) {
            setEmailError(
                error instanceof Error
                    ? error.message
                    : t("forgotPassword.validation.sendFailed"),
            );
        }
    };

    return (
        <Card className="h-120 w-full max-w-sm justify-between gap-2">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    {t("forgotPassword.requestTitle")}
                </CardTitle>
                <CardDescription>
                    {t("forgotPassword.requestDescription")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <SentientInput
                        id="reset-email"
                        label={t("forgotPassword.emailLabel")}
                        type="text"
                        inputMode="email"
                        placeholder={t("forgotPassword.emailPlaceholder")}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(null);
                        }}
                        disabled={isLoading}
                        validationState={emailError ? "error" : "idle"}
                        errorMessage={emailError || undefined}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !email.trim()}
                    >
                        {isLoading
                            ? t("forgotPassword.submittingButton")
                            : t("forgotPassword.submitButton")}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <p className="text-muted-foreground text-center text-sm">
                    {t("forgotPassword.rememberPassword")}{" "}
                    <Link
                        to="/login"
                        className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                        {t("forgotPassword.signInLink")}
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
    );
}
