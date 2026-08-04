import { z } from "zod";
import i18n from "@/lib/i18n";

export const createProfileSchema = () =>
    z.object({
        displayName: z
            .string()
            .trim()
            .min(1, i18n.t("validation.displayNameRequired", { ns: "settings" }))
            .max(80, i18n.t("validation.displayNameTooLong", { ns: "settings" })),
    });

export const profileSchema = createProfileSchema();

export type ProfileFormValues = z.infer<typeof profileSchema>;
