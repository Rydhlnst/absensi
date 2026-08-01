import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
  });

  test("dashboard loads", async ({ page }) => {
    await expect(page.url()).toContain("/super-admin/dashboard");
  });

  test("stats section visible", async ({ page }) => {
    await expect(page.locator("text=Total Users").first()).toBeVisible();
  });

  test("simulasi waktu visible", async ({ page }) => {
    await expect(page.locator("text=Simulasi Waktu")).toBeVisible();
  });
});

test.describe("Admin Data Teknisi", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/admin/employees`);
    await page.waitForTimeout(2000);
  });

  test("page loads", async ({ page }) => {
    await expect(page.url()).toContain("/admin/employees");
  });
});

test.describe("Admin Kelola Tugas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/admin/tasks`);
    await page.waitForTimeout(2000);
  });

  test("page loads", async ({ page }) => {
    await expect(page.url()).toContain("/admin/tasks");
  });
});

test.describe("Admin Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Super Admin");
    await page.waitForURL("**/super-admin/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForTimeout(2000);
  });

  test("page loads", async ({ page }) => {
    await expect(page.url()).toContain("/admin/settings");
  });
});

test.describe("Employee Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
  });

  test("dashboard loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/dashboard");
  });

  test("attendance card visible", async ({ page }) => {
    await expect(page.locator("text=Kehadiran Hari Ini")).toBeVisible();
  });

  test("simulasi sinkron visible", async ({ page }) => {
    await expect(page.locator("text=SIMULASI SINKRON")).toBeVisible();
  });
});

test.describe("Employee Tasks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/employee/tasks`);
    await page.waitForTimeout(1000);
  });

  test("tasks page loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/tasks");
  });
});

test.describe("Employee Attendance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/employee/attendance`);
    await page.waitForTimeout(1000);
  });

  test("attendance page loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/attendance");
  });
});

test.describe("Employee Rewards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/employee/rewards`);
    await page.waitForTimeout(1000);
  });

  test("rewards page loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/rewards");
  });
});

test.describe("Employee Leave", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/employee/leave`);
    await page.waitForTimeout(1000);
  });

  test("leave page loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/leave");
  });

  test("leave form opens", async ({ page }) => {
    await page.click("text=Ajukan Cuti Baru");
    await expect(page.locator("text=Form Pengajuan Cuti")).toBeVisible();
  });
});

test.describe("Employee Profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click("text=Employee");
    await page.waitForURL("**/employee/dashboard", { timeout: 15000 });
    await page.goto(`${BASE_URL}/employee/profile`);
    await page.waitForTimeout(1000);
  });

  test("profile page loads", async ({ page }) => {
    await expect(page.url()).toContain("/employee/profile");
  });
});
