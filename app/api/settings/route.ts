import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companySetting } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const settings = await db
      .select()
      .from(companySetting)
      .where(eq(companySetting.id, "default"));

    if (settings.length === 0) {
      const newSettings = await db
        .insert(companySetting)
        .values({ id: "default" })
        .returning();

      return NextResponse.json(newSettings[0]);
    }

    return NextResponse.json(settings[0]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { ...body };
    delete updates.id;

    const existing = await db
      .select()
      .from(companySetting)
      .where(eq(companySetting.id, "default"));

    if (existing.length === 0) {
      const created = await db
        .insert(companySetting)
        .values({ id: "default", ...updates })
        .returning();

      return NextResponse.json(created[0]);
    }

    const updated = await db
      .update(companySetting)
      .set(updates)
      .where(eq(companySetting.id, "default"))
      .returning();

    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
