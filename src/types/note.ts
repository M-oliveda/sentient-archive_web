export interface INote {
    id: string;
    title: string;
    excerpt: string;
    tags: string[];
    folderId: string | null;
    updatedAt: Date;
}

export type Note = INote;
