import { test as base, expect, type Page } from "@playwright/test";

export interface IAuthFixtures {
    loginAs: (email: string, password: string) => Promise<void>;
}

async function fillLoginForm(page: Page, email: string, password: string) {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();
}

export const test = base.extend<IAuthFixtures>({
    loginAs: async ({ page }, use) => {
        await use(async (email: string, password: string) => {
            await fillLoginForm(page, email, password);
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
        });
    },
});

export { expect };
