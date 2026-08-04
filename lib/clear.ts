import "dotenv/config";
import { auth } from "./auth";
import { db } from "./db";
import {
  user,
  session,
  account,
  verification,
  task,
  attendance,
  reward,
  rewardItem,
  salary,
  notification,
  companySetting,
  officeBranch,
  timelineEvent,
  systemLog,
  leave,
  device,
} from "./schema";

async function clearAll() {
  console.log("🗑️  Menghapus semua data...\n");

  // Hapus dari tabel yang paling bergantung (child) dulu
  await db.delete(timelineEvent);
  console.log("✓ timeline_event dihapus");

  await db.delete(notification);
  console.log("✓ notification dihapus");

  await db.delete(reward);
  console.log("✓ reward dihapus");

  await db.delete(salary);
  console.log("✓ salary dihapus");

  await db.delete(device);
  console.log("✓ device dihapus");

  await db.delete(leave);
  console.log("✓ leave dihapus");

  await db.delete(attendance);
  console.log("✓ attendance dihapus");

  await db.delete(systemLog);
  console.log("✓ system_log dihapus");

  await db.delete(task);
  console.log("✓ task dihapus");

  await db.delete(rewardItem);
  console.log("✓ reward_item dihapus");

  await db.delete(companySetting);
  console.log("✓ company_setting dihapus");

  await db.delete(officeBranch);
  console.log("✓ office_branch dihapus");

  await db.delete(verification);
  console.log("✓ verification dihapus");

  // Session & account akan ikut terhapus karena cascade dari user
  await db.delete(session);
  console.log("✓ session dihapus");

  await db.delete(account);
  console.log("✓ account dihapus");

  await db.delete(user);
  console.log("✓ user dihapus");

  console.log("\n✅ Semua data berhasil dihapus.\n");

  // Buat 1 super_admin default untuk pertama kali login
  console.log("👤 Membuat akun Super Admin...");
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: "superadmin@mandarnet.co.id",
        password: "Mandar@2026",
        name: "Super Admin",
      },
    });
    if (result?.user) {
      await db
        .update(user)
        .set({ role: "super_admin", updatedAt: new Date() })
        .where(
          (await import("drizzle-orm")).eq(user.id, result.user.id)
        );
      console.log("✅ Super Admin berhasil dibuat:");
      console.log("   Email    : superadmin@mandarnet.co.id");
      console.log("   Password : Mandar@2026");
      console.log("\n⚠️  Segera ganti password setelah login pertama!\n");
    }
  } catch (e) {
    console.error("❌ Gagal buat super admin:", e);
  }

  // Buat company_setting default (kosong, bisa diisi via Pengaturan Sistem)
  await db.insert(companySetting).values({
    id: crypto.randomUUID(),
    name: null,
    workingStart: "08:00",
    workingEnd: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    lateTolerance: 15,
    gpsRadius: 100,
    deviceBinding: true,
    taskSalaryFreeze: true,
    installationPoints: 100,
    repairPoints: 50,
    billingPoints: 20,
    maintenancePoints: 50,
    inspectionPoints: 30,
  });
  console.log("✅ Company setting default dibuat.");
  console.log("\n🎉 Database siap digunakan dengan data bersih!");
}

clearAll()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
