"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Bell,
  MapPin,
  LogOut,
  CalendarCheck,
  Clock,
  Wallet,
  Trophy,
  ListTodo,
  History,
  CalendarOff,
  AlertTriangle,
  ChevronRight,
  Snowflake,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { employees, tasks, attendance } from "@/data/mock"
import { authClient } from "@/lib/auth-client"

function getGreeting(hour: number): string {
  if (hour < 11) return "Selamat Pagi"
  if (hour < 15) return "Selamat Siang"
  if (hour < 18) return "Selamat Sore"
  return "Selamat Malam"
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h} jam ${m} menit`
}

function formatCurrency(amount: number): string {
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

const categoryLabels: Record<string, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Billing",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const categoryColors: Record<string, string> = {
  installation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  billing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  repair: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  inspection: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

const priorityLabels: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Urgent",
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  on_hold: "Ditunda",
}

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  in_progress: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  on_hold: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
}

export default function EmployeeDashboardPage() {
  const { data: session } = authClient.useSession()
  const [isAlreadyCheckedIn, setIsAlreadyCheckedIn] = useState(false)
  const [isAlreadyCheckedOut, setIsAlreadyCheckedOut] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [workingMinutes, setWorkingMinutes] = useState(0)
  const [hasPendingTasks] = useState(true)
  const [isInOffice, setIsInOffice] = useState(false)

  const currentUserId = session?.user?.id || ""
  const employee = employees.find(e => e.id === currentUserId) || employees[0]
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")
  const currentHour = now.getHours()
  const todayDay = now.getDate()

  const todayAttendance = useMemo(
    () => attendance.find((a) => a.employeeId === employee.id && a.date === todayStr),
    [todayStr]
  )

  const monthRecords = useMemo(
    () =>
      attendance.filter(
        (a) =>
          a.employeeId === employee.id &&
          a.date.startsWith(format(now, "yyyy-MM"))
      ),
    []
  )

  const monthPresent = monthRecords.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length
  const monthWorkingHours = monthRecords.reduce(
    (sum, a) => sum + a.workingDuration,
    0
  )
  const monthSalary =
    todayDay > 0
      ? Math.round((monthPresent / todayDay) * employee.salary)
      : employee.salary

  const recentTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.assignedTo === employee.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3),
    []
  )

  useEffect(() => {
    if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
      setIsAlreadyCheckedIn(true)
      setCheckInTime(new Date(todayAttendance.checkIn))
    }
    if (todayAttendance?.checkOut) {
      setIsAlreadyCheckedIn(true)
      setIsAlreadyCheckedOut(true)
      setWorkingMinutes(todayAttendance.workingDuration)
    }
  }, [todayAttendance])

  useEffect(() => {
    if (isAlreadyCheckedIn && !isAlreadyCheckedOut && checkInTime) {
      const interval = setInterval(() => {
        const diff = Math.floor(
          (Date.now() - checkInTime.getTime()) / 60000
        )
        setWorkingMinutes(diff)
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [isAlreadyCheckedIn, isAlreadyCheckedOut, checkInTime])

  const handleCheckIn = () => {
    const now = new Date()
    setCheckInTime(now)
    setIsAlreadyCheckedIn(true)
  }

  const handleCheckOut = () => {
    setIsAlreadyCheckedOut(true)
  }

  const isLate = todayAttendance?.isLate
  const lateMinutes = todayAttendance?.lateMinutes ?? 0

  const attendanceStatus = isAlreadyCheckedOut
    ? "checked_out"
    : isAlreadyCheckedIn
      ? "checked_in"
      : "not_checked_in"

  const attendanceStatusConfig = {
    not_checked_in: {
      label: "Belum Absen",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    checked_in: {
      label: "Sudah Masuk",
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    checked_out: {
      label: "Sudah Pulang",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
  }

  const rewardProgress = Math.min((employee.rewardPoints / 500) * 100, 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting(currentHour)}, {employee.name}!
          </h1>
          <p className="text-muted-foreground">
            {format(now, "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
          </Button>
          <Avatar size="lg">
            <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Separator />

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Absensi Hari Ini</h2>
            <Badge className={attendanceStatusConfig[attendanceStatus].className}>
              {attendanceStatusConfig[attendanceStatus].label}
            </Badge>
          </div>

          {isLate && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="size-5 shrink-0" />
              <span className="text-sm font-medium">
                Anda terlambat {lateMinutes} menit hari ini
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Durasi Kerja Hari Ini</p>
              <p className="text-xl font-bold">{formatDuration(workingMinutes)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Estimasi Gaji Hari Ini</p>
              <p className="text-xl font-bold">
                {formatCurrency(Math.round(employee.salary / 22))}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!isAlreadyCheckedIn && (
              <Button
                size="lg"
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={handleCheckIn}
              >
                <MapPin className="size-5" />
                Check In
              </Button>
            )}
            {isAlreadyCheckedIn && !isAlreadyCheckedOut && (
              <Button
                size="lg"
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={handleCheckOut}
              >
                <LogOut className="size-5" />
                Check Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {hasPendingTasks && isInOffice && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Snowflake className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Pembekuan Gaji Aktif
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Anda memiliki tugas yang belum diselesaikan. Jam kerja dan gaji akan dibekukan sampai tugas selesai atau Anda keluar dari area kantor.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Tugas Pending:</p>
              {tasks
                .filter((t) => t.assignedTo === employee.id && (t.status === "pending" || t.status === "in_progress"))
                .slice(0, 3)
                .map((task) => (
                  <div key={task.id} className="flex items-center gap-2 rounded-lg bg-blue-100/50 px-3 py-2 dark:bg-blue-900/20">
                    <ListTodo className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-300">{task.title}</span>
                    <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">
                      {categoryLabels[task.category]}
                    </span>
                  </div>
                ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsInOffice(!isInOffice)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80"
              >
                <MapPin className="size-3" />
                {isInOffice ? "Keluar dari Area Kantor" : "Masuk ke Area Kantor"}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-lg font-semibold">Ringkasan Bulanan</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <CalendarCheck className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Hari Kehadiran</p>
                <p className="text-2xl font-bold">{monthPresent}</p>
                <p className="text-xs text-muted-foreground">
                  / {todayDay} hari kerja
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Jam Kerja</p>
                <p className="text-2xl font-bold">
                  {Math.floor(monthWorkingHours / 60)}j
                </p>
                <p className="text-xs text-muted-foreground">
                  {monthWorkingHours % 60}m bulan ini
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Wallet className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Gaji</p>
                <p className="text-lg font-bold">{formatCurrency(monthSalary)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Trophy className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Poin Reward</p>
                  <p className="text-2xl font-bold">{employee.rewardPoints}</p>
                </div>
              </div>
              <Progress value={rewardProgress} />
            </CardContent>
          </Card>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Aksi Cepat</h2>

      <div className="grid grid-cols-3 gap-3">
        <Link href="/employee/tasks">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
              <ListTodo className="size-6 text-blue-600" />
              <span className="text-sm font-medium">Lihat Tugas</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/employee/attendance">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
              <History className="size-6 text-amber-600" />
              <span className="text-sm font-medium">Riwayat Absensi</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/employee/leave">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
              <CalendarOff className="size-6 text-red-600" />
              <span className="text-sm font-medium">Ajukan Cuti</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tugas Terbaru</h2>
        <Link
          href="/employee/tasks"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Lihat Semua <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{task.title}</h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${categoryColors[task.category]}`}
                >
                  {categoryLabels[task.category]}
                </span>
                <span
                  className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}
                </span>
                <span
                  className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${statusColors[task.status]}`}
                >
                  {statusLabels[task.status]}
                </span>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Pelanggan:</span>{" "}
                  {task.customerName}
                </p>
                <p>
                  <span className="font-medium text-foreground">Alamat:</span>{" "}
                  {task.address}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
