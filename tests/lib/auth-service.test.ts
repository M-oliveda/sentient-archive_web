import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
    type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { authService } from "@/lib/auth-service";

jest.mock("firebase/auth");
jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({
    auth: {},
    db: {},
}));

describe("authService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("signInWithGoogle", () => {
        it("should sign in with Google and create user document", async () => {
            const mockUser = {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                photoURL: null,
            };
            const mockResult = { user: mockUser };

            (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            const result = await authService.signInWithGoogle();

            expect(signInWithPopup).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });
    });

    describe("signInWithEmail", () => {
        it("should sign in with email and password", async () => {
            const mockResult = { user: { uid: "test-uid" } };
            (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(
                mockResult,
            );

            const result = await authService.signInWithEmail(
                "test@example.com",
                "password123",
            );

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                {},
                "test@example.com",
                "password123",
            );
            expect(result).toEqual(mockResult);
        });
    });

    describe("signUpWithEmail", () => {
        it("should create user with email, password and display name", async () => {
            const mockUser = {
                uid: "test-uid",
                email: "test@example.com",
            };
            const mockResult = { user: mockUser };

            (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(
                mockResult,
            );
            (updateProfile as jest.Mock).mockResolvedValue(undefined);
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            const result = await authService.signUpWithEmail(
                "test@example.com",
                "password123",
                "Test User",
            );

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                {},
                "test@example.com",
                "password123",
            );
            expect(updateProfile).toHaveBeenCalledWith(mockUser, {
                displayName: "Test User",
            });
            expect(result).toEqual(mockResult);
        });
    });

    describe("signOut", () => {
        it("should sign out the user", async () => {
            (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

            await authService.signOut();

            expect(firebaseSignOut).toHaveBeenCalledWith({});
        });
    });

    describe("createUserDocument", () => {
        it("should create user document if it doesn't exist", async () => {
            const mockUser = {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                photoURL: null,
            } as FirebaseUser;

            (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
            (setDoc as jest.Mock).mockResolvedValue(undefined);
            (doc as jest.Mock).mockReturnValue({});

            await authService.createUserDocument(mockUser);

            expect(setDoc).toHaveBeenCalled();
        });

        it("should not create user document if it already exists", async () => {
            const mockUser = {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                photoURL: null,
            } as FirebaseUser;

            (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
            (doc as jest.Mock).mockReturnValue({});

            await authService.createUserDocument(mockUser);

            expect(setDoc).not.toHaveBeenCalled();
        });
    });

    describe("sendPasswordResetEmail", () => {
        it("should send password reset email with action code settings", async () => {
            (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

            await authService.sendPasswordResetEmail("test@example.com");

            expect(sendPasswordResetEmail).toHaveBeenCalledWith(
                {},
                "test@example.com",
                {
                    url: "http://localhost:5173/reset-password",
                    handleCodeInApp: true,
                },
            );
        });

        it("should handle errors when sending reset email", async () => {
            const mockError = new Error("auth/user-not-found");
            (sendPasswordResetEmail as jest.Mock).mockRejectedValue(mockError);

            await expect(
                authService.sendPasswordResetEmail("notfound@example.com"),
            ).rejects.toThrow("auth/user-not-found");
        });
    });

    describe("verifyPasswordResetCode", () => {
        it("should verify password reset code and return email", async () => {
            (verifyPasswordResetCode as jest.Mock).mockResolvedValue(
                "test@example.com",
            );

            const email = await authService.verifyPasswordResetCode("valid-code");

            expect(verifyPasswordResetCode).toHaveBeenCalledWith(
                {},
                "valid-code",
            );
            expect(email).toBe("test@example.com");
        });

        it("should handle invalid reset code", async () => {
            const mockError = new Error("auth/invalid-action-code");
            (verifyPasswordResetCode as jest.Mock).mockRejectedValue(mockError);

            await expect(
                authService.verifyPasswordResetCode("invalid-code"),
            ).rejects.toThrow("auth/invalid-action-code");
        });

        it("should handle expired reset code", async () => {
            const mockError = new Error("auth/expired-action-code");
            (verifyPasswordResetCode as jest.Mock).mockRejectedValue(mockError);

            await expect(
                authService.verifyPasswordResetCode("expired-code"),
            ).rejects.toThrow("auth/expired-action-code");
        });
    });

    describe("confirmPasswordReset", () => {
        it("should confirm password reset with code and new password", async () => {
            (confirmPasswordReset as jest.Mock).mockResolvedValue(undefined);

            await authService.confirmPasswordReset(
                "valid-code",
                "newPassword123!",
            );

            expect(confirmPasswordReset).toHaveBeenCalledWith(
                {},
                "valid-code",
                "newPassword123!",
            );
        });

        it("should handle weak password error", async () => {
            const mockError = new Error("auth/weak-password");
            (confirmPasswordReset as jest.Mock).mockRejectedValue(mockError);

            await expect(
                authService.confirmPasswordReset("valid-code", "weak"),
            ).rejects.toThrow("auth/weak-password");
        });

        it("should handle invalid action code during reset", async () => {
            const mockError = new Error("auth/invalid-action-code");
            (confirmPasswordReset as jest.Mock).mockRejectedValue(mockError);

            await expect(
                authService.confirmPasswordReset("invalid-code", "newPass123!"),
            ).rejects.toThrow("auth/invalid-action-code");
        });
    });
});
