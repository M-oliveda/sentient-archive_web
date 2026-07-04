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
import { Check } from "lucide-react";

interface IForgotPasswordConfirmationCardProps {
    email: string;
    onResend: () => Promise<void>;
    isResending: boolean;
}

export function ForgotPasswordConfirmationCard({
    email,
    onResend,
    isResending,
}: IForgotPasswordConfirmationCardProps) {
    return (
        <Card className="h-[480px] w-full max-w-sm justify-between gap-2">
            <CardHeader className="text-center">
                <div className="bg-success/20 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                    <Check className="text-success size-8" />
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription>
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-medium">{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link to="/login">
                    <Button type="button" variant="outline" className="w-full">
                        Back to Login
                    </Button>
                </Link>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <p className="text-muted-foreground text-center text-sm">
                    Didn&apos;t receive the email?{" "}
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={isResending}
                        className="text-primary font-medium underline-offset-4 hover:underline disabled:opacity-50"
                    >
                        {isResending ? "Sending..." : "Click to resend"}
                    </button>
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
