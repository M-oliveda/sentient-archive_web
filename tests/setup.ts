import "@testing-library/jest-dom";
import { TextEncoder } from "util";

// Polyfill TextEncoder for jsdom environment
if (!global.TextEncoder) {
    Object.defineProperty(global, "TextEncoder", {
        writable: true,
        value: TextEncoder,
    });
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Base UI checkbox relies on PointerEvent, which jsdom does not provide
class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;

    constructor(type: string, props?: PointerEventInit) {
        super(type, props);
        this.button = props?.button ?? 0;
        this.ctrlKey = props?.ctrlKey ?? false;
    }
}

Object.defineProperty(window, "PointerEvent", {
    writable: true,
    value: MockPointerEvent,
});

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === "string" &&
            args[0].includes("Warning: ReactDOM.render is no longer supported")
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
