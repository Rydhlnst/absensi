import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { officeBranch } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const branches = await db
      .select()
      .from(officeBranch)
      .orderBy(desc(officeBranch.isMain), desc(officeBranch.createdAt));

    return NextResponse.json(branches);
  } catch {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date();

    const newBranch = await db
      .insert(officeBranch)
      .values({
        id,
        name: body.name,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        radius: body.radius || 100,
        isMain: body.isMain || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newBranch[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Branch id is required" }, { status: 400 });
    }

    const updated = await db
      .update(officeBranch)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(officeBranch.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Branch id is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(officeBranch)
      .where(eq(officeBranch.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Branch deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
