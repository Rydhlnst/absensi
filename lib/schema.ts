import { pgTable, text, boolean, timestamp, integer, real } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  role: text("role").default("employee"),
  department: text("department").default(""),
  position: text("position").default(""),
  phone: text("phone").default(""),
  nik: text("nik").default(""),
  salary: integer("salary").default(0),
  hourlyRate: integer("hourlyRate").default(0),
  rewardPoints: integer("rewardPoints").default(0),
  status: text("status").default("active"),
  joinDate: timestamp("joinDate"),
  address: text("address"),
  bankName: text("bankName"),
  bankAccount: text("bankAccount"),
  deviceBinding: text("deviceBinding"),
  lastLocation: text("lastLocation"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const task = pgTable("task", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  customerId: text("customerId"),
  customerName: text("customerName"),
  customerPhone: text("customerPhone"),
  address: text("address"),
  addressDetail: text("addressDetail"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  description: text("description"),
  assignedTo: text("assignedTo").references(() => user.id),
  assignedBy: text("assignedBy").references(() => user.id),
  rewardPoints: integer("rewardPoints").default(0),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  workingDate: text("workingDate"),
  estimatedDuration: integer("estimatedDuration").default(120),
  attachments: text("attachments"),
  notes: text("notes"),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  employeeId: text("employeeId").references(() => user.id),
  date: text("date").notNull(),
  checkIn: timestamp("checkIn"),
  checkOut: timestamp("checkOut"),
  checkInLocation: text("checkInLocation"),
  checkOutLocation: text("checkOutLocation"),
  checkInPhoto: text("checkInPhoto"),
  checkOutPhoto: text("checkOutPhoto"),
  status: text("status").notNull(),
  workingDuration: integer("workingDuration").default(0),
  isLate: boolean("isLate").default(false),
  lateMinutes: integer("lateMinutes").default(0),
  notes: text("notes"),
});

export const reward = pgTable("reward", {
  id: text("id").primaryKey(),
  employeeId: text("employeeId").references(() => user.id),
  points: integer("points").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  taskId: text("taskId").references(() => task.id),
  createdAt: timestamp("createdAt"),
});

export const rewardItem = pgTable("reward_item", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("pointsCost").notNull(),
  category: text("category"),
  image: text("image"),
  stock: integer("stock").default(0),
  isActive: boolean("isActive").default(true),
});

export const salary = pgTable("salary", {
  id: text("id").primaryKey(),
  employeeId: text("employeeId").references(() => user.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  baseSalary: integer("baseSalary").notNull(),
  bonus: integer("bonus").default(0),
  deduction: integer("deduction").default(0),
  totalSalary: integer("totalSalary").notNull(),
  status: text("status").default("pending"),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt"),
  link: text("link"),
});

export const companySetting = pgTable("company_setting", {
  id: text("id").primaryKey(),
  name: text("name"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  workingStart: text("workingStart").default("08:00"),
  workingEnd: text("workingEnd").default("17:00"),
  breakStart: text("breakStart").default("12:00"),
  breakEnd: text("breakEnd").default("13:00"),
  lateTolerance: integer("lateTolerance").default(15),
  gpsRadius: integer("gpsRadius").default(100),
  taskSalaryFreeze: boolean("taskSalaryFreeze").default(true),
  deviceBinding: boolean("deviceBinding").default(true),
  installationPoints: integer("installationPoints").default(100),
  maintenancePoints: integer("maintenancePoints").default(50),
  billingPoints: integer("billingPoints").default(20),
  repairPoints: integer("repairPoints").default(50),
  inspectionPoints: integer("inspectionPoints").default(30),
})

export const officeBranch = pgTable("office_branch", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius").default(100),
  isMain: boolean("isMain").default(false),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const timelineEvent = pgTable("timeline_event", {
  id: text("id").primaryKey(),
  taskId: text("taskId").references(() => task.id),
  status: text("status").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp"),
  employeeId: text("employeeId").references(() => user.id),
  employeeName: text("employeeName"),
});

export const systemLog = pgTable("system_log", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id),
  userName: text("userName"),
  type: text("type"),
  detail: text("detail"),
  ipAddress: text("ipAddress"),
  timestamp: timestamp("timestamp"),
});

export const leave = pgTable("leave", {
  id: text("id").primaryKey(),
  employeeId: text("employeeId").references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  startDate: text("startDate").notNull(),
  endDate: text("endDate").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  approvedBy: text("approvedBy").references(() => user.id),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const device = pgTable("device", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  deviceId: text("deviceId").notNull(),
  deviceName: text("deviceName"),
  platform: text("platform"),
  boundAt: timestamp("boundAt").notNull(),
  isActive: boolean("isActive").default(true),
});
