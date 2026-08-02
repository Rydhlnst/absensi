import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salary, user } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const conditions = [];
    if (employeeId) conditions.push(eq(salary.employeeId, employeeId));
    if (month) conditions.push(eq(salary.month, parseInt(month)));
    if (year) conditions.push(eq(salary.year, parseInt(year)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const records = await db
      .select({
        id: salary.id,
        employeeId: salary.employeeId,
        employeeName: user.name,
        department: user.department,
        position: user.position,
        month: salary.month,
        year: salary.year,
        baseSalary: salary.baseSalary,
        bonus: salary.bonus,
        deduction: salary.deduction,
        totalSalary: salary.totalSalary,
        status: salary.status,
      })
      .from(salary)
      .leftJoin(user, eq(salary.employeeId, user.id))
      .where(where)
      .orderBy(desc(salary.year), desc(salary.month));

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/salaries error:", error);
    return NextResponse.json({ error: "Failed to fetch salaries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();

    const baseSalary = body.baseSalary || 0;
    const bonus = body.bonus || 0;
    const deduction = body.deduction || 0;
    const totalSalary = body.totalSalary ?? baseSalary + bonus - deduction;

    const newSalary = await db
      .insert(salary)
      .values({
        id,
        employeeId: body.employeeId,
        month: body.month,
        year: body.year,
        baseSalary,
        bonus,
        deduction,
        totalSalary,
        status: body.status || "pending",
      })
      .returning();

    return NextResponse.json(newSalary[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/salaries error:", error);
    return NextResponse.json({ error: "Failed to create salary" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Salary id is required" }, { status: 400 });
    }

    if (updates.baseSalary !== undefined || updates.bonus !== undefined || updates.deduction !== undefined) {
      const existing = await db.select().from(salary).where(eq(salary.id, id)).limit(1);
      if (existing.length > 0) {
        const cur = existing[0];
        const baseSalary = updates.baseSalary ?? cur.baseSalary;
        const bonus = updates.bonus ?? cur.bonus;
        const deduction = updates.deduction ?? cur.deduction;
        updates.totalSalary = baseSalary + bonus - deduction;
      }
    }

    const updated = await db
      .update(salary)
      .set(updates)
      .where(eq(salary.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Salary not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT /api/salaries error:", error);
    return NextResponse.json({ error: "Failed to update salary" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Salary id is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(salary)
      .where(eq(salary.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Salary not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Salary deleted" });
  } catch (error) {
    console.error("DELETE /api/salaries error:", error);
    return NextResponse.json({ error: "Failed to delete salary" }, { status: 500 });
  }
}
