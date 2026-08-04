import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Converts all timezone-naive `timestamp` columns to `timestamptz`.
 *
 * Existing values were written by postgres-js as UTC wall-clock digits, so we
 * reinterpret them AT TIME ZONE 'UTC' to preserve the correct absolute instant.
 * After this, reads/writes round-trip correctly regardless of the server's
 * process timezone (was Asia/Jakarta, which caused a -7h read shift).
 */
const COLUMNS: Record<string, string[]> = {
  user: ["createdAt", "updatedAt", "joinDate"],
  session: ["expiresAt", "createdAt", "updatedAt"],
  account: ["accessTokenExpiresAt", "refreshTokenExpiresAt", "createdAt", "updatedAt"],
  verification: ["expiresAt", "createdAt", "updatedAt"],
  task: ["createdAt", "updatedAt", "startedAt", "completedAt"],
  attendance: ["checkIn", "checkOut"],
  reward: ["createdAt"],
  notification: ["createdAt"],
  office_branch: ["createdAt", "updatedAt"],
  timeline_event: ["timestamp"],
  system_log: ["timestamp"],
  leave: ["approvedAt", "createdAt", "updatedAt"],
  device: ["boundAt"],
};

async function migrate() {
  let ok = 0;
  let skipped = 0;
  for (const [table, cols] of Object.entries(COLUMNS)) {
    for (const col of cols) {
      // Only convert if still timestamp-without-tz (idempotent)
      const cur = await db.execute(sql`
        select data_type from information_schema.columns
        where table_schema = 'public' and table_name = ${table} and column_name = ${col}
      `);
      const dataType = (cur as unknown as { data_type: string }[])[0]?.data_type;
      if (!dataType) {
        console.log(`⚠️  ${table}.${col} not found, skipping`);
        continue;
      }
      if (dataType === "timestamp with time zone") {
        console.log(`↷ ${table}.${col} already timestamptz`);
        skipped++;
        continue;
      }
      await db.execute(
        sql.raw(
          `ALTER TABLE "${table}" ALTER COLUMN "${col}" TYPE timestamptz USING "${col}" AT TIME ZONE 'UTC'`
        )
      );
      console.log(`✅ ${table}.${col} -> timestamptz`);
      ok++;
    }
  }
  console.log(`\nDone. Converted: ${ok}, already-tz: ${skipped}`);
  process.exit(0);
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
