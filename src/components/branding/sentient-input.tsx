"use client";

import { useId, useState } from "react";
import { CircleCheck, CircleAlert, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ValidationState = "idle" | "success" | "error";

export function SentientInput({
    label,
    icon: Icon,
    validationState = "idle",
    errorMessage,
    successMessage,
    className,
    id: externalId,
    type,
    ...props
}: React.ComponentProps<typeof Input> & {
    label?: string;
    icon?: LucideIcon;
    validationState?: ValidationState;
    errorMessage?: string;
    successMessage?: string;
}) {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    const showValidationIcon =
        validationState === "success" || validationState === "error";

    return (
        <div className={cn("flex w-full flex-col gap-1.5", className)}>
            {label && (
                <Label htmlFor={inputId} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon
                        className={cn(
                            "absolute top-1/2 left-3 size-4 -translate-y-1/2",
                            validationState === "error" && "text-error",
                            validationState === "success" && "text-success",
                            validationState === "idle" && "text-muted-foreground",
                        )}
                    />
                )}
                <Input
                    id={inputId}
                    type={isPassword && visible ? "text" : type}
                    aria-invalid={validationState === "error" || undefined}
                    className={cn(
                        Icon && "pl-9",
                        isPassword && (showValidationIcon ? "pr-16" : "pr-10"),
                        validationState === "success" &&
                            "border-success ring-success/20 focus-visible:border-success focus-visible:ring-success/20 ring-3",
                    )}
                    {...props}
                />
                {isPassword && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={visible ? "Hide password" : "Show password"}
                        aria-pressed={visible}
                        onClick={() => setVisible((v) => !v)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-8 -translate-y-1/2"
                    >
                        {visible ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </Button>
                )}
                {validationState === "success" && (
                    <CircleCheck
                        className={cn(
                            "text-success absolute top-1/2 size-4 -translate-y-1/2",
                            isPassword ? "right-10" : "right-3",
                        )}
                    />
                )}
                {validationState === "error" && (
                    <CircleAlert
                        className={cn(
                            "text-error absolute top-1/2 size-4 -translate-y-1/2",
                            isPassword ? "right-10" : "right-3",
                        )}
                    />
                )}
            </div>
            <div className="min-h-[20px]">
                {validationState === "error" && errorMessage && (
                    <p role="alert" className="text-error text-sm">
                        {errorMessage}
                    </p>
                )}
                {validationState === "success" && successMessage && (
                    <p className="text-success text-sm">{successMessage}</p>
                )}
            </div>
        </div>
    );
}
