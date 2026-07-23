import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminActivityLogsPage } from "@/pages/dashboard/AdminActivityLogsPage";

export const Route = createFileRoute("/admin/activity-logs")({
    component: () => (
        <ProtectedRoute requireAdmin>
            <DashboardLayout>
                <AdminActivityLogsPage />
            </DashboardLayout>
        </ProtectedRoute>
    ),
});
