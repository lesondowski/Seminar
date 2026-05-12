const { test, expect } = require("@playwright/test");

function setMockScenarios(page, scenarios) {
  return page.addInitScript((value) => {
    window.localStorage.setItem("gps_mock_scenarios", JSON.stringify(value));
  }, scenarios);
}

async function openChat(page, scenarios = {}) {
  await setMockScenarios(page, scenarios);
  await page.goto("/app?mode=qr");
  await page.getByRole("button", { name: "Quét QR" }).click();
  await expect(page.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toBeVisible();
  await page.getByRole("button", { name: "Hoi AI" }).click();
  await expect(page.getByRole("heading", { name: "Trợ lý ảo GPS" })).toBeVisible();
}

test("chat empty message is blocked on frontend", async ({ page }) => {
  await openChat(page);

  await page.getByRole("textbox", { name: "Câu hỏi cho trợ lý" }).fill("    ");
  await page.getByRole("button", { name: "Gửi câu hỏi" }).click();

  await expect(page.locator(".chat-bubble--user")).toHaveCount(0);
  await expect(page.locator(".chat-bubble--pending")).toHaveCount(0);
});

test("chat suggestions render a POI response card", async ({ page }) => {
  await openChat(page);

  await page.getByRole("button", { name: "Gợi ý quán cà phê gần đây" }).click();

  await expect(page.getByText(/lựa chọn tuyệt vời/i)).toBeVisible();
  await expect(page.getByText(/cách bạn khoảng/i)).toBeVisible();
});

test("chat typed question still works with stable labels", async ({ page }) => {
  await openChat(page);

  await page.getByRole("textbox", { name: "Câu hỏi cho trợ lý" }).fill("Giờ mở cửa");
  await page.getByRole("button", { name: "Gửi câu hỏi" }).click();

  await expect(page.getByText(/hiện mở cửa từ/i)).toBeVisible();
});

test("chat keeps user history after sending a message", async ({ page }) => {
  await openChat(page);

  await page.getByRole("textbox", { name: "Câu hỏi cho trợ lý" }).fill("Lịch sử địa điểm");
  await page.getByRole("button", { name: "Gửi câu hỏi" }).click();

  await expect(page.locator(".chat-bubble--user")).toHaveCount(1);
  await expect(page.getByText(/giá trị văn hóa và lịch sử/i)).toBeVisible();
});
