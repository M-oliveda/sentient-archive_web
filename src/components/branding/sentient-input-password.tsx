"use client";

import { useId, useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Check, X, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { defaultPasswordRules, type IPasswordRule } from "./password-rules";

type ValidationState = "idle" | "success" | "error";

export function SentientInputPassword({
    label = "Password",
    rules = defaultPasswordRules,
    value: controlledValue,
    onChange,
    className,
    id: externalId,
    validationState = "idle",
    showValidation = false,
    ...props
}: Omit<React.ComponentProps<typeof Input>, "type"> & {
    label?: string;
    rules?: IPasswordRule[];
    validationState?: ValidationState;
    showValidation?: boolean;
}) {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const [visible, setVisible] = useState(false);
    const [internalValue, setInternalValue] = useState("");

    const currentValue =
        controlledValue !== undefined ? String(controlledValue) : internalValue;

    const ruleResults = useMemo(
        () =>
            rules.map((rule) => ({
                ...rule,
                passed: rule.test(currentValue),
            })),
        [rules, currentValue],
    );

    const allPassed = ruleResults.every((r) => r.passed);
    const hasInput = currentValue.length > 0;
    const showRuleState = hasInput || showValidation;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInternalValue(e.target.value);
        onChange?.(e);
    }

    return (
        <div className={cn("flex w-full flex-col gap-1.5", className)}>
            {label && (
                <Label htmlFor={inputId} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <div className="relative">
                <Lock
                    className={cn(
                        "absolute top-1/2 left-3 size-4 -translate-y-1/2",
                        validationState === "error" && "text-error",
                        validationState === "success" && "text-success",
                        validationState === "idle" &&
                            showRuleState &&
                            allPassed &&
                            "text-success",
                        validationState === "idle" &&
                            showRuleState &&
                            !allPassed &&
                            "text-error",
                        validationState === "idle" &&
                            !showRuleState &&
                            "text-muted-foreground",
                    )}
                />
                <Input
                    id={inputId}
                    type={visible ? "text" : "password"}
                    value={currentValue}
                    onChange={handleChange}
                    aria-invalid={
                        validationState === "error" ||
                        (showRuleState && !allPassed) ||
                        undefined
                    }
                    className={cn(
                        "pr-10 pl-9",
                        validationState === "success" &&
                            "border-success ring-success/20 focus-visible:border-success focus-visible:ring-success/20 ring-3",
                        validationState === "idle" &&
                            showRuleState &&
                            allPassed &&
                            "border-success ring-success/20 focus-visible:border-success focus-visible:ring-success/20 ring-3",
                    )}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    tabIndex={-1}
                    aria-label={visible ? "Hide password" : "Show password"}
                    onClick={() => setVisible((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-8 -translate-y-1/2"
                >
                    {visible ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </Button>
                {validationState === "error" && (
                    <CircleAlert className="text-error absolute top-1/2 right-10 size-4 -translate-y-1/2" />
                )}
            </div>

            {rules.length > 0 && (
                <ul
                    className="mt-1 ml-2 flex flex-col gap-1"
                    aria-label="Password requirements"
                >
                    {ruleResults.map((rule) => (
                        <li
                            key={rule.key}
                            className={cn(
                                "flex items-center gap-1.5 text-sm transition-colors",
                                !showRuleState && "text-muted-foreground",
                                showRuleState && rule.passed && "text-success",
                                showRuleState && !rule.passed && "text-error",
                            )}
                        >
                            {showRuleState && rule.passed ? (
                                <Check className="size-3.5" />
                            ) : showRuleState && !rule.passed ? (
                                <X className="size-3.5" />
                            ) : (
                                <span className="inline-block size-3.5 rounded-full border border-current" />
                            )}
                            {rule.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
