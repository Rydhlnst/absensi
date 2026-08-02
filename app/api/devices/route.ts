import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { device, user } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isActive = searchParams.get("isActive");

    const conditions = [];
    if (userId) conditions.push(eq(device.userId, userId));
    if (isActive !== null) conditions.push(eq(device.isActive, isActive === "true"));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const devices = await db
      .select({
        id: device.id,
        userId: device.userId,
        userName: user.name,
        userEmail: user.email,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        platform: device.platform,
        boundAt: device.boundAt,
        isActive: device.isActive,
      })
      .from(device)
      .leftJoin(user, eq(device.userId, user.id))
      .where(where)
      .orderBy(desc(device.boundAt));

    return NextResponse.json(devices);
  } catch (error) {
    console.error("GET /api/devices error:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, deviceId, deviceName, platform } = body;

    if (!userId || !deviceId) {
      return NextResponse.json(
        { error: "userId dan deviceId wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(device)
      .where(and(eq(device.userId, userId), eq(device.deviceId, deviceId)))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(device)
        .set({ isActive: true, boundAt: new Date() })
        .where(eq(device.id, existing[0].id))
        .returning();
      return NextResponse.json(updated[0]);
    }

    const id = crypto.randomUUID();
    const newDevice = await db
      .insert(device)
      .values({
        id,
        userId,
        deviceId,
        deviceName: deviceName || null,
        platform: platform || null,
        boundAt: new Date(),
        isActive: true,
      })
      .returning();

    return NextResponse.json(newDevice[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/devices error:", error);
    return NextResponse.json({ error: "Failed to bind device" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (userId) {
      const deleted = await db
        .update(device)
        .set({ isActive: false })
        .where(eq(device.userId, userId))
        .returning();
      return NextResponse.json({ reset: deleted.length });
    }

    if (!id) {
      return NextResponse.json({ error: "id atau userId wajib diisi" }, { status: 400 });
    }

    const deleted = await db
      .delete(device)
      .where(eq(device.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Device removed" });
  } catch (error) {
    console.error("DELETE /api/devices error:", error);
    return NextResponse.json({ error: "Failed to reset device" }, { status: 500 });
  }
}
