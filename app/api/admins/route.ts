import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq, desc, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const where = role
      ? eq(user.role, role)
      : or(eq(user.role, "admin"), eq(user.role, "super_admin"));

    const admins = await db
      .select()
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt));

    return NextResponse.json(admins);
  } catch (error) {
    console.error("GET /api/admins error:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, department, position, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, dan nama wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    if (!result.user) {
      return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 });
    }

    const updated = await db
      .update(user)
      .set({
        role: role || "admin",
        department: department || "",
        position: position || "",
        phone: phone || "",
        updatedAt: new Date(),
      })
      .where(eq(user.id, result.user.id))
      .returning();

    return NextResponse.json(updated[0], { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admins error:", error);
    const err = error as { message?: string; code?: string };
    if (err?.message?.includes("already") || err?.code === "USER_EMAIL_EXISTS") {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json(
      { error: err?.message || "Gagal membuat admin" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Admin id is required" }, { status: 400 });
    }

    delete updates.password;

    updates.updatedAt = new Date();

    const updated = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT /api/admins error:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Admin id is required" }, { status: 400 });
    }

    const updated = await db
      .update(user)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin deactivated" });
  } catch (error) {
    console.error("DELETE /api/admins error:", error);
    return NextResponse.json({ error: "Failed to deactivate admin" }, { status: 500 });
  }
}
