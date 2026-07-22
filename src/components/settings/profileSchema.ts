import { z } from "zod";

export const profileSchema = z.object({
    displayName: z
        .string()
        .trim()
        .min(1, "Full name is required")
        .max(80, "Full name cannot exceed 80 characters"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
