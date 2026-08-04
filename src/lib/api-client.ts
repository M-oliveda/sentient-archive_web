import { getAuth } from "firebase/auth";
import { env, isEmulatorEnabled } from "./env";

const API_BASE_URL = isEmulatorEnabled()
    ? "/emulator-api/demo-sentient-archive/us-central1/sentientArchiveApi"
    :env.VITE_API_BASE_URL
      ? `https://${env.VITE_API_BASE_URL}`
      : `https://us-central1-${
            env.VITE_API_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID
        }.cloudfunctions.net`;

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

    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        let message = "API request failed";
        try {
            const json = JSON.parse(text) as { error?: { message?: string } };
            message = json.error?.message ?? message;
        } catch {
            // response was not JSON (e.g. HTML error page)
        }
        throw new Error(message);
    }

    return await response.json() as T;
}
