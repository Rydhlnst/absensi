import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const where = role
      ? eq(user.role, role)
      : or(eq(user.role, "employee"), eq(user.role, "admin"));

    const employees = await db
      .select()
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt));

    return NextResponse.json(employees);
  } catch {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, department, position, phone, nik, hourlyRate, salary } = body;

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
      body: {
        email,
        password,
        name,
      },
    });

    if (!result.user) {
      return NextResponse.json(
        { error: "Gagal membuat akun" },
        { status: 500 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
      joinDate: new Date(),
    };
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (position !== undefined) updates.position = position;
    if (phone !== undefined) updates.phone = phone;
    if (nik !== undefined) updates.nik = nik;
    if (hourlyRate !== undefined) updates.hourlyRate = hourlyRate;
    if (salary !== undefined) updates.salary = salary;

    const updated = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, result.user.id))
      .returning();

    return NextResponse.json(updated[0], { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/employees error:", error);
    const err = error as { message?: string; code?: string };
    if (err?.message?.includes("already") || err?.code === "USER_EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Gagal membuat karyawan" },
      { status: 500 }
    );
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
  } catch {
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
  } catch {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
