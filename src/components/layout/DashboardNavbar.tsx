import { useAuthStore } from "@/stores/authStore";
import { SentientArchiveLogo } from "../branding";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

function getInitials(displayName: string | null, email: string): string {
    if (displayName) {
        const words = displayName.trim().split(/\s+/).filter(Boolean);
        const first = words[0];
        const second = words[1];
        if (first && second) {
            return (first.charAt(0) + second.charAt(0)).toUpperCase();
        }
        if (first) {
            return first.charAt(0).toUpperCase();
        }
    }
    return (email[0] ?? "?").toUpperCase();
}

export function DashboardNavbar() {
    const { user } = useAuthStore();

    const initials = user ? getInitials(user.displayName, user.email) : "?";

    return (
        <header className="bg-secondary sticky top-0 z-50 flex h-16 w-full items-center justify-between px-6">
            <SentientArchiveLogo />

            <Avatar>
                <AvatarImage
                    src={user?.photoURL ?? undefined}
                    alt={user?.displayName ?? "User"}
                />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
        </header>
    );
}
