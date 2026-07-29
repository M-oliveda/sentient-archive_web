import { test, expect } from "@playwright/test";

/**
 * Requires Firebase Auth emulator + seeded user.
 * Set E2E_LOCAL_EMAIL / E2E_LOCAL_PASSWORD (defaults provided for emulator).
 */
const email = process.env.E2E_LOCAL_EMAIL ?? "e2e@example.com";
const password = process.env.E2E_LOCAL_PASSWORD ?? "Password1!";

test.describe("dashboard navigation", () => {
    test.beforeEach(async ({ page }) => {
        test.skip(
            process.env.E2E_SKIP_AUTH === "1",
            "Auth-dependent E2E skipped (E2E_SKIP_AUTH=1)",
        );

        await page.goto("/login");
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/^password$/i).fill(password);
        await page.getByRole("button", { name: /sign in/i }).click();

        try {
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
        } catch {
            test.skip(true, "Auth emulator user not available — seed E2E_LOCAL_* user");
        }
    });

    test("sidebar links navigate to primary client routes", async ({ page }) => {
        await page.getByRole("link", { name: /notes/i }).click();
        await expect(page).toHaveURL(/\/notes/);

        await page.getByRole("link", { name: /tokens/i }).click();
        await expect(page).toHaveURL(/\/tokens/);

        await page.getByRole("link", { name: /activity/i }).click();
        await expect(page).toHaveURL(/\/activity/);

        await page.getByRole("link", { name: /settings/i }).click();
        await expect(page).toHaveURL(/\/settings/);

        await page.getByRole("link", { name: /dashboard/i }).click();
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
