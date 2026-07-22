import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";

export const Route = createFileRoute("/settings")({
    component: SettingsRoute,
});

function SettingsRoute() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <SettingsPage />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
