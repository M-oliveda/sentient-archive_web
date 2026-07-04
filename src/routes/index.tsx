import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/")({
    component: IndexPage,
});

function IndexPage() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return <Navigate to="/login" />;
}
