"use client"

import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  Clock,
  CheckCircle,
  Wifi,
  Wallet,
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  BarChart3,
  Trophy,
  AlertTriangle,
  Bell,
  CheckSquare,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { employees, tasks, attendance, notifications } from "@/data/mock"

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  return `Rp ${amount.toLocaleString("id-ID")}`
}

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

const PIE_COLORS = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple, COLORS.red]

const statConfig = [
  {
    key: "totalEmployees",
    label: "Total Karyawan",
    icon: Users,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    change: "+2%",
    up: true,
  },
  {
    key: "presentToday",
    label: "Hadir Hari Ini",
    icon: UserCheck,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    change: "+5%",
    up: true,
  },
  {
    key: "absentToday",
    label: "Tidak Hadir",
    icon: UserX,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    change: "-3%",
    up: false,
  },
  {
    key: "tasksToday",
    label: "Tugas Hari Ini",
    icon: ClipboardList,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    change: "+8%",
    up: true,
  },
  {
    key: "pendingTasks",
    label: "Tugas Tertunda",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    change: "-12%",
    up: false,
  },
  {
    key: "completedTasks",
    label: "Tugas Selesai",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    change: "+15%",
    up: true,
  },
  {
    key: "onlineEmployees",
    label: "Karyawan Online",
    icon: Wifi,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    change: "+4%",
    up: true,
  },
  {
    key: "monthlySalary",
    label: "Gaji Bulanan",
    icon: Wallet,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    change: "+2%",
    up: true,
  },
]

const rewardCategories = [
  { name: "Instalasi", value: 12 },
  { name: "Maintenance", value: 8 },
  { name: "Perbaikan", value: 10 },
  { name: "Inspeksi", value: 6 },
  { name: "Bonus", value: 4 },
]

export default function AdminDashboardPage() {
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")

  const activeEmployees = employees.filter((e) => e.status === "active")
  const todayAttendance = attendance.filter((a) => a.date === todayStr)
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length
  const absentToday = todayAttendance.filter(
    (a) => a.status === "absent"
  ).length
  const tasksToday = tasks.filter((t) => t.workingDate === todayStr).length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const monthlySalary = activeEmployees.reduce((sum, e) => sum + e.salary, 0)

  const stats = {
    totalEmployees: activeEmployees.length,
    presentToday,
    absentToday,
    tasksToday,
    pendingTasks,
    completedTasks,
    onlineEmployees: Math.floor(presentToday * 0.85),
    monthlySalary,
  }

  const attendanceChartData = (() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = format(d, "yyyy-MM-dd")
      const dayAttendance = attendance.filter((a) => a.date === dateStr)
      const present = dayAttendance.filter((a) => a.status === "present").length
      const late = dayAttendance.filter((a) => a.status === "late").length
      const absent = dayAttendance.filter((a) => a.status === "absent").length
      days.push({
        day: format(d, "EEE", { locale: id }),
        hadir: present,
        terlambat: late,
        tidak_hadir: absent,
      })
    }
    return days
  })()

  const taskCompletionData = (() => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = format(d, "yyyy-MM-dd")
      const completed = tasks.filter(
        (t) => t.completedAt && format(new Date(t.completedAt), "yyyy-MM-dd") === dateStr
      ).length
      const created = tasks.filter(
        (t) => format(new Date(t.createdAt), "yyyy-MM-dd") === dateStr
      ).length
      days.push({
        date: format(d, "dd/MM"),
        selesai: completed,
        dibuat: created,
      })
    }
    return days
  })()

  const topEmployees = (() => {
    const empStats = employees
      .filter((e) => e.status === "active")
      .map((emp) => {
        const empCompletedTasks = tasks.filter(
          (t) => t.assignedTo === emp.id && t.status === "completed"
        )
        const avgDuration =
          empCompletedTasks.length > 0
            ? Math.round(
                empCompletedTasks.reduce((sum, t) => {
                  if (t.completedAt && t.startedAt) {
                    return sum + (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) / 60000
                  }
                  return sum + t.estimatedDuration
                }, 0) / empCompletedTasks.length
              )
            : 0
        const rating = Math.min(5, 3 + empCompletedTasks.length * 0.3)
        return {
          ...emp,
          tasksCompleted: empCompletedTasks.length,
          avgDuration,
          rating: Math.round(rating * 10) / 10,
        }
      })
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, 5)
    return empStats
  })()

  const recentActivities = notifications
    .slice(0, 8)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            {format(now, "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/tasks/create">
            <Button>
              <Plus className="size-4" />
              Buat Tugas
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline">
              <BarChart3 className="size-4" />
              Lihat Laporan
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
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
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
                      {stat.key === "monthlySalary"
                        ? formatCurrency(value as number)
                        : (value as number).toLocaleString("id-ID")}
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
            <CardTitle>Kehadiran 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="hadir"
                    name="Hadir"
                    fill={COLORS.green}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="terlambat"
                    name="Terlambat"
                    fill={COLORS.yellow}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="tidak_hadir"
                    name="Tidak Hadir"
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
            <CardTitle>Tren Penyelesaian Tugas (30 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} interval={4} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="selesai"
                    name="Selesai"
                    stroke={COLORS.green}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="dibuat"
                    name="Dibuat"
                    stroke={COLORS.blue}
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
            <CardTitle>Produktivitas Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead className="text-center">Tugas Selesai</TableHead>
                  <TableHead className="text-center">Rata-rata Durasi</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEmployees.map((emp, index) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div
                        className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-slate-200 text-slate-600"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>{getInitials(emp.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.department}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {emp.tasksCompleted}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {emp.avgDuration > 0 ? `${emp.avgDuration} mnt` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{emp.rating}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rewardCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {rewardCategories.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const iconMap: Record<string, typeof Bell> = {
                task: CheckSquare,
                attendance: Clock,
                reward: Trophy,
                system: Bell,
                warning: AlertTriangle,
              }
              const colorMap: Record<string, string> = {
                task: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                attendance: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                reward: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                system: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                warning: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
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
    </div>
  )
}
