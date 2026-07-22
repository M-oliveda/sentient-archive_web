import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";
import type { User } from "@/types/user";

export interface IUpdateProfilePayload {
    displayName: string;
}

export interface IUpdateProfileUser {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: User["role"];
    isActive: boolean;
    tokenBalance: number;
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: (payload: IUpdateProfilePayload) =>
            apiRequest<IApiResponse<IUpdateProfileUser>>("/v1/users/me", {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
        onSuccess: (response) => {
            if (user && response.data) {
                setUser({
                    ...user,
                    displayName: response.data.displayName,
                });
            }
            void queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
    });
}
