import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Login Page", () => {
  test("loads correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole("heading", { name: "Masuk ke Akun Anda" })).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  });

  test("has demo quick login buttons", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole("button", { name: "Super Admin" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Admin", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Employee" })).toBeVisible();
  });
});

test.describe("Login Flow", () => {
  test("Super Admin login works", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Super Admin Dashboard" })).toBeVisible();
  });

  test("Employee login works", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Selamat/ })).toBeVisible();
  });

  test("manual login works", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill("input[type='email']", "ahmad.pratama@mitrasolusindo.co.id");
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Super Admin Dashboard" })).toBeVisible();
  });
});

test.describe("Route Protection", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page.url()).toContain("/login");
  });

  test("Super Admin can access super-admin routes", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/super-admin/admins`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/super-admin/admins");
  });

  test("Employee can access employee routes", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/employee/tasks`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/employee/tasks");
  });
});
