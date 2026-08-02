import "dotenv/config";
import { auth } from "./auth";
import { db } from "./db";
import {
  user,
  task,
  attendance,
  reward,
  rewardItem,
  companySetting,
  timelineEvent,
  notification,
} from "./schema";
import { eq } from "drizzle-orm";

async function createUser(
  email: string,
  password: string,
  name: string,
  role: "super_admin" | "admin" | "employee",
  extra: Partial<typeof user.$inferInsert> = {}
) {
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    if (result.user) {
      const updateData: Record<string, unknown> = {
        role,
        updatedAt: new Date(),
        ...extra,
      };
      await db.update(user).set(updateData).where(eq(user.id, result.user.id));
      console.log(`✓ ${role}: ${name} (${email})`);
      return result.user;
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : ""
    if (message.includes("already")) {
      const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);
      if (existing[0]) {
        console.log(`= ${role}: ${name} (already exists)`);
        return existing[0];
      }
    }
    console.log(`✗ ${role}: ${name} - ${e instanceof Error ? e.message : "unknown error"}`);
  }
  return null;
}

async function seed() {
  console.log("🌱 Seeding database...\n");

  console.log("--- Users ---");
  await createUser(
    "superadmin@mitrasolusindo.co.id",
    "password123",
    "Ahmad Rizky Pratama",
    "super_admin",
    {
      phone: "+62812345678",
      department: "IT",
      position: "Super Admin",
      nik: "3171012503900001",
      salary: 15000000,
      rewardPoints: 485,
    }
  );

  const admin = await createUser(
    "admin@mitrasolusindo.co.id",
    "password123",
    "Siti Nurhaliza",
    "admin",
    {
      phone: "+62812345679",
      department: "Administrasi",
      position: "Admin",
      nik: "3171014506950002",
      salary: 5500000,
      rewardPoints: 320,
    }
  );

  const teknisiNames = [
    { name: "Budi Santoso", email: "budi.santoso@mitrasolusindo.co.id", phone: "+62812345680", salary: 4500000, points: 290 },
    { name: "Dewi Anggraini", email: "dewi.anggraini@mitrasolusindo.co.id", phone: "+62812345681", salary: 5000000, points: 410 },
    { name: "Eko Prasetyo", email: "eko.prasetyo@mitrasolusindo.co.id", phone: "+62812345682", salary: 4800000, points: 350 },
    { name: "Fitri Handayani", email: "fitri.handayani@mitrasolusindo.co.id", phone: "+62812345683", salary: 4600000, points: 280 },
    { name: "Gilang Ramadhan", email: "gilang.ramadhan@mitrasolusindo.co.id", phone: "+62812345684", salary: 4700000, points: 320 },
  ];

  const teknisi: typeof user.$inferSelect[] = [];
  for (const t of teknisiNames) {
    const u = await createUser(t.email, "password123", t.name, "employee", {
      phone: t.phone,
      department: "Teknisi Lapangan",
      position: "Teknisi",
      salary: t.salary,
      rewardPoints: t.points,
    });
    if (u) {
      const full = await db.select().from(user).where(eq(user.id, u.id)).limit(1);
      if (full[0]) teknisi.push(full[0]);
    }
  }

  console.log("\n--- Company Settings ---");
  const existingSettings = await db
    .select()
    .from(companySetting)
    .where(eq(companySetting.id, "default"))
    .limit(1);

  if (existingSettings.length === 0) {
    await db.insert(companySetting).values({
      id: "default",
      name: "PT Mitra Solusindo",
      address: "Jl. TB Simatupang No. 88, Lt. 5, Jakarta Selatan, DKI Jakarta 12430",
      phone: "+622129529666",
      email: "info@mitrasolusindo.co.id",
      latitude: -6.2297,
      longitude: 106.8197,
      workingStart: "08:00",
      workingEnd: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      lateTolerance: 15,
      gpsRadius: 100,
      taskSalaryFreeze: true,
      deviceBinding: true,
      installationPoints: 100,
      maintenancePoints: 50,
      billingPoints: 20,
      repairPoints: 50,
      inspectionPoints: 30,
    });
    console.log("✓ Company settings created");
  } else {
    console.log("= Company settings already exist");
  }

  console.log("\n--- Reward Items (Catalog) ---");
  const existingItems = await db.select().from(rewardItem);
  if (existingItems.length === 0) {
    await db.insert(rewardItem).values([
      { id: crypto.randomUUID(), name: "Pulsa Rp 50.000", description: "Pulsa telepon Rp 50.000", pointsCost: 50, category: "pulsa", stock: 100, isActive: true },
      { id: crypto.randomUUID(), name: "Pulsa Rp 100.000", description: "Pulsa telepon Rp 100.000", pointsCost: 100, category: "pulsa", stock: 100, isActive: true },
      { id: crypto.randomUUID(), name: "Voucher Belanja Rp 100.000", description: "Voucher belanja Rp 100.000", pointsCost: 100, category: "voucher", stock: 50, isActive: true },
      { id: crypto.randomUUID(), name: "Voucher Belanja Rp 200.000", description: "Voucher belanja Rp 200.000", pointsCost: 200, category: "voucher", stock: 30, isActive: true },
      { id: crypto.randomUUID(), name: "Cash Tunai Rp 500.000", description: "Pencairan tunai ke rekening", pointsCost: 500, category: "cash", stock: 999, isActive: true },
      { id: crypto.randomUUID(), name: "Cash Tunai Rp 1.000.000", description: "Pencairan tunai ke rekening", pointsCost: 1000, category: "cash", stock: 999, isActive: true },
    ]);
    console.log("✓ 6 reward items created");
  } else {
    console.log(`= ${existingItems.length} reward items already exist`);
  }

  console.log("\n--- Tasks ---");
  const existingTasks = await db.select().from(task);
  if (existingTasks.length === 0 && admin && teknisi.length > 0) {
    const categories: ("installation" | "maintenance" | "billing" | "repair" | "inspection")[] = [
      "installation",
      "maintenance",
      "billing",
      "repair",
      "inspection",
    ];
    const priorities: ("low" | "medium" | "high" | "urgent")[] = ["low", "medium", "high", "urgent"];
    const statuses: ("pending" | "in_progress" | "completed" | "cancelled")[] = [
      "pending",
      "in_progress",
      "completed",
      "cancelled",
    ];
    const addresses = [
      "Jl. Sudirman No. 45, Jakarta Selatan",
      "Jl. Gatot Subroto No. 12, Jakarta Pusat",
      "Jl. Pemuda No. 88, Bekasi",
      "Jl. Asia Afrika No. 33, Bandung",
      "Jl. Ahmad Yani No. 42, Bogor",
      "Jl. Pahlawan No. 7, Surabaya",
      "Jl. Majapahit No. 56, Semarang",
      "Jl. Gajah Mada No. 18, Malang",
    ];

    const now = new Date();
    const tasksData = Array.from({ length: 20 }, (_, i) => {
      const assignedTeknisi = teknisi[i % teknisi.length];
      const status = statuses[i % statuses.length];
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - (i % 14));
      return {
        id: crypto.randomUUID(),
        title: `${categories[i % categories.length].toUpperCase()} #${i + 1}`,
        category: categories[i % categories.length],
        priority: priorities[i % priorities.length],
        status,
        customerName: `Pelanggan ${i + 1}`,
        customerPhone: `+62812345${String(i).padStart(4, "0")}`,
        address: addresses[i % addresses.length],
        addressDetail: `Detail alamat ${i + 1}`,
        latitude: -6.2297 + Math.random() * 0.1,
        longitude: 106.8197 + Math.random() * 0.1,
        description: `Tugas ${categories[i % categories.length]} untuk pelanggan ${i + 1}`,
        assignedTo: assignedTeknisi.id,
        assignedBy: admin.id,
        rewardPoints: [50, 75, 100, 30][i % 4],
        createdAt,
        updatedAt: createdAt,
        workingDate: formatDate(createdAt),
        estimatedDuration: 120,
      };
    });

    await db.insert(task).values(tasksData);
    console.log(`✓ ${tasksData.length} tasks created`);

    for (const t of tasksData.slice(0, 10)) {
      await db.insert(timelineEvent).values({
        id: crypto.randomUUID(),
        taskId: t.id,
        status: t.status,
        description: `Tugas ${t.status} - dibuat oleh Admin`,
        timestamp: t.createdAt,
        employeeId: t.assignedTo,
        employeeName: teknisi.find((tk) => tk.id === t.assignedTo)?.name || null,
      });
    }
  } else {
    console.log(`= ${existingTasks.length} tasks already exist`);
  }

  console.log("\n--- Attendance (last 7 days) ---");
  const existingAttendance = await db.select().from(attendance);
  if (existingAttendance.length === 0 && teknisi.length > 0) {
    const attendanceData = [];
    const today = new Date();

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = formatDate(date);

      for (let i = 0; i < teknisi.length; i++) {
        const emp = teknisi[i];
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const skipRate = isWeekend ? 0.5 : 0.1;
        if (Math.random() < skipRate) continue;

        const isLate = Math.random() < 0.2;
        const checkInHour = isLate ? 8 + Math.floor(Math.random() * 2) : 7 + Math.floor(Math.random() * 1);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMinute, 0, 0);

        const checkout = new Date(date);
        checkout.setHours(17, Math.floor(Math.random() * 30), 0, 0);

        const workingMinutes = Math.floor((checkout.getTime() - checkIn.getTime()) / 60000);
        const lateMinutes = isLate ? (checkInHour - 8) * 60 + checkInMinute : 0;

        attendanceData.push({
          id: crypto.randomUUID(),
          employeeId: emp.id,
          date: dateStr,
          checkIn,
          checkOut: checkout,
          status: isLate ? ("late" as const) : ("present" as const),
          workingDuration: workingMinutes,
          isLate,
          lateMinutes,
          checkInLocation: JSON.stringify({ latitude: -6.2297, longitude: 106.8197, address: "Kantor Pusat" }),
        });
      }
    }

    if (attendanceData.length > 0) {
      await db.insert(attendance).values(attendanceData);
      console.log(`✓ ${attendanceData.length} attendance records created`);
    }
  } else {
    console.log(`= ${existingAttendance.length} attendance records already exist`);
  }

  console.log("\n--- Rewards (Poin History) ---");
  const existingRewards = await db.select().from(reward);
  if (existingRewards.length === 0 && teknisi.length > 0) {
    const rewardsData = [];
    for (const emp of teknisi) {
      rewardsData.push({
        id: crypto.randomUUID(),
        employeeId: emp.id,
        points: 100,
        type: "earned" as const,
        description: "Bonus kehadiran bulanan",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
      rewardsData.push({
        id: crypto.randomUUID(),
        employeeId: emp.id,
        points: 50,
        type: "earned" as const,
        description: "Bonus penyelesaian tugas",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    }
    await db.insert(reward).values(rewardsData);
    console.log(`✓ ${rewardsData.length} reward entries created`);
  } else {
    console.log(`= ${existingRewards.length} reward entries already exist`);
  }

  console.log("\n--- Notifications ---");
  const existingNotifs = await db.select().from(notification);
  if (existingNotifs.length === 0 && teknisi.length > 0) {
    const notifData = teknisi.flatMap((emp) => [
      {
        id: crypto.randomUUID(),
        userId: emp.id,
        title: "Tugas Baru",
        message: "Anda mendapat tugas baru untuk dipasang",
        type: "task",
        link: "/employee/tasks",
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        userId: emp.id,
        title: "Selamat Datang",
        message: "Selamat bergabung di sistem absensi",
        type: "system",
        link: null,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);
    await db.insert(notification).values(notifData);
    console.log(`✓ ${notifData.length} notifications created`);
  } else {
    console.log(`= ${existingNotifs.length} notifications already exist`);
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Super Admin: superadmin@mitrasolusindo.co.id / password123");
  console.log("   Admin:      admin@mitrasolusindo.co.id / password123");
  console.log("   Teknisi:    budi.santoso@mitrasolusindo.co.id / password123");
  console.log("               dewi.anggraini@mitrasolusindo.co.id / password123");
  console.log("               eko.prasetyo@mitrasolusindo.co.id / password123");

  process.exit(0);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
