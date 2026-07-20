import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIFeaturesPage } from "@/pages/dashboard/AIFeaturesPage";

export const Route = createFileRoute("/ai-features")({
    component: AIFeaturesRoute,
});

function AIFeaturesRoute() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <AIFeaturesPage />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
