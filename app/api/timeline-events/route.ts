import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { timelineEvent, user } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const employeeId = searchParams.get("employeeId");

    const conditions = [];
    if (taskId) conditions.push(eq(timelineEvent.taskId, taskId));
    if (employeeId) conditions.push(eq(timelineEvent.employeeId, employeeId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const events = await db
      .select({
        id: timelineEvent.id,
        taskId: timelineEvent.taskId,
        status: timelineEvent.status,
        description: timelineEvent.description,
        timestamp: timelineEvent.timestamp,
        employeeId: timelineEvent.employeeId,
        employeeName: timelineEvent.employeeName,
        employeeImage: user.image,
      })
      .from(timelineEvent)
      .leftJoin(user, eq(timelineEvent.employeeId, user.id))
      .where(where)
      .orderBy(desc(timelineEvent.timestamp));

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/timeline-events error:", error);
    return NextResponse.json({ error: "Failed to fetch timeline events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    const newEvent = await db
      .insert(timelineEvent)
      .values({
        id,
        taskId: body.taskId,
        status: body.status,
        description: body.description || null,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        employeeId: body.employeeId || null,
        employeeName: body.employeeName || null,
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/timeline-events error:", error);
    return NextResponse.json({ error: "Failed to create timeline event" }, { status: 500 });
  }
}
