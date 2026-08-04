import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "npwp" text`);
    console.log("✅ Added npwp column to user table");
  } catch (e: unknown) {
    console.error("Migration failed:", e);
  }
  process.exit(0);
}

migrate();
