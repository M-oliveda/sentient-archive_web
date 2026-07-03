import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
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
        it("should initiate Google sign-in redirect", async () => {
            (signInWithRedirect as jest.Mock).mockResolvedValue(undefined);

            await authService.signInWithGoogle();

            expect(signInWithRedirect).toHaveBeenCalled();
        });
    });

    describe("handleGoogleRedirectResult", () => {
        it("should create user document when redirect result exists", async () => {
            const mockUser = {
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Test User",
                photoURL: null,
            };
            (getRedirectResult as jest.Mock).mockResolvedValue({ user: mockUser });
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
            (setDoc as jest.Mock).mockResolvedValue(undefined);

            await authService.handleGoogleRedirectResult();

            expect(getRedirectResult).toHaveBeenCalled();
            expect(setDoc).toHaveBeenCalled();
        });

        it("should do nothing when there is no redirect result", async () => {
            (getRedirectResult as jest.Mock).mockResolvedValue(null);

            await authService.handleGoogleRedirectResult();

            expect(getRedirectResult).toHaveBeenCalled();
            expect(setDoc).not.toHaveBeenCalled();
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
                    url: "http://localhost:5173/login",
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

});
