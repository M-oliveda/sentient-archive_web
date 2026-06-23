import { useState } from "react";
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
import { SentientInput } from "@/components/branding";

interface IForgotPasswordRequestCardProps {
    onSubmit: (email: string) => Promise<void>;
    isLoading: boolean;
}

export function ForgotPasswordRequestCard({
    onSubmit,
    isLoading,
}: IForgotPasswordRequestCardProps) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setEmailError("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        try {
            await onSubmit(email);
        } catch (error) {
            setEmailError(
                error instanceof Error
                    ? error.message
                    : "Failed to send reset link. Please try again.",
            );
        }
    };

    return (
        <Card className="h-[480px] w-full max-w-sm justify-between gap-2">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Reset Your Password
                </CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a link to reset
                    your password.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <SentientInput
                        id="reset-email"
                        label="Email address"
                        type="text"
                        inputMode="email"
                        placeholder="johndoe@example.com"
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
                        {isLoading ? "Sending..." : "Send Reset Link"}
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
