import { create } from "zustand";
import type { User } from "@/types/user";

interface IAuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    setTokenBalance: (balance: number) => void;
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

    setTokenBalance: (balance) =>
        set((state) => ({
            user: state.user ? { ...state.user, tokenBalance: balance } : null,
        })),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        }),
}));
