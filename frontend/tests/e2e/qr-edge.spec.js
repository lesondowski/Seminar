const { test, expect } = require("@playwright/test");

function setMockScenarios(page, scenarios) {
  return page.addInitScript((value) => {
    window.localStorage.setItem("gps_mock_scenarios", JSON.stringify(value));
  }, scenarios);
}

const QR_CASES = [
  { scenario: "INVALID", expectedMessage: "QR code is invalid", expectedTitle: "Ma khong hop le" },
  { scenario: "NOT_FOUND", expectedMessage: "QR code not found", expectedTitle: "Co loi xay ra" },
  { scenario: "EXPIRED", expectedMessage: "QR code has expired", expectedTitle: "Co loi xay ra" },
];

for (const qrCase of QR_CASES) {
  test(`QR edge: ${qrCase.scenario}`, async ({ page }) => {
    await setMockScenarios(page, { qrStatus: qrCase.scenario });
    await page.goto("/app?mode=qr");

    await page.getByRole("button", { name: "Quét QR" }).click();

    await expect(page.getByRole("heading", { name: qrCase.expectedTitle })).toBeVisible();
    await expect(page.getByText(qrCase.expectedMessage)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toHaveCount(0);
  });
}
