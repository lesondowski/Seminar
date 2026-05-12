const { test, expect } = require("@playwright/test");

function setMockScenarios(page, scenarios) {
  return page.addInitScript((value) => {
    window.localStorage.setItem("gps_mock_scenarios", JSON.stringify(value));
  }, scenarios);
}

test("bootstrap 401 returns visitor to QR entry immediately", async ({ page }) => {
  await setMockScenarios(page, { bootstrapStatus: 401 });
  await page.goto("/app?mode=qr");

  await page.getByRole("button", { name: "Quét QR" }).click();

  await expect(page.getByText("Căn chỉnh mã QR vào khung để quét")).toBeVisible();
  await expect(page.getByText("Co loi xay ra")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toHaveCount(0);
});

test.describe("bootstrap blocking failures", () => {
  for (const status of [409, 413]) {
    test(`bootstrap ${status} shows blocking error screen`, async ({ page }) => {
      await setMockScenarios(page, { bootstrapStatus: status });
      await page.goto("/app?mode=qr");

      await page.getByRole("button", { name: "Quét QR" }).click();

      await expect(page.getByRole("heading", { name: "Co loi xay ra" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Thu lai" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Quay lai" })).toBeVisible();
    });
  }
});

test("admin publish lock shows error banner and keeps page usable", async ({ page }) => {
  await setMockScenarios(page, { publishLock: true });
  await page.goto("/admin/login");

  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin");
  await page.getByRole("button", { name: "Dang nhap" }).click();

  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await page.getByRole("button", { name: "Publish All" }).click();

  await expect(page.getByText("Publish is locked by another session")).toBeVisible();
  await expect(page.getByRole("button", { name: /Create POI/i })).toBeVisible();
});