import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminUsersPage } from "@/pages/dashboard/AdminUsersPage";

export const Route = createFileRoute("/admin/users")({
    component: () => (
        <ProtectedRoute requireAdmin>
            <DashboardLayout>
                <AdminUsersPage />
            </DashboardLayout>
        </ProtectedRoute>
    ),
});
