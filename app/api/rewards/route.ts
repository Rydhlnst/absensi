import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reward, user } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const where = employeeId ? eq(reward.employeeId, employeeId) : undefined;

    const rewards = await db
      .select()
      .from(reward)
      .where(where)
      .orderBy(desc(reward.createdAt));

    return NextResponse.json(rewards);
  } catch {
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    const newReward = await db
      .insert(reward)
      .values({
        id,
        employeeId: body.employeeId,
        points: body.points,
        type: body.type,
        description: body.description,
        taskId: body.taskId,
        createdAt: new Date(),
      })
      .returning();

    // Update employee reward points (positive = add, negative = subtract)
    if (body.points !== 0) {
      await db
        .update(user)
        .set({
          rewardPoints: sql`${user.rewardPoints} + ${body.points}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, body.employeeId));
    }

    return NextResponse.json(newReward[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add reward" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, points, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Reward id is required" }, { status: 400 });
    }

    const updated = await db
      .update(reward)
      .set({ points, description })
      .where(eq(reward.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const currentReward = updated[0];
    const pointsDiff = points - currentReward.points;

    if (pointsDiff !== 0) {
      await db
        .update(user)
        .set({
          rewardPoints: sql`${user.rewardPoints} + ${pointsDiff}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, currentReward.employeeId!));
    }

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update reward" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Reward id is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(reward)
      .where(eq(reward.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    const target = existing[0];
    await db.delete(reward).where(eq(reward.id, id));

    if (target.points) {
      await db
        .update(user)
        .set({
          rewardPoints: sql`${user.rewardPoints} - ${target.points}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, target.employeeId!));
    }

    return NextResponse.json({ message: "Reward deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 });
  }
}
