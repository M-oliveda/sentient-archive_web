"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { inputVariants } from "./input-variants";

function Input({
    className,
    variant = "default",
    size = "default",
    type,
    ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
    return (
        <InputPrimitive
            type={type}
            data-slot="input"
            className={cn(inputVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Input };
