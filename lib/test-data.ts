import "dotenv/config";
import { auth } from "./auth";
import { db } from "./db";
import { user, officeBranch, task } from "./schema";
import { eq } from "drizzle-orm";

async function createTestData() {
  console.log("🧪 Membuat data testing...\n");

  // 1. Buat Admin
  console.log("--- Membuat Admin ---");
  const adminResult = await auth.api.signUpEmail({
    body: { email: "admin@mandarnet.co.id", password: "Mandar@2026", name: "Admin Mandar" },
  }).catch(() => null);
  if (adminResult?.user) {
    await db.update(user).set({
      role: "admin", department: "Operasional", position: "Admin", phone: "08123456789", updatedAt: new Date()
    }).where(eq(user.id, adminResult.user.id));
    console.log("✅ Admin: admin@mandarnet.co.id");
  }

  // 2. Buat Employee/Teknisi
  console.log("\n--- Membuat Teknisi ---");
  const empResult = await auth.api.signUpEmail({
    body: { email: "teknisi1@mandarnet.co.id", password: "Mandar@2026", name: "Budi Teknisi" },
  }).catch(() => null);
  let empId = "";
  if (empResult?.user) {
    empId = empResult.user.id;
    await db.update(user).set({
      role: "employee",
      department: "Teknisi Lapangan",
      position: "Teknisi WiFi",
      phone: "08198765432",
      salary: 3000000,
      hourlyRate: 18750,
      updatedAt: new Date()
    }).where(eq(user.id, empId));
    console.log("✅ Teknisi: teknisi1@mandarnet.co.id (gaji: Rp3.000.000)");
  }

  // 3. Buat Office Branch (Kantor Utama)
  console.log("\n--- Membuat Kantor Cabang ---");
  const branchId = crypto.randomUUID();
  await db.insert(officeBranch).values({
    id: branchId,
    name: "Kantor Utama Mandar.Net",
    address: "Jl. Budi Utomo No. 1, Polewali Mandar",
    latitude: -3.4139,
    longitude: 119.3481,
    radius: 200,
    isMain: true,
    isActive: true,
  });
  console.log("✅ Kantor Utama (lat: -3.4139, lng: 119.3481, radius: 200m)");

  // 4. Buat Tasks untuk teknisi
  if (empId) {
    console.log("\n--- Membuat Tugas ---");
    const tasks = [
      {
        id: crypto.randomUUID(),
        title: "Pasang WiFi Baru",
        category: "installation",
        priority: "high",
        status: "pending",
        customerName: "Pak Ahmad",
        customerPhone: "08111222333",
        address: "Jl. Sudirman No. 45",
        addressDetail: "Rumah Cat Kuning",
        description: "Pemasangan baru indihome 20mbps",
        assignedTo: empId,
        rewardPoints: 100,
        workingDate: new Date().toISOString().split("T")[0],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Gangguan Internet",
        category: "repair",
        priority: "urgent",
        status: "pending",
        customerName: "Bu Sari",
        customerPhone: "08222333444",
        address: "Jl. Merdeka No. 12",
        addressDetail: "Depan Masjid",
        description: "Internet pelanggan mati sejak kemarin",
        assignedTo: empId,
        rewardPoints: 50,
        workingDate: new Date().toISOString().split("T")[0],
        createdAt: new Date(), updatedAt: new Date(),
      },
    ];
    for (const t of tasks) {
      await db.insert(task).values(t);
      console.log(`✅ Task [${t.category}]: ${t.title} → ${t.customerName}`);
    }
  }

  console.log("\n🎉 Data testing berhasil dibuat!");
  console.log("\n=== Akun Testing ===");
  console.log("Super Admin : superadmin@mandarnet.co.id / Mandar@2026");
  console.log("Admin       : admin@mandarnet.co.id / Mandar@2026");
  console.log("Teknisi     : teknisi1@mandarnet.co.id / Mandar@2026");
}

createTestData()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
