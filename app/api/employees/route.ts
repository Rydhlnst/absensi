import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq, or, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const employees = await db
      .select()
      .from(user)
      .where(or(eq(user.role, "employee"), eq(user.role, "admin")))
      .orderBy(desc(user.createdAt));

    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee id is required" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const updated = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee id is required" }, { status: 400 });
    }

    const updated = await db
      .update(user)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deactivated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
