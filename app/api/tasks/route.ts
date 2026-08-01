import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { task, timelineEvent } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const conditions = [];
    if (assignedTo) conditions.push(eq(task.assignedTo, assignedTo));
    if (status) conditions.push(eq(task.status, status));
    if (category) conditions.push(eq(task.category, category));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const tasks = await db
      .select()
      .from(task)
      .where(where)
      .orderBy(desc(task.createdAt));

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    const newTask = await db
      .insert(task)
      .values({
        id,
        title: body.title,
        category: body.category,
        priority: body.priority,
        status: body.status || "pending",
        customerId: body.customerId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        address: body.address,
        addressDetail: body.addressDetail,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description,
        assignedTo: body.assignedTo,
        assignedBy: body.assignedBy,
        rewardPoints: body.rewardPoints || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        workingDate: body.workingDate,
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Task id is required" }, { status: 400 });
    }

    const updated = await db
      .update(task)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(task.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task id is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(task)
      .where(eq(task.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
