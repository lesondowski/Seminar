const { test, expect } = require("@playwright/test");

test("admin can login, create POI, and publish", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin");
  await page.getByRole("button", { name: "Dang nhap" }).click();

  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await page.getByRole("button", { name: /Create POI/i }).click();

  const inputs = page.locator("input.field");
  await inputs.nth(0).fill("21.03");
  await inputs.nth(1).fill("105.84");
  await inputs.nth(2).fill("6");
  await inputs.nth(3).fill("POI Test Smoke");
  await inputs.nth(4).fill("https://cdn.example.com/audio/test-vi.mp3");
  await inputs.nth(5).fill("POI Test Smoke EN");
  await inputs.nth(6).fill("https://cdn.example.com/audio/test-en.mp3");

  const textareas = page.locator("textarea.field");
  await textareas.nth(0).fill("Mo ta smoke test VI");
  await textareas.nth(1).fill("Smoke test description EN");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("POI da duoc tao thanh cong")).toBeVisible();
  await expect(page.getByText("POI Test Smoke")).toBeVisible();

  await page.getByRole("button", { name: "Publish All" }).click();
  await expect(page.getByText("Publish thanh cong!")).toBeVisible();
});