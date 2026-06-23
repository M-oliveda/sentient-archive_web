import { createFileRoute } from "@tanstack/react-router";
import { TermsAndPrivacyPage } from "@/pages/legal/TermsAndPrivacyPage";

export const Route = createFileRoute("/terms-and-privacy")({
    component: TermsAndPrivacyPage,
});
