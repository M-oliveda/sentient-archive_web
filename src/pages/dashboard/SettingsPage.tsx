import { Settings } from "lucide-react";
import { ProfileSettingsCard } from "@/components/settings";
import { useAuthStore } from "@/stores/authStore";

export function SettingsPage() {
    const { user } = useAuthStore();

    if (!user) {
        return null;
    }

    return (
        <div className="mx-auto flex w-full flex-col gap-10">
            <header className="flex flex-col gap-5">
                <div className="text-muted-foreground flex items-center gap-2">
                    <Settings className="size-5" aria-hidden />
                    <span className="text-sm font-medium tracking-wider uppercase">
                        Account
                    </span>
                </div>
                <h1 className="text-foreground text-4xl font-bold tracking-tighter">
                    Settings
                </h1>
                <p className="text-muted-foreground text-lg leading-7">
                    Manage your account settings, preferences, and billing.
                </p>
            </header>

            <ProfileSettingsCard
                displayName={user.displayName}
                email={user.email}
                photoURL={user.photoURL}
            />
        </div>
    );
}
