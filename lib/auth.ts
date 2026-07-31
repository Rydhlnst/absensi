import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin", "super_admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
      department: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      position: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      nik: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
  plugins: [nextCookies()],
});
