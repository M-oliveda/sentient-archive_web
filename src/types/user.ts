export interface IUserPreferences {
    language: "en" | "es" | "fr" | "pt";
    theme: "light" | "dark";
    notificationsEnabled: boolean;
}

export interface IUser {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: "client" | "admin";
    isActive: boolean;
    tokenBalance: number;
    preferences?: IUserPreferences;
}

export type User = IUser;
