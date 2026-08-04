export interface IFolder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type Folder = IFolder;
