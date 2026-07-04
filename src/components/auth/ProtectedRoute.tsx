import { Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { Spinner } from "@/components/ui/spinner";

interface IProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({
    children,
    requireAdmin = false,
}: IProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && user?.role !== "admin") {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
}
