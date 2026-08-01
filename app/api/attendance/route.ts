import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendance } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

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
      })
      .returning();

    return NextResponse.json(record[0], { status: 201 });
  } catch (error) {
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

    if (updates.checkOut) updates.checkOut = new Date(updates.checkOut);
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
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
