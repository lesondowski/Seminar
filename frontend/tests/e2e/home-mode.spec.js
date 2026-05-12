const { test, expect } = require("@playwright/test");

test("home mode auto-enters visitor map without endless loading", async ({ page }) => {
  await page.goto("/app?mode=home");

  await expect(page.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toBeVisible();
  await expect(page.getByText("Dang khoi dong")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hoi AI" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tự khám phá" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tour" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Danh sách POI" })).toBeVisible();
});
