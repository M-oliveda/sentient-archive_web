import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import {
    profileSchema,
    type ProfileFormValues,
} from "@/components/settings/profileSchema";

interface IProfileSettingsCardProps {
    displayName: string | null;
    email: string;
    photoURL: string | null;
}

function getInitials(name: string | null, email: string): string {
    const source = name?.trim() || email;
    return source
        .split(/[\s@]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function ProfileSettingsCard({
    displayName,
    email,
    photoURL,
}: IProfileSettingsCardProps) {
    const updateProfile = useUpdateProfile();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: displayName ?? "",
        },
    });

    async function onSubmit(values: ProfileFormValues): Promise<void> {
        try {
            await updateProfile.mutateAsync({
                displayName: values.displayName,
            });
            toast.success("Profile updated");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to update profile";
            toast.error(message);
        }
    }

    const usernameDisplay = email.includes("@") ? `@${email.split("@")[0]}` : email;

    const isSaving = isSubmitting || updateProfile.isPending;

    return (
        <Card
            className="max-w-xl flex-1 self-center rounded-2xl md:min-w-md"
            data-testid="profile-settings-card"
        >
            <CardContent>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col items-center gap-5"
                >
                    <Avatar size="lg" className="size-27.5 data-[size=lg]:size-27.5">
                        {photoURL ? (
                            <AvatarImage src={photoURL} alt={displayName ?? email} />
                        ) : null}
                        <AvatarFallback className="bg-secondary text-foreground text-2xl font-bold">
                            {getInitials(displayName, email)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                            id="displayName"
                            type="text"
                            autoComplete="name"
                            data-testid="profile-display-name"
                            {...register("displayName")}
                        />
                        {errors.displayName ? (
                            <p
                                className="text-destructive text-sm"
                                data-testid="profile-display-name-error"
                            >
                                {errors.displayName.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            value={usernameDisplay}
                            readOnly
                            disabled
                            data-testid="profile-username"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={!isDirty || isSaving}
                        data-testid="profile-save-button"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
