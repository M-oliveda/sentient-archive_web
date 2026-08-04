import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminSystemConfigPage } from "@/pages/dashboard/AdminSystemConfigPage";

export const Route = createFileRoute("/admin/settings")({
    component: () => (
        <ProtectedRoute requireAdmin>
            <DashboardLayout>
                <AdminSystemConfigPage />
            </DashboardLayout>
        </ProtectedRoute>
    ),
});
