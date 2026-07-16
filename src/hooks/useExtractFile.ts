import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IExtractResponse } from "@/types/api";

export function useExtractFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File): Promise<IExtractResponse> => {
            const formData = new FormData();
            formData.append("file", file);

            return apiRequest<IExtractResponse>("/v1/notes/extract", {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
    });
}
