import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";
import type { IFlashcard } from "@/types/note";

export interface ISummarizeData {
    noteId: string;
    summary: string;
    tokensUsed: number;
    tokenCost: number;
    balanceAfter: number;
}

export interface IAutoTagData {
    noteId: string;
    tags: string[];
    tokensUsed: number;
    tokenCost: number;
    balanceAfter: number;
}

export interface IFlashcardsData {
    noteId: string;
    flashcards: IFlashcard[];
    tokensUsed: number;
    tokenCost: number;
    balanceAfter: number;
}

export interface IRagQueryData {
    answer: string;
    tokensUsed: number;
    tokenCost: number;
    balanceAfter: number;
}

export function useAINoteActions(noteId: string) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const summarize = useMutation({
        mutationFn: () =>
            apiRequest<IApiResponse<ISummarizeData>>("/v1/ai/summarize", {
                method: "POST",
                body: JSON.stringify({ noteId }),
            }),
        onSuccess: (data) => {
            useAuthStore.getState().setTokenBalance(data.data.balanceAfter);
            queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] });
            queryClient.invalidateQueries({
                queryKey: ["notes", "detail", user!.uid, noteId],
            });
        },
    });

    const autoTag = useMutation({
        mutationFn: () =>
            apiRequest<IApiResponse<IAutoTagData>>("/v1/ai/autoTag", {
                method: "POST",
                body: JSON.stringify({ noteId }),
            }),
        onSuccess: (data) => {
            useAuthStore.getState().setTokenBalance(data.data.balanceAfter);
            queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] });
            queryClient.invalidateQueries({
                queryKey: ["notes", "detail", user!.uid, noteId],
            });
        },
    });

    const flashcards = useMutation({
        mutationFn: () =>
            apiRequest<IApiResponse<IFlashcardsData>>("/v1/ai/flashcards", {
                method: "POST",
                body: JSON.stringify({ noteId }),
            }),
        onSuccess: (data) => {
            useAuthStore.getState().setTokenBalance(data.data.balanceAfter);
            queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] });
            queryClient.invalidateQueries({
                queryKey: ["notes", "detail", user!.uid, noteId],
            });
        },
    });

    const ragQuery = useMutation({
        mutationFn: (question: string) =>
            apiRequest<IApiResponse<IRagQueryData>>("/v1/ai/ragQuery", {
                method: "POST",
                body: JSON.stringify({ query: question }),
            }),
        onSuccess: (data) => {
            useAuthStore.getState().setTokenBalance(data.data.balanceAfter);
            queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] });
        },
    });

    return { summarize, autoTag, flashcards, ragQuery };
}
