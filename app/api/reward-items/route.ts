import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rewardItem } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const category = searchParams.get("category");

    const conditions = [];
    if (isActive !== null) conditions.push(eq(rewardItem.isActive, isActive === "true"));
    if (category) conditions.push(eq(rewardItem.category, category));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select()
      .from(rewardItem)
      .where(where)
      .orderBy(desc(rewardItem.pointsCost));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/reward-items error:", error);
    return NextResponse.json({ error: "Failed to fetch reward items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    const newItem = await db
      .insert(rewardItem)
      .values({
        id,
        name: body.name,
        description: body.description || null,
        pointsCost: body.pointsCost,
        category: body.category || null,
        image: body.image || null,
        stock: body.stock || 0,
        isActive: body.isActive ?? true,
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/reward-items error:", error);
    return NextResponse.json({ error: "Failed to create reward item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Reward item id is required" }, { status: 400 });
    }

    const updated = await db
      .update(rewardItem)
      .set(updates)
      .where(eq(rewardItem.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Reward item not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT /api/reward-items error:", error);
    return NextResponse.json({ error: "Failed to update reward item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Reward item id is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(rewardItem)
      .where(eq(rewardItem.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Reward item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reward item deleted" });
  } catch (error) {
    console.error("DELETE /api/reward-items error:", error);
    return NextResponse.json({ error: "Failed to delete reward item" }, { status: 500 });
  }
}
