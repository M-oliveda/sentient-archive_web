import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientDashboardHome } from "@/pages/dashboard/ClientDashboardHome";
import { AdminDashboardHome } from "@/pages/dashboard/AdminDashboardHome";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/dashboard")({
    component: DashboardPage,
});

function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <ProtectedRoute>
            <DashboardLayout>
                {user?.role === "admin" ? (
                    <AdminDashboardHome />
                ) : (
                    <ClientDashboardHome />
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
