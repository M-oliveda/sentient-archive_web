export const authErrorMessages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "An account already exists with this email",
    "auth/weak-password": "Password should be at least 8 characters",
    "auth/invalid-email": "Invalid email address",
    "auth/network-request-failed":
        "Network error. Please check your connection",
    "auth/too-many-requests":
        "Too many attempts. Please try again later",
    "auth/user-disabled": "This account has been disabled",
    "auth/operation-not-allowed": "Operation not allowed",
    "auth/invalid-credential": "Invalid credentials. Please try again",
    "auth/popup-closed-by-user": "Sign-in popup was closed",
    "auth/cancelled-popup-request": "Only one popup request is allowed at a time",
};

export function getAuthErrorMessage(code: string): string {
    return authErrorMessages[code] || "An error occurred. Please try again";
}
