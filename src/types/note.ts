export interface IFlashcard {
    front: string;
    back: string;
}

export interface ISourceFile {
    name: string;
    type: "pdf" | "txt" | "md";
    size: number;
    extractedAt: Date;
}

export interface INote {
    id: string;
    userId: string;
    title: string;
    content: string;
    excerpt: string;
    folderId: string | null;
    tags: string[];
    aiTags: string[];
    summary: string | null;
    flashcards: IFlashcard[] | null;
    createdAt: Date;
    updatedAt: Date;
    viewedAt: Date;
    isPinned: boolean;
    isArchived: boolean;
    sourceFile: ISourceFile | null;
}

export type Note = INote;
