import { test, expect } from "@playwright/test";

test.describe("protected routes", () => {
    test("redirects unauthenticated /dashboard to /login", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated /notes to /login", async ({ page }) => {
        await page.goto("/notes");
        await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated /settings to /login", async ({ page }) => {
        await page.goto("/settings");
        await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated /admin/users to /login", async ({ page }) => {
        await page.goto("/admin/users");
        await expect(page).toHaveURL(/\/login/);
    });
});
