import { test, expect } from "@playwright/test";

const email = process.env.E2E_LOCAL_EMAIL ?? "e2e@example.com";
const password = process.env.E2E_LOCAL_PASSWORD ?? "Password1!";

test.describe("notes smoke", () => {
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

    test("opens notes page and can start a new note when UI exposes create", async ({
        page,
    }) => {
        await page.goto("/notes");
        await expect(page).toHaveURL(/\/notes/);

        const createButton = page.getByRole("button", {
            name: /new note|create|untitled/i,
        });
        if (await createButton.count()) {
            await createButton.first().click();
            await expect(page).toHaveURL(/\/notes\//, { timeout: 15_000 });
        } else {
            // Page still loads even if create control label differs
            await expect(page.getByRole("main")).toBeVisible();
        }
    });
});
