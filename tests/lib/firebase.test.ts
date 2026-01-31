// Mock env module first
const mockEnv = {
    VITE_USE_EMULATOR: "false",
    VITE_FIREBASE_API_KEY: "test-api-key",
    VITE_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "test-project",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
    VITE_FIREBASE_APP_ID: "1:123456789:web:abc123",
};
let mockIsEmulatorEnabled = false;

jest.mock("@/lib/env", () => ({
    get env() {
        return mockEnv;
    },
    isEmulatorEnabled: () => mockIsEmulatorEnabled,
}));

// Mock Firebase modules
const mockApp = { name: "test-app" };
const mockAuth = { name: "test-auth" };
const mockDb = { name: "test-db" };
const mockStorage = { name: "test-storage" };
const mockFunctions = { name: "test-functions" };

const mockConnectAuthEmulator = jest.fn();
const mockConnectFirestoreEmulator = jest.fn();
const mockConnectStorageEmulator = jest.fn();
const mockConnectFunctionsEmulator = jest.fn();

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(() => mockApp),
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => mockAuth),
    connectAuthEmulator: mockConnectAuthEmulator,
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => mockDb),
    connectFirestoreEmulator: mockConnectFirestoreEmulator,
}));

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => mockStorage),
    connectStorageEmulator: mockConnectStorageEmulator,
}));

jest.mock("firebase/functions", () => ({
    getFunctions: jest.fn(() => mockFunctions),
    connectFunctionsEmulator: mockConnectFunctionsEmulator,
}));

describe("firebase", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsEmulatorEnabled = false;
    });

    describe("initialization", () => {
        it("initializes Firebase app with config from environment", async () => {
            jest.resetModules();
            const { initializeApp } = await import("firebase/app");
            await import("@/lib/firebase");

            expect(initializeApp).toHaveBeenCalledWith({
                apiKey: "test-api-key",
                authDomain: "test.firebaseapp.com",
                projectId: "test-project",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abc123",
            });
        });

        it("exports all Firebase services", async () => {
            jest.resetModules();
            const firebase = await import("@/lib/firebase");

            expect(firebase.app).toBeDefined();
            expect(firebase.auth).toBeDefined();
            expect(firebase.db).toBeDefined();
            expect(firebase.storage).toBeDefined();
            expect(firebase.functions).toBeDefined();
        });
    });

    describe("emulator connection", () => {
        it("connects to emulators when emulator is enabled", async () => {
            mockIsEmulatorEnabled = true;
            jest.resetModules();

            mockConnectAuthEmulator.mockClear();
            mockConnectFirestoreEmulator.mockClear();
            mockConnectStorageEmulator.mockClear();
            mockConnectFunctionsEmulator.mockClear();

            await import("@/lib/firebase");

            expect(mockConnectAuthEmulator).toHaveBeenCalledWith(
                mockAuth,
                "http://localhost:9099",
            );
            expect(mockConnectFirestoreEmulator).toHaveBeenCalledWith(
                mockDb,
                "localhost",
                8081,
            );
            expect(mockConnectStorageEmulator).toHaveBeenCalledWith(
                mockStorage,
                "localhost",
                9199,
            );
            expect(mockConnectFunctionsEmulator).toHaveBeenCalledWith(
                mockFunctions,
                "localhost",
                5001,
            );
        });

        it("does not connect to emulators when emulator is disabled", async () => {
            mockIsEmulatorEnabled = false;
            jest.resetModules();

            mockConnectAuthEmulator.mockClear();
            mockConnectFirestoreEmulator.mockClear();
            mockConnectStorageEmulator.mockClear();
            mockConnectFunctionsEmulator.mockClear();

            await import("@/lib/firebase");

            expect(mockConnectAuthEmulator).not.toHaveBeenCalled();
            expect(mockConnectFirestoreEmulator).not.toHaveBeenCalled();
            expect(mockConnectStorageEmulator).not.toHaveBeenCalled();
            expect(mockConnectFunctionsEmulator).not.toHaveBeenCalled();
        });
    });
});
