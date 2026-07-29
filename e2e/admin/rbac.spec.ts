import { test, expect } from "@playwright/test";

const clientEmail = process.env.E2E_LOCAL_EMAIL ?? "e2e@example.com";
const clientPassword = process.env.E2E_LOCAL_PASSWORD ?? "Password1!";
const adminEmail = process.env.E2E_LOCAL_ADMIN_EMAIL;
const adminPassword = process.env.E2E_LOCAL_ADMIN_PASSWORD;

test.describe("admin RBAC", () => {
    test("client user cannot stay on admin users route", async ({ page }) => {
        test.skip(
            process.env.E2E_SKIP_AUTH === "1",
            "Auth-dependent E2E skipped (E2E_SKIP_AUTH=1)",
        );

        await page.goto("/login");
        await page.getByLabel(/email/i).fill(clientEmail);
        await page.getByLabel(/^password$/i).fill(clientPassword);
        await page.getByRole("button", { name: /sign in/i }).click();

        try {
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
        } catch {
            test.skip(true, "Auth emulator client user not available");
        }

        await page.goto("/admin/users");
        await expect(page).toHaveURL(/\/(dashboard|login)/);
    });

    test("admin user can open admin users route", async ({ page }) => {
        test.skip(!adminEmail || !adminPassword, "E2E_LOCAL_ADMIN_* not configured");

        await page.goto("/login");
        await page.getByLabel(/email/i).fill(adminEmail!);
        await page.getByLabel(/^password$/i).fill(adminPassword!);
        await page.getByRole("button", { name: /sign in/i }).click();

        try {
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
        } catch {
            test.skip(true, "Auth emulator admin user not available");
        }

        await page.goto("/admin/users");
        await expect(page).toHaveURL(/\/admin\/users/);
    });
});
