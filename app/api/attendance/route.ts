import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendance, task, companySetting, officeBranch } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { checkBranchProximity } from "@/lib/geo";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const conditions = [];
    if (employeeId) conditions.push(eq(attendance.employeeId, employeeId));
    if (date) conditions.push(eq(attendance.date, date));
    if (status) conditions.push(eq(attendance.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const records = await db
      .select()
      .from(attendance)
      .where(where)
      .orderBy(desc(attendance.checkIn));

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    // Check Task Salary Freeze conditions
    let isFrozen = false;
    let frozenMinutes = 0;

    // Server-side late detection
    let isLate = body.isLate || false;
    let lateMinutes = body.lateMinutes || 0;

    try {
      const settings = await db.select().from(companySetting).limit(1);
      const freezeEnabled = settings[0]?.taskSalaryFreeze;

      // Calculate late status server-side
      if (settings[0]?.workingStart && body.checkIn) {
        const workStart = settings[0].workingStart;
        const tolerance = settings[0].lateTolerance || 0;
        const [startHour, startMin] = workStart.split(":").map(Number);
        const checkInDate = new Date(body.checkIn);
        const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
        const workStartMinutes = startHour * 60 + startMin;
        if (checkInMinutes > workStartMinutes + tolerance) {
          isLate = true;
          lateMinutes = checkInMinutes - workStartMinutes;
        }
      }

      if (freezeEnabled) {
        // Check if employee has pending/in-progress tasks
        const pendingTasks = await db
          .select()
          .from(task)
          .where(
            and(
              eq(task.assignedTo, body.employeeId),
              eq(task.status, "pending")
            )
          );

        const inProgressTasks = await db
          .select()
          .from(task)
          .where(
            and(
              eq(task.assignedTo, body.employeeId),
              eq(task.status, "in_progress")
            )
          );

        const hasActiveTasks = pendingTasks.length > 0 || inProgressTasks.length > 0;

        if (hasActiveTasks && body.checkInLocation) {
          // Check if employee is inside office geofence
          try {
            const location = JSON.parse(body.checkInLocation);
            if (location.latitude && location.longitude) {
              const branches = await db.select().from(officeBranch);
              const branchCheck = checkBranchProximity(
                location.latitude,
                location.longitude,
                branches.map((b) => ({
                  name: b.name,
                  latitude: b.latitude,
                  longitude: b.longitude,
                  radius: b.radius || 100,
                  isActive: b.isActive ?? true,
                }))
              );

              if (branchCheck.isWithinRadius) {
                isFrozen = true;
                // frozenMinutes will be set at check-out
                frozenMinutes = 0;
              }
            }
          } catch {
            // Invalid location JSON, skip freeze
          }
        }
      }
    } catch {
      // Settings fetch failed, skip freeze
    }

    const record = await db
      .insert(attendance)
      .values({
        id,
        employeeId: body.employeeId,
        date: body.date,
        checkIn: body.checkIn ? new Date(body.checkIn) : new Date(),
        checkInLocation: body.checkInLocation,
        checkInPhoto: body.checkInPhoto,
        status: body.status || "present",
        isLate: body.isLate || false,
        lateMinutes: body.lateMinutes || 0,
        notes: body.notes,
        isFrozen,
        frozenMinutes,
      })
      .returning();

    return NextResponse.json(record[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Attendance id is required" }, { status: 400 });
    }

    if (updates.checkOut) {
      updates.checkOut = new Date(updates.checkOut);
      const existing = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
      if (existing[0]?.checkIn) {
        const checkInMs = new Date(existing[0].checkIn).getTime();
        const checkOutMs = (updates.checkOut as Date).getTime();
        let workingDuration = Math.round((checkOutMs - checkInMs) / 60000);

        // If frozen, set workingDuration to 0
        if (existing[0].isFrozen) {
          updates.frozenMinutes = workingDuration;
          workingDuration = 0;
        }

        updates.workingDuration = workingDuration;
      }
    }
    if (updates.checkIn) updates.checkIn = new Date(updates.checkIn);

    const updated = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Attendance id is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(attendance)
      .where(eq(attendance.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Attendance deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
