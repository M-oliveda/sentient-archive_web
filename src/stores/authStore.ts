import { create } from "zustand";
import type { User } from "@/types/user";

interface IAuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) =>
        set({
            user,
            isLoading: false,
            isAuthenticated: !!user,
        }),

    setLoading: (isLoading) => set({ isLoading }),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
        }),
}));
