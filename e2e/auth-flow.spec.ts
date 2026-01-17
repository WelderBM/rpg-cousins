import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page by default (or redirect)", async ({ page }) => {
    // Assuming the app has a root or market page
    await page.goto("/");

    // Check if the title is correct (adjust based on your app's actual title)
    // await expect(page).toHaveTitle(/RPG Cousins/);

    // Example: verify a specific data-testid is present
    // await expect(page.getByTestId('login-container')).toBeVisible();
  });

  test("visual regression check", async ({ page }) => {
    await page.goto("/");
    // Capture a screenshot for visual comparison
    // await expect(page).toHaveScreenshot('landing-page.png');
  });
});
