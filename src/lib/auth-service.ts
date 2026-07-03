import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    type UserCredential,
    type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { env } from "./env";

export const authService = {
    async signInWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    },

    async handleGoogleRedirectResult(): Promise<void> {
        const result = await getRedirectResult(auth);
        if (result) {
            await this.createUserDocument(result.user);
        }
    },

    async signInWithEmail(
        email: string,
        password: string,
    ): Promise<UserCredential> {
        return await signInWithEmailAndPassword(auth, email, password);
    },

    async signUpWithEmail(
        email: string,
        password: string,
        displayName: string,
    ): Promise<UserCredential> {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
        );

        await updateProfile(result.user, { displayName });

        await this.createUserDocument(result.user);

        return result;
    },

    async signOut(): Promise<void> {
        await firebaseSignOut(auth);
    },

    async sendPasswordResetEmail(email: string): Promise<void> {
        const actionCodeSettings = {
            url: `${env.VITE_APP_URL}/login`,
        };
        await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
    },

    async createUserDocument(user: FirebaseUser): Promise<void> {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: "client",
                isActive: true,
                tokenBalance: 20,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
    },
};
