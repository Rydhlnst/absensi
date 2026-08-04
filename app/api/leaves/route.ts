import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leave, user, notification } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");

    const conditions = [];
    if (employeeId) conditions.push(eq(leave.employeeId, employeeId));
    if (status) conditions.push(eq(leave.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const records = await db
      .select({
        id: leave.id,
        employeeId: leave.employeeId,
        employeeName: user.name,
        type: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        approvedBy: leave.approvedBy,
        approvedAt: leave.approvedAt,
        rejectionReason: leave.rejectionReason,
        createdAt: leave.createdAt,
        updatedAt: leave.updatedAt,
      })
      .from(leave)
      .leftJoin(user, eq(leave.employeeId, user.id))
      .where(where)
      .orderBy(desc(leave.createdAt));

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/leaves error:", error);
    return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date();

    const newLeave = await db
      .insert(leave)
      .values({
        id,
        employeeId: body.employeeId,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason || null,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newLeave[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/leaves error:", error);
    return NextResponse.json({ error: "Failed to create leave" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, rejectionReason } = body;

    if (!id) {
      return NextResponse.json({ error: "Leave id is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "approved") {
      updates.approvedBy = approvedBy;
      updates.approvedAt = new Date();
    }
    if (status === "rejected" && rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    const updated = await db
      .update(leave)
      .set(updates)
      .where(eq(leave.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // Notify employee on leave approval/rejection
    const leaveRecord = updated[0];
    if (status === "approved" || status === "rejected") {
      await db.insert(notification).values({
        id: crypto.randomUUID(),
        userId: leaveRecord.employeeId,
        title: status === "approved" ? "Cuti Disetujui" : "Cuti Ditolak",
        message: status === "approved"
          ? "Pengajuan cuti Anda telah disetujui."
          : `Pengajuan cuti Anda ditolak.${rejectionReason ? ` Alasan: ${rejectionReason}` : ""}`,
        type: "attendance",
        isRead: false,
        createdAt: new Date(),
        link: "/employee/attendance",
      });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT /api/leaves error:", error);
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Leave id is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(leave)
      .where(eq(leave.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Leave deleted" });
  } catch (error) {
    console.error("DELETE /api/leaves error:", error);
    return NextResponse.json({ error: "Failed to delete leave" }, { status: 500 });
  }
}
