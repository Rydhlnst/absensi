import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

const DEMO_ACCOUNTS = {
  superadmin: { email: "superadmin@mitrasolusindo.co.id", password: "password123" },
  admin: { email: "admin@mitrasolusindo.co.id", password: "password123" },
  employee: { email: "budi.santoso@mitrasolusindo.co.id", password: "password123" },
};

async function login(page: import("@playwright/test").Page, account: { email: string; password: string }) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill("input[type='email']", account.email);
  await page.fill("input[type='password']", account.password);
  await page.click("button[type='submit']");
  await page.waitForURL("**/dashboard", { timeout: 20000 });
}

// ============== LOGIN TESTS ==============
test.describe("1. Authentication", () => {
  test("login page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("employee login redirects to /employee/dashboard", async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.employee);
    await expect(page.url()).toContain("/employee/dashboard");
  });

  test("admin login redirects to /admin/dashboard", async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.admin);
    await expect(page.url()).toContain("/admin/dashboard");
  });

  test("super admin login redirects to /super-admin/dashboard", async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.superadmin);
    await expect(page.url()).toContain("/super-admin/dashboard");
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForURL("**/login", { timeout: 10000 });
    await expect(page.url()).toContain("/login");
  });
});

// ============== EMPLOYEE UI TESTS ==============
test.describe("2. Employee UI", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.employee);
  });

  test("dashboard renders attendance card", async ({ page }) => {
    await expect(page.getByText(/kehadiran hari ini/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("BULAN INI")).toBeVisible();
    await expect(
      page.getByText("Check In Sekarang")
        .or(page.getByText("Check Out Sekarang"))
        .or(page.getByText("sudah check out", { exact: false }))
        .or(page.getByText(/Absen Masuk Ditutup/i))
    ).toBeVisible();
  });

  test("tasks page renders tabs", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/tasks`);
    await expect(page.getByRole("button", { name: "Belum Selesai" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Selesai", exact: true })).toBeVisible();
  });

  test("attendance-history renders summary", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/attendance-history`);
    await expect(page.getByRole("heading", { name: /Riwayat/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Tipe Filter")).toBeVisible();
    await expect(page.getByText("Ringkasan Periode Ini")).toBeVisible();
  });

  test("rewards renders poin banner", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/rewards`);
    await expect(page.getByText("Total Poin Anda")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Papan Peringkat" })).toBeVisible();
  });

  test("attendance renders check-in section", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/attendance`);
    await expect(page.getByRole("heading", { name: "Absensi" })).toBeVisible({ timeout: 10000 });
  });

  test("leave renders form", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/leave`);
    await expect(page.getByRole("heading", { name: /Pengajuan Cuti/i })).toBeVisible({ timeout: 10000 });
  });

  test("profile renders info", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/profile`);
    await expect(page.getByRole("heading", { name: "Profil Saya" })).toBeVisible({ timeout: 10000 });
  });

  test("task-history page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/task-history`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/employee/task-history");
  });
});

// ============== ADMIN UI TESTS ==============
test.describe("3. Admin UI", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.admin);
  });

  test("dashboard renders stat cards", async ({ page }) => {
    await expect(page.getByText("Tugas Aktif").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Sedang Bekerja").first()).toBeVisible();
    await expect(page.getByText("Belum Absen").first()).toBeVisible();
    await expect(page.getByText("Total Gaji Berjalan").first()).toBeVisible();
  });

  test("tasks renders Belum Selesai tab", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/tasks`);
    await expect(page.getByRole("button", { name: "Belum Selesai" })).toBeVisible({ timeout: 15000 });
  });

  test("employees renders Tambah Teknisi button", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/employees`);
    await expect(page.getByRole("button", { name: "Tambah Teknisi" })).toBeVisible({ timeout: 15000 });
  });

  test("attendance page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/attendance`);
    await page.waitForTimeout(3000);
    await expect(page.url()).toContain("/admin/attendance");
  });

  test("rewards renders Riwayat Klaim", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/rewards`);
    await expect(page.getByText(/Riwayat Klaim/i)).toBeVisible({ timeout: 15000 });
  });

  test("reports renders Cetak PDF & stats", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/reports`);
    await expect(page.getByRole("button", { name: /Cetak PDF/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /Ekspor Excel/i })).toBeVisible();
  });

  test("settings renders schedule form", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/settings`);
    await expect(page.getByText("Jadwal Jam Masuk")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Device Binding/i)).toBeVisible();
  });
});

// ============== SUPER ADMIN UI TESTS ==============
test.describe("4. Super Admin UI", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.superadmin);
  });

  test("dashboard renders stats", async ({ page }) => {
    await expect(page.getByText(/Total Users|Total Admin|Total Karyawan/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("admins page renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/admins`);
    await expect(page.getByRole("heading", { name: /Manajemen Admin/i })).toBeVisible({ timeout: 15000 });
  });

  test("attendance page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/attendance`);
    await page.waitForTimeout(3000);
    await expect(page.url()).toContain("/super-admin/attendance");
  });

  test("tasks page renders list", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/tasks`);
    await expect(page.getByRole("heading", { name: /Semua Tugas|Daftar Tugas/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test("reports page renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/reports`);
    await expect(page.getByRole("heading", { name: /Laporan/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test("logs page renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/logs`);
    await expect(page.getByRole("heading", { name: /Log Sistem|Log/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test("settings renders form", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/settings`);
    await expect(page.getByRole("heading", { name: /Pengaturan Perusahaan/i })).toBeVisible({ timeout: 15000 });
  });

  test("roles page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/super-admin/roles`);
    await page.waitForTimeout(2000);
    await expect(page.url()).toContain("/super-admin/roles");
  });
});

// ============== API ENDPOINT TESTS (via page fetch) ==============
test.describe("5. API Endpoints (authenticated via fetch)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO_ACCOUNTS.admin);
  });

  const endpoints = [
    "/api/stats",
    "/api/employees",
    "/api/tasks",
    "/api/attendance",
    "/api/rewards",
    "/api/settings",
    "/api/notifications",
    "/api/reward-items",
    "/api/salaries",
    "/api/timeline-events",
    "/api/system-logs",
    "/api/admins",
    "/api/devices",
    "/api/leaves",
  ];

  for (const ep of endpoints) {
    test(`GET ${ep} returns JSON`, async ({ page }) => {
      const result = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return {
          status: res.status,
          contentType: res.headers.get("content-type") || "",
        };
      }, ep);
      expect(result.status).toBe(200);
      expect(result.contentType).toContain("application/json");
    });
  }
});
