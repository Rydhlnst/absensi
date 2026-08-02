import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { systemLog, user } from "@/lib/schema";
import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");

    const conditions = [];
    if (userId) conditions.push(eq(systemLog.userId, userId));
    if (type) conditions.push(eq(systemLog.type, type));
    if (startDate) conditions.push(gte(systemLog.timestamp, new Date(startDate)));
    if (endDate) conditions.push(lte(systemLog.timestamp, new Date(endDate)));
    if (search) {
      conditions.push(
        or(
          like(systemLog.detail, `%${search}%`),
          like(systemLog.userName, `%${search}%`)
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select({
        id: systemLog.id,
        userId: systemLog.userId,
        userName: systemLog.userName,
        userImage: user.image,
        type: systemLog.type,
        detail: systemLog.detail,
        ipAddress: systemLog.ipAddress,
        timestamp: systemLog.timestamp,
      })
      .from(systemLog)
      .leftJoin(user, eq(systemLog.userId, user.id))
      .where(where)
      .orderBy(desc(systemLog.timestamp))
      .limit(limit);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/system-logs error:", error);
    return NextResponse.json({ error: "Failed to fetch system logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    const newLog = await db
      .insert(systemLog)
      .values({
        id,
        userId: body.userId || null,
        userName: body.userName || null,
        type: body.type,
        detail: body.detail || null,
        ipAddress: body.ipAddress || null,
        timestamp: new Date(),
      })
      .returning();

    return NextResponse.json(newLog[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/system-logs error:", error);
    return NextResponse.json({ error: "Failed to create system log" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const beforeDate = searchParams.get("beforeDate");

    if (beforeDate) {
      const deleted = await db
        .delete(systemLog)
        .where(lte(systemLog.timestamp, new Date(beforeDate)))
        .returning();
      return NextResponse.json({ deleted: deleted.length });
    }

    const deleted = await db.delete(systemLog).returning();
    return NextResponse.json({ deleted: deleted.length });
  } catch (error) {
    console.error("DELETE /api/system-logs error:", error);
    return NextResponse.json({ error: "Failed to delete system logs" }, { status: 500 });
  }
}
