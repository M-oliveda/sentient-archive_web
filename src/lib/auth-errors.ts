import i18n from "@/lib/i18n";

const AUTH_ERROR_KEYS: Record<string, string> = {
    "auth/user-not-found": "errors.userNotFound",
    "auth/wrong-password": "errors.wrongPassword",
    "auth/email-already-in-use": "errors.emailAlreadyInUse",
    "auth/weak-password": "errors.weakPassword",
    "auth/invalid-email": "errors.invalidEmail",
    "auth/network-request-failed": "errors.networkError",
    "auth/too-many-requests": "errors.tooManyRequests",
    "auth/user-disabled": "errors.userDisabled",
    "auth/operation-not-allowed": "errors.operationNotAllowed",
    "auth/invalid-credential": "errors.invalidCredential",
    "auth/popup-closed-by-user": "errors.popupClosedByUser",
    "auth/cancelled-popup-request": "errors.cancelledPopupRequest",
    "auth/invalid-action-code": "errors.invalidActionCode",
    "auth/expired-action-code": "errors.expiredActionCode",
};

export function getAuthErrorMessage(code: string): string {
    const key = AUTH_ERROR_KEYS[code] ?? "errors.generic";
    return i18n.t(key, { ns: "auth" });
}

// Export for backward compatibility with tests
export const authErrorMessages: Record<string, string> = AUTH_ERROR_KEYS;
