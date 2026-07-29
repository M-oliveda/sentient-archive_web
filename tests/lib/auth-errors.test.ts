import { getAuthErrorMessage } from "@/lib/auth-errors";

// Mock i18n to return the key itself (same as react-i18next mock)
jest.mock("@/lib/i18n", () => ({
    __esModule: true,
    default: {
        t: (key: string) => key,
    },
}));

describe("auth-errors", () => {
    it("should return mapped error keys for known error codes", () => {
        expect(getAuthErrorMessage("auth/user-not-found")).toBe("errors.userNotFound");
        expect(getAuthErrorMessage("auth/wrong-password")).toBe("errors.wrongPassword");
        expect(getAuthErrorMessage("auth/email-already-in-use")).toBe("errors.emailAlreadyInUse");
        expect(getAuthErrorMessage("auth/weak-password")).toBe("errors.weakPassword");
        expect(getAuthErrorMessage("auth/invalid-email")).toBe("errors.invalidEmail");
        expect(getAuthErrorMessage("auth/network-request-failed")).toBe("errors.networkError");
        expect(getAuthErrorMessage("auth/too-many-requests")).toBe("errors.tooManyRequests");
        expect(getAuthErrorMessage("auth/user-disabled")).toBe("errors.userDisabled");
        expect(getAuthErrorMessage("auth/operation-not-allowed")).toBe("errors.operationNotAllowed");
        expect(getAuthErrorMessage("auth/invalid-credential")).toBe("errors.invalidCredential");
        expect(getAuthErrorMessage("auth/popup-closed-by-user")).toBe("errors.popupClosedByUser");
        expect(getAuthErrorMessage("auth/cancelled-popup-request")).toBe("errors.cancelledPopupRequest");
        expect(getAuthErrorMessage("auth/invalid-action-code")).toBe("errors.invalidActionCode");
        expect(getAuthErrorMessage("auth/expired-action-code")).toBe("errors.expiredActionCode");
    });

    it("should return fallback message for unknown error codes", () => {
        expect(getAuthErrorMessage("auth/unknown-code")).toBe("errors.generic");
    });
});
