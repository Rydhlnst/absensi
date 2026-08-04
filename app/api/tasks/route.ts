import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { task, reward, user, timelineEvent, notification } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";

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
  } catch {
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

    // Create initial timeline event
    if (newTask[0]) {
      await db.insert(timelineEvent).values({
        id: crypto.randomUUID(),
        taskId: newTask[0].id,
        status: "pending",
        description: "Tugas dibuat",
        timestamp: new Date(),
        employeeId: body.assignedTo || null,
        employeeName: null,
      });
    }

    // Notify assigned employee
    if (newTask[0] && body.assignedTo) {
      await db.insert(notification).values({
        id: crypto.randomUUID(),
        userId: body.assignedTo,
        title: "Tugas Baru",
        message: `Anda mendapat tugas baru: ${body.title}`,
        type: "task",
        isRead: false,
        createdAt: new Date(),
        link: "/employee/tasks",
      });
    }

    return NextResponse.json(newTask[0], { status: 201 });
  } catch {
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

    const existing = await db.select().from(task).where(eq(task.id, id)).limit(1);
    const wasCompleted = existing[0]?.status === "completed";

    const updated = await db
      .update(task)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(task.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = updated[0];

    // Create timeline event when status changes
    if (existing.length > 0 && updates.status && updates.status !== existing[0].status) {
      const statusLabels: Record<string, string> = {
        pending: "Menunggu",
        in_progress: "Dikerjakan",
        completed: "Selesai",
        cancelled: "Dibatalkan",
        on_hold: "Ditunda",
      };
      await db.insert(timelineEvent).values({
        id: crypto.randomUUID(),
        taskId: updatedTask.id,
        status: updatedTask.status,
        description: `Status diubah ke "${statusLabels[updatedTask.status] || updatedTask.status}"`,
        timestamp: new Date(),
        employeeId: updatedTask.assignedTo || null,
        employeeName: null,
      });
    }

    if (!wasCompleted && updatedTask.status === "completed" && updatedTask.assignedTo && updatedTask.rewardPoints && updatedTask.rewardPoints > 0) {
      await db.insert(reward).values({
        id: crypto.randomUUID(),
        employeeId: updatedTask.assignedTo,
        taskId: updatedTask.id,
        points: updatedTask.rewardPoints,
        type: "task_completion",
        description: `Menyelesaikan tugas: ${updatedTask.title}`,
        createdAt: new Date(),
      });
      await db.update(user).set({
        rewardPoints: sql`${user.rewardPoints} + ${updatedTask.rewardPoints}`,
        updatedAt: new Date(),
      }).where(eq(user.id, updatedTask.assignedTo));

      // Notify reward earned
      await db.insert(notification).values({
        id: crypto.randomUUID(),
        userId: updatedTask.assignedTo,
        title: "Poin Reward Diperoleh!",
        message: `Anda mendapat ${updatedTask.rewardPoints} poin dari tugas: ${updatedTask.title}`,
        type: "reward",
        isRead: false,
        createdAt: new Date(),
        link: "/employee/rewards",
      });
    }

    return NextResponse.json(updatedTask);
  } catch {
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
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
