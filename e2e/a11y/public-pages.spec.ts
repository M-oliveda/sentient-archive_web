import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test.describe("accessibility", () => {
    test("landing page has no critical axe violations", async ({ page }) => {
        await page.goto("/");
        const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze();

        const critical = results.violations.filter(
            (v) => v.impact === "critical" || v.impact === "serious",
        );
        expect(critical).toEqual([]);
    });

    test("login page has no critical axe violations", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByText(/welcome back/i)).toBeVisible();
        const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze();

        const critical = results.violations.filter(
            (v) => v.impact === "critical" || v.impact === "serious",
        );
        expect(critical).toEqual([]);
    });

    test("signup page has no critical axe violations", async ({ page }) => {
        await page.goto("/signup");
        const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze();

        const critical = results.violations.filter(
            (v) => v.impact === "critical" || v.impact === "serious",
        );
        expect(critical).toEqual([]);
    });
});
