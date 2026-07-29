import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
    test("renders hero and primary CTA", async ({ page }) => {
        await page.goto("/");

        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(
            page.getByRole("link", { name: /start for free/i }).first(),
        ).toBeVisible();
    });

    test("navigates Get Started to signup", async ({ page }) => {
        await page.goto("/");
        await page
            .getByRole("link", { name: /get started/i })
            .first()
            .click();
        await expect(page).toHaveURL(/\/signup/);
    });

    test("exposes feature and how-it-works anchors", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#features")).toBeVisible();
        await expect(page.locator("#how-it-works")).toBeVisible();
        await expect(page.locator("#token-system")).toBeVisible();
    });
});
