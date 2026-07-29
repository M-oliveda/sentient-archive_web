import { test as base } from "@playwright/test";

/**
 * Remote environments (staging/preview) use HTTP Basic Auth via nginx.
 * playwright.config.ts requires E2E_BASE_URL and E2E_BASIC_AUTH_* and applies
 * them via `use.httpCredentials`. This fixture checks remote health at runtime.
 */
export interface IBasicAuthFixtures {
    remoteReady: void;
}

export const test = base.extend<IBasicAuthFixtures>({
    remoteReady: [
        async ({ page }, use) => {
            if (!process.env.E2E_BASE_URL) {
                throw new Error(
                    "E2E_BASE_URL is required for staging/preview Playwright projects",
                );
            }
            const response = await page.goto("/");
            if (!response || response.status() >= 500) {
                throw new Error(
                    `Remote base URL not healthy: ${process.env.E2E_BASE_URL}`,
                );
            }
            await use();
        },
        { auto: true },
    ],
});

export { expect } from "@playwright/test";
