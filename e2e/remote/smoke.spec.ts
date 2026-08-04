import { test, expect } from "../fixtures/basic-auth.fixture";

/**
 * Smoke suite for staging/preview (HTTP Basic Auth + live Firebase).
 * Run with: E2E_TARGET=staging E2E_BASE_URL=... npm run test:e2e:staging
 */
test.describe("remote smoke", () => {
    test("landing or login is reachable behind basic auth", async ({ page }) => {
        await page.goto("/");
        // Protected nginx may serve landing; either landing CTA or login heading is fine
        const landingCta = page.getByRole("link", {
            name: /get started|start for free/i,
        });
        const loginHeading = page.getByRole("heading", { name: /welcome back/i });
        await expect(landingCta.or(loginHeading).first()).toBeVisible({
            timeout: 20_000,
        });
    });

    test("login page renders", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });

    test("can sign in with dedicated test account when configured", async ({
        page,
    }) => {
        const email = process.env.E2E_TEST_EMAIL;
        const password = process.env.E2E_TEST_PASSWORD;
        test.skip(!email || !password, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

        await page.goto("/login");
        await page.getByLabel(/email/i).fill(email!);
        await page.getByLabel(/^password$/i).fill(password!);
        await page.getByRole("button", { name: /sign in/i }).click();
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    });
});
