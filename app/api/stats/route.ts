import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, attendance, task } from "@/lib/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const totalEmployeesResult = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.role, "employee"));

    const totalAdminsResult = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.role, "admin"));

    const totalSuperAdminsResult = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.role, "super_admin"));

    const presentTodayResult = await db
      .select({ value: count() })
      .from(attendance)
      .where(
        and(
          eq(attendance.date, today),
          eq(attendance.status, "present")
        )
      );

    const lateTodayResult = await db
      .select({ value: count() })
      .from(attendance)
      .where(
        and(
          eq(attendance.date, today),
          eq(attendance.status, "late")
        )
      );

    const totalEmployees = totalEmployeesResult[0]?.value ?? 0;
    const totalAdmins = totalAdminsResult[0]?.value ?? 0;
    const totalUsers = totalEmployees + totalAdmins + (totalSuperAdminsResult[0]?.value ?? 0);
    const presentToday = (presentTodayResult[0]?.value ?? 0) + (lateTodayResult[0]?.value ?? 0);
    const absentToday = totalEmployees - presentToday;
    const onlineEmployees = presentToday;

    const pendingTasksResult = await db
      .select({ value: count() })
      .from(task)
      .where(eq(task.status, "pending"));

    const inProgressTasksResult = await db
      .select({ value: count() })
      .from(task)
      .where(eq(task.status, "in_progress"));

    const completedTasksResult = await db
      .select({ value: count() })
      .from(task)
      .where(eq(task.status, "completed"));

    const totalTasksResult = await db
      .select({ value: count() })
      .from(task);

    const pendingTasks = (pendingTasksResult[0]?.value ?? 0) + (inProgressTasksResult[0]?.value ?? 0);
    const completedTasks = completedTasksResult[0]?.value ?? 0;
    const totalTasks = totalTasksResult[0]?.value ?? 0;
    const monthlySalary = presentToday * 200000;

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalEmployees,
      presentToday,
      absentToday,
      onlineEmployees,
      pendingTasks,
      completedTasks,
      totalTasks,
      monthlySalary,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
