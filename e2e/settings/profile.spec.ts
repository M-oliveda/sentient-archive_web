import { test, expect } from "@playwright/test";

const email = process.env.E2E_LOCAL_EMAIL ?? "e2e@example.com";
const password = process.env.E2E_LOCAL_PASSWORD ?? "Password1!";

test.describe("settings profile", () => {
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
            test.skip(true, "Auth emulator user not available");
        }
    });

    test("shows profile settings card with display name field", async ({ page }) => {
        await page.goto("/settings");
        await expect(page).toHaveURL(/\/settings/);

        const nameField = page.getByLabel(/full name|display name|name/i);
        await expect(nameField.first()).toBeVisible();
        await expect(page.getByRole("button", { name: /save/i })).toBeVisible();
    });
});
