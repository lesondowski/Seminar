const { test, expect } = require("@playwright/test");

test("active visitor keeps old snapshot after admin publish; new visitor gets new snapshot", async ({ browser }) => {
  const context = await browser.newContext();
  const visitorA = await context.newPage();
  const admin = await context.newPage();
  const visitorB = await context.newPage();

  try {
    await visitorA.goto("/app?mode=qr");
    await visitorA.getByRole("button", { name: "Quét QR" }).click();
    await expect(visitorA.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toBeVisible();
    await expect(visitorA.getByText("Snapshot POI VI")).toHaveCount(0);

    await admin.goto("/admin/login");
    await admin.getByLabel("Username").fill("admin");
    await admin.getByLabel("Password").fill("admin");
    await admin.getByRole("button", { name: "Dang nhap" }).click();
    await expect(admin.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

    await admin.getByRole("button", { name: /Create POI/i }).click();
    const inputs = admin.locator("input.field");
    await inputs.nth(0).fill("21.03");
    await inputs.nth(1).fill("105.84");
    await inputs.nth(2).fill("6");
    await inputs.nth(3).fill("Snapshot POI VI");
    await inputs.nth(4).fill("https://cdn.example.com/audio/snapshot-vi.mp3");
    await inputs.nth(5).fill("Snapshot POI EN");
    await inputs.nth(6).fill("https://cdn.example.com/audio/snapshot-en.mp3");
    const textareas = admin.locator("textarea.field");
    await textareas.nth(0).fill("Snapshot test VI");
    await textareas.nth(1).fill("Snapshot test EN");
    await admin.getByRole("button", { name: "Save" }).click();
    await expect(admin.getByText("POI da duoc tao thanh cong")).toBeVisible();

    await admin.getByRole("button", { name: "Publish All" }).click();
    await expect(admin.getByText("Publish thanh cong!")).toBeVisible();

    await expect(visitorA.getByText("Snapshot POI VI")).toHaveCount(0);

    await visitorB.goto("/app?mode=qr");
    await visitorB.getByRole("button", { name: "Quét QR" }).click();
    await expect(visitorB.getByRole("heading", { name: "Van Mieu Quoc Tu Giam" })).toBeVisible();
    await expect(visitorB.getByRole("tooltip", { name: "Snapshot POI VI" })).toBeVisible();
  } finally {
    await context.close();
  }
});
