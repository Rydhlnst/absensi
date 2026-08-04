import { db } from "@/lib/db";
import { systemLog } from "@/lib/schema";

export async function logSystemEvent(params: {
  userId?: string;
  userName?: string;
  type: string;
  detail?: string;
  ipAddress?: string;
}) {
  try {
    await db.insert(systemLog).values({
      id: crypto.randomUUID(),
      userId: params.userId || null,
      userName: params.userName || null,
      type: params.type,
      detail: params.detail || null,
      ipAddress: params.ipAddress || null,
      timestamp: new Date(),
    });
  } catch {
    // System logging is best-effort, never block the main flow
  }
}
