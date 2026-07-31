"use client"

import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Users,
  Shield,
  UserCheck,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Settings,
  ClipboardList,
  Activity,
  LogIn,
  LogOut,
  CheckSquare,
  Clock,
  Bell,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { employees, attendance, tasks, notifications } from "@/data/mock"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Baru saja"
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  return `${diffDays} hari yang lalu`
}

const COLORS = {
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
}

const statConfig = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    change: "+3%",
    up: true,
  },
  {
    key: "totalAdmins",
    label: "Total Admin",
    icon: Shield,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    change: "+1",
    up: true,
  },
  {
    key: "totalEmployees",
    label: "Total Karyawan",
    icon: UserCheck,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    change: "+2%",
    up: true,
  },
  {
    key: "systemHealth",
    label: "System Health",
    icon: HeartPulse,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    change: "98.5%",
    up: true,
  },
]

export default function SuperAdminDashboardPage() {
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")

  const totalAdmins = employees.filter((e) => e.role === "admin").length
  const totalEmployees = employees.filter((e) => e.role === "employee").length
  const totalUsers = employees.length
  const activeEmployees = employees.filter((e) => e.status === "active")

  const stats = {
    totalUsers,
    totalAdmins,
    totalEmployees,
    systemHealth: 98.5,
  }

  const activityChartData = (() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = format(d, "yyyy-MM-dd")
      const dayAttendance = attendance.filter((a) => a.date === dateStr)
      const present = dayAttendance.filter(
        (a) => a.status === "present" || a.status === "late"
      ).length
      const absent = dayAttendance.filter((a) => a.status === "absent").length
      const tasksCreated = tasks.filter(
        (t) => format(new Date(t.createdAt), "yyyy-MM-dd") === dateStr
      ).length
      days.push({
        day: format(d, "EEE", { locale: id }),
        aktivitas: present + tasksCreated,
        tidak_aktif: absent,
      })
    }
    return days
  })()

  const userActivityData = (() => {
    const data = []
    for (let i = 23; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = format(d, "yyyy-MM-dd")
      const dayAtt = attendance.filter((a) => a.date === dateStr)
      const logins = dayAtt.filter((a) => a.checkIn !== null).length
      data.push({
        jam: format(d, "dd/MM"),
        login: logins,
      })
    }
    return data
  })()

  const recentActivities = notifications
    .slice(0, 10)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            {format(now, "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/super-admin/admins">
            <Button>
              <Shield className="size-4" />
              Kelola Admin
            </Button>
          </Link>
          <Link href="/super-admin/settings">
            <Button variant="outline">
              <Settings className="size-4" />
              Pengaturan
            </Button>
          </Link>
          <Link href="/super-admin/logs">
            <Button variant="outline">
              <ClipboardList className="size-4" />
              Lihat Logs
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statConfig.map((stat, index) => {
          const Icon = stat.icon
          const value = stats[stat.key as keyof typeof stats]
          return (
            <div key={stat.key}>
              <Card className="h-full">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        stat.up ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.up ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">
                      {typeof value === "number"
                        ? value >= 100
                          ? value.toLocaleString("id-ID")
                          : `${value}%`
                        : value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Sistem (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="opacity-30"
                  />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="aktivitas"
                    name="Aktivitas"
                    fill={COLORS.blue}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="tidak_aktif"
                    name="Tidak Aktif"
                    fill={COLORS.red}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity (30 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userActivityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="opacity-30"
                  />
                  <XAxis
                    dataKey="jam"
                    fontSize={12}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="login"
                    name="Login"
                    stroke={COLORS.green}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const iconMap: Record<string, typeof Bell> = {
                  task: CheckSquare,
                  attendance: Clock,
                  reward: Activity,
                  system: Bell,
                  warning: Clock,
                }
                const colorMap: Record<string, string> = {
                  task: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                  attendance:
                    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                  reward:
                    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                  system:
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                  warning:
                    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                }
                const Icon = iconMap[activity.type] || Bell
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${colorMap[activity.type]}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {activity.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {getRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/super-admin/admins" className="block">
              <div className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Shield className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Kelola Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Tambah, edit, hapus admin
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/super-admin/settings" className="block">
              <div className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Settings className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pengaturan Sistem</p>
                  <p className="text-xs text-muted-foreground">
                    Konfigurasi perusahaan
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/super-admin/logs" className="block">
              <div className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <ClipboardList className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">System Logs</p>
                  <p className="text-xs text-muted-foreground">
                    Lihat log aktivitas sistem
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/super-admin/roles" className="block">
              <div className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Manajemen Role</p>
                  <p className="text-xs text-muted-foreground">
                    Kelola role & hak akses
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
