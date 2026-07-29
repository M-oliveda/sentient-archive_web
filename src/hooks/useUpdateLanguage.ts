/**
 * useUpdateLanguage Hook
 *
 * Mutation for updating user's language preference on the backend
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";
import type { User } from "@/types/user";

export interface IUpdateLanguagePayload {
    language: "en" | "es" | "fr" | "pt";
}

export interface IUpdateLanguageUser {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: User["role"];
    isActive: boolean;
    tokenBalance: number;
    preferences?: User["preferences"];
}

export function useUpdateLanguage() {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: (payload: IUpdateLanguagePayload) =>
            apiRequest<IApiResponse<IUpdateLanguageUser>>("/v1/users/me", {
                method: "PUT",
                body: JSON.stringify(payload),
            }),
        onSuccess: (response) => {
            if (user && response.data?.preferences) {
                setUser({
                    ...user,
                    preferences: response.data.preferences,
                });
            }
            void queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
    });
}
