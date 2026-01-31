import { getAuth } from "firebase/auth";

const API_BASE_URL =
    import.meta.env.VITE_USE_EMULATOR === "true"
        ? "http://localhost:5001/demo-sentient-archive/us-central1"
        : `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

async function getAuthToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Not authenticated");
    }

    return await user.getIdToken();
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "API request failed");
    }

    return await response.json();
}
