import "dotenv/config";
import { db } from "./db";
import { companySetting } from "./schema";

async function run() {
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
  console.log("✅ company_setting berhasil dibuat");
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
