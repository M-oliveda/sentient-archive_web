import { test, expect } from "@playwright/test";

test.describe("login page", () => {
    test("renders email/password form", async ({ page }) => {
        await page.goto("/login");

        // CardTitle is a div (not a heading role)
        await expect(page.getByText(/welcome back/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/^password$/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
        await expect(
            page.getByRole("button", { name: /continue with google/i }),
        ).toBeVisible();
    });

    test("links to signup and forgot password", async ({ page }) => {
        await page.goto("/login");

        await expect(page.getByRole("link", { name: /sign up/i })).toHaveAttribute(
            "href",
            "/signup",
        );
        await expect(
            page.getByRole("link", { name: /forgot password/i }),
        ).toHaveAttribute("href", "/forgot-password");
    });
});
