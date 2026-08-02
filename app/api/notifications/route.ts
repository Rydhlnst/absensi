import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notification } from "@/lib/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const conditions = [];
    if (userId) conditions.push(eq(notification.userId, userId));
    if (unreadOnly) conditions.push(eq(notification.isRead, false));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const records = await db
      .select()
      .from(notification)
      .where(where)
      .orderBy(desc(notification.createdAt))
      .limit(100);

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, title, message, type, link } = body;
    const now = new Date();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array wajib diisi" },
        { status: 400 }
      );
    }

    const values = userIds.map((uid: string) => ({
      id: crypto.randomUUID(),
      userId: uid,
      title,
      message: message || null,
      type: type || "system",
      link: link || null,
      isRead: false,
      createdAt: now,
    }));

    const created = await db.insert(notification).values(values).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ids, isRead, userId, markAllRead } = body;

    if (markAllRead && userId) {
      const updated = await db
        .update(notification)
        .set({ isRead: true })
        .where(and(eq(notification.userId, userId), eq(notification.isRead, false)))
        .returning();

      return NextResponse.json({ marked: updated.length });
    }

    if (ids && Array.isArray(ids)) {
      const updated = await db
        .update(notification)
        .set({ isRead: true })
        .where(inArray(notification.id, ids))
        .returning();

      return NextResponse.json(updated);
    }

    if (id) {
      const updated = await db
        .update(notification)
        .set({ isRead: isRead ?? true })
        .where(eq(notification.id, id))
        .returning();

      if (updated.length === 0) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      return NextResponse.json(updated[0]);
    }

    return NextResponse.json({ error: "id atau ids wajib diisi" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (userId) {
      const deleted = await db
        .delete(notification)
        .where(eq(notification.userId, userId))
        .returning();
      return NextResponse.json({ deleted: deleted.length });
    }

    if (!id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }

    const deleted = await db
      .delete(notification)
      .where(eq(notification.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("DELETE /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
