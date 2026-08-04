import { test, expect } from "@playwright/test";

const languageTrigger =
    /select language|seleccionar idioma|sélectionner la langue|selecionar idioma/i;

test.describe("language switcher", () => {
    test("switches landing copy to Spanish and persists after reload", async ({
        page,
    }) => {
        await page.goto("/");

        await page.getByRole("button", { name: languageTrigger }).click();
        await page.getByRole("menuitem", { name: "Español" }).click();

        await expect(
            page.getByRole("link", { name: /comenzar gratis/i }).first(),
        ).toBeVisible({ timeout: 10_000 });

        await page.reload();

        await expect(page.getByRole("img", { name: "Español" })).toBeVisible();
    });

    test("can switch among en/es/fr/pt options", async ({ page }) => {
        await page.goto("/");

        for (const lang of ["English", "Español", "Français", "Português"]) {
            await page.getByRole("button", { name: languageTrigger }).click();
            await page.getByRole("menuitem", { name: lang }).click();
            await expect(page.getByRole("img", { name: lang })).toBeVisible();
        }
    });
});
