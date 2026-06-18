export interface IUser {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: "client" | "admin";
    isActive: boolean;
    tokenBalance: number;
}

export type User = IUser;
