import { cva, type VariantProps } from "class-variance-authority";

export const inputVariants = cva(
    "w-full min-w-0 rounded-lg border bg-transparent transition-colors outline-none placeholder:text-muted-foreground file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[valid]:border-success data-[valid]:ring-3 data-[valid]:ring-success/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:data-[valid]:border-success/70 dark:data-[valid]:ring-success/30",
    {
        variants: {
            variant: {
                default:
                    "border-input hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                ghost: "border-transparent hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            },
            size: {
                sm: "h-7 px-2 py-0.5 text-xs file:h-5 file:text-xs sm:h-8 lg:h-9 lg:text-sm",
                default:
                    "h-8 px-2.5 py-1 text-base file:h-6 file:text-sm sm:h-9 md:text-sm lg:h-10",
                lg: "h-10 px-4 py-1.5 text-base file:h-7 file:text-base sm:h-11 lg:h-12 lg:text-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export type InputVariantsProps = VariantProps<typeof inputVariants>;
