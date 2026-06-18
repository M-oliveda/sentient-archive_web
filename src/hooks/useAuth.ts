import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
    const { setUser, setLoading, logout } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    const userData = userDoc.data();

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        displayName:
                            firebaseUser.displayName || userData?.displayName || null,
                        photoURL: firebaseUser.photoURL || userData?.photoURL || null,
                        role: userData?.role || "client",
                        isActive: userData?.isActive ?? true,
                        tokenBalance: userData?.tokenBalance || 0,
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    logout();
                }
            } else {
                logout();
            }
        });

        return () => unsubscribe();
    }, [setUser, setLoading, logout]);

    return useAuthStore();
}
