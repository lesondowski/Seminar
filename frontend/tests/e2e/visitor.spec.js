const { test, expect } = require("@playwright/test");

test("visitor free QR flow can reach map and chat", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("GPS Visitor Experience")).toBeVisible();
  await page.getByRole("link", { name: /Quét mã QR/i }).click();

  await expect(page.getByText("Căn chỉnh mã QR vào khung để quét")).toBeVisible();
  await page.getByRole("button", { name: "Quét QR" }).click();

  await expect(page.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toBeVisible();
  await page.getByRole("button", { name: "Hoi AI" }).click();

  await expect(page.getByRole("heading", { name: "Trợ lý ảo GPS" })).toBeVisible();
  await page.getByRole("button", { name: "Giờ mở cửa" }).click();
  await expect(page.getByText(/hiện mở cửa từ/i)).toBeVisible();
});

test("visitor paid QR flow passes payment gate", async ({ page }) => {
  await page.goto("/app?mode=qr");

  await page.getByRole("textbox").fill("SITE-PAID-XYZ789");
  await page.getByRole("button", { name: "Quét QR" }).click();

  await expect(page.getByText("Thanh toan mock")).toBeVisible();
  await page.getByRole("button", { name: "Thanh toan" }).click();

  await expect(page.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toBeVisible();
});