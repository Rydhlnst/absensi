import "dotenv/config";
import { auth } from "./auth";
import { db } from "./db";
import { user } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  try {
    const superAdmin = await auth.api.signUpEmail({
      body: {
        email: "ahmad.pratama@mitrasolusindo.co.id",
        password: "password123",
        name: "Ahmad Rizky Pratama",
      },
    });
    if (superAdmin.user) {
      await db.update(user).set({ role: "super_admin" }).where(eq(user.id, superAdmin.user.id));
      console.log("Super Admin created:", superAdmin.user.email);
    }
  } catch (e: any) {
    console.log("Super Admin error:", e.message);
  }

  try {
    const admin = await auth.api.signUpEmail({
      body: {
        email: "siti.nurhaliza@mitrasolusindo.co.id",
        password: "password123",
        name: "Siti Nurhaliza",
      },
    });
    if (admin.user) {
      await db.update(user).set({ role: "admin" }).where(eq(user.id, admin.user.id));
      console.log("Admin created:", admin.user.email);
    }
  } catch (e: any) {
    console.log("Admin error:", e.message);
  }

  try {
    const employee = await auth.api.signUpEmail({
      body: {
        email: "budi.santoso@mitrasolusindo.co.id",
        password: "password123",
        name: "Budi Santoso",
      },
    });
    if (employee.user) {
      await db.update(user).set({ role: "user" }).where(eq(user.id, employee.user.id));
      console.log("Employee created:", employee.user.email);
    }
  } catch (e: any) {
    console.log("Employee error:", e.message);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed();
