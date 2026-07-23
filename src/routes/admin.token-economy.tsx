import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminTokenRequestsPage } from "@/pages/dashboard/AdminTokenRequestsPage";

export const Route = createFileRoute("/admin/token-economy")({
    component: () => (
        <ProtectedRoute requireAdmin>
            <DashboardLayout>
                <AdminTokenRequestsPage />
            </DashboardLayout>
        </ProtectedRoute>
    ),
});
