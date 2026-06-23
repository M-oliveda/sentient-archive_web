import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
    component: ResetPasswordPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            oobCode: (search.oobCode as string) || undefined,
        };
    },
});
