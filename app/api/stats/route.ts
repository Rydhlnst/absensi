import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, attendance, task } from "@/lib/schema";
import { eq, and, count, gte, sql } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const monthPrefix = today.slice(0, 7); // "2026-08"

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

    // Calculate real running salary for current month
    // Get all present/late attendance for this month with employee salary
    const monthAttendance = await db
      .select({
        employeeId: attendance.employeeId,
        workingDuration: attendance.workingDuration,
        isFrozen: attendance.isFrozen,
        frozenMinutes: attendance.frozenMinutes,
        salary: user.salary,
      })
      .from(attendance)
      .innerJoin(user, eq(attendance.employeeId, user.id))
      .where(
        and(
          gte(attendance.date, `${monthPrefix}-01`),
          sql`${attendance.date} <= ${today}`,
          sql`${attendance.status} IN ('present', 'late')`
        )
      );

    // Running salary = sum of (workingDuration / 60 / 8 / 22 * monthlySalary) per employee per day
    // If frozen, workingDuration is 0 (frozen minutes tracked separately)
    const monthlySalary = monthAttendance.reduce((total, record) => {
      const empSalary = record.salary || 0;
      if (empSalary <= 0) return total;
      // If frozen, use 0 duration (salary frozen)
      const duration = record.isFrozen ? 0 : (record.workingDuration || 0);
      // Daily rate = salary / 22 days, Hourly rate = daily / 8 hours, Per minute = hourly / 60
      const perMinuteRate = empSalary / 22 / 8 / 60;
      return total + Math.round(duration * perMinuteRate);
    }, 0);

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
