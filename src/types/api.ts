export interface IApiResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

export interface IApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
}

export interface IExtractedNote {
    noteId: string;
    title: string;
    content: string;
    excerpt: string;
    sourceFile: {
        name: string;
        type: "pdf" | "txt" | "md";
        size: number;
        extractedAt: string;
    };
    createdAt: string;
}

export type IExtractResponse = IApiResponse<IExtractedNote>;
