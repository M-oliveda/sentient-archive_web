import { authErrorMessages, getAuthErrorMessage } from "@/lib/auth-errors";

describe("auth-errors", () => {
    it("should return mapped messages for known error codes", () => {
        for (const [code, message] of Object.entries(authErrorMessages)) {
            expect(getAuthErrorMessage(code)).toBe(message);
        }
    });

    it("should return fallback message for unknown error codes", () => {
        expect(getAuthErrorMessage("auth/unknown-code")).toBe(
            "An error occurred. Please try again",
        );
    });
});
