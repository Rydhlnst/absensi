import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Authentication", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole("heading", { name: "Masuk ke Akun Anda" })).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  });

  test("demo quick login buttons visible", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole("button", { name: "Super Admin" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Admin", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Employee" })).toBeVisible();
  });

  test("Super Admin login works", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await expect(page.url()).toContain("/super-admin/dashboard");
  });

  test("manual login works", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill("input[type='email']", "ahmad.pratama@mitrasolusindo.co.id");
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await expect(page.url()).toContain("/super-admin/dashboard");
  });

  test("unauthenticated redirect to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page.url()).toContain("/login");
  });
});

test.describe("Super Admin Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
  });

  test("dashboard loads", async ({ page }) => {
    await expect(page.url()).toContain("/super-admin/dashboard");
  });

  test("admins page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/admins`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/super-admin/admins");
  });

  test("roles page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/roles`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/super-admin/roles");
  });

  test("logs page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/logs`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/super-admin/logs");
  });

  test("settings page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/settings`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/super-admin/settings");
  });
});

test.describe("Employee Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
  });

  test("dashboard loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/dashboard");
  });

  test("tasks page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/tasks`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/tasks");
  });

  test("attendance page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/attendance`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/attendance");
  });

  test("rewards page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/rewards`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/rewards");
  });

  test("leave page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/leave`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/leave");
  });

  test("profile page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/profile`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/profile");
  });

  test("task history page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/task-history`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/task-history");
  });

  test("attendance history page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/attendance-history`);
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/employee/attendance-history");
  });
});
