import { useState } from "react";
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

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setEmailError(null);
            setPasswordError(null);
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

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        let hasErrors = false;

        if (!validateEmail(email)) {
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
            <Card className="h-[540px] w-full max-w-md justify-between gap-2">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your knowledge base</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleEmailSignIn} className="space-y-2">
                        <SentientInput
                            id="login-email"
                            label="Email address"
                            type="email"
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

                        <Button type="submit" className="w-full" disabled={isLoading}>
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
