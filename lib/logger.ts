import { db } from "./db"
import { systemLog } from "./schema"

export async function logSystem(params: {
  userId?: string | null
  userName?: string | null
  type: string
  detail?: string | null
  ipAddress?: string | null
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
    })
  } catch (e) {
    console.error("Failed to log system event:", e)
  }
}
