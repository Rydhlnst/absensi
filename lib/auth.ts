import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ].filter((v): v is string => Boolean(v))
  )
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins,
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
        type: ["employee", "admin", "super_admin"],
        required: false,
        defaultValue: "employee",
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
