import { useEffect, useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { SentientInput } from "@/components/branding";
import { authService } from "@/lib/auth-service";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { useAuthStore } from "@/stores/authStore";
import GoogleIcon from "@/components/branding/google-icon";

export function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate({ to: "/dashboard" });
        }
    }, [isAuthenticated, navigate]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isFormValid = useMemo(() => {
        return email.trim() !== "" && validateEmail(email) && password.trim() !== "";
    }, [email, password]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setEmailError(null);
        setPasswordError(null);
        try {
            await authService.signInWithGoogle();
            // browser navigates away on success — nothing below runs
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            setEmailError(getAuthErrorMessage(errorCode));
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        let hasErrors = false;

        if (!email.trim()) {
            setEmailError("Please enter your email address");
            hasErrors = true;
        } else if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address");
            hasErrors = true;
        }

        if (!password) {
            setPasswordError("Please enter your password");
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        try {
            setIsLoading(true);
            setEmailError(null);
            setPasswordError(null);
            await authService.signInWithEmail(email, password);
            navigate({ to: "/dashboard" });
        } catch (err: unknown) {
            const errorCode = (err as { code?: string }).code || "";
            const errorMessage = getAuthErrorMessage(errorCode);
            setEmailError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <Card className="h-[620px] w-full max-w-sm justify-between gap-2">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your knowledge base</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleEmailSignIn}>
                        <SentientInput
                            id="login-email"
                            label="Email address"
                            type="text"
                            inputMode="email"
                            placeholder="jhondoe@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(null);
                            }}
                            disabled={isLoading}
                            validationState={emailError ? "error" : "idle"}
                            errorMessage={emailError || undefined}
                        />
                        <div className="relative">
                            <SentientInput
                                id="login-password"
                                label="Password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(null);
                                }}
                                disabled={isLoading}
                                validationState={passwordError ? "error" : "idle"}
                                errorMessage={passwordError || undefined}
                            />

                            <p className="absolute top-0 right-0 text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="flex items-center gap-2">
                        <Separator className="flex-1" />
                        <span className="text-muted-foreground text-sm">Or</span>
                        <Separator className="flex-1" />
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-primary font-medium underline-offset-4 hover:underline"
                        >
                            Sign Up
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
