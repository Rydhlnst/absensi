"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  CalendarCheck,
  Clock,
  Coins,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tasks, attendance } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import type { TaskCategory, TaskStatus } from "@/types"

const categoryColor: Record<TaskCategory, string> = {
  installation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  billing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  repair: "bg-red-500/10 text-red-600 border-red-500/20",
  inspection: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
}

const statusColor: Record<TaskStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const categoryLabel: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Billing",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const statusLabel: Record<TaskStatus, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  on_hold: "Ditunda",
}

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return "N/A"
  const diff = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.round(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} menit`
  if (mins === 0) return `${hours} jam`
  return `${hours} jam ${mins} menit`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}j`
  return `${h}j ${m}m`
}

export default function TaskHistoryPage() {
  const { data: session } = authClient.useSession()
  const [filterMode, setFilterMode] = useState<"day" | "month" | "year" | "range">("month")
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")

  const currentEmployeeId = session?.user?.id || ""
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const dateRange = useMemo(() => {
    const y = parseInt(selectedYear)
    const m = parseInt(selectedMonth)

    if (filterMode === "day") {
      const today = format(now, "yyyy-MM-dd")
      return { start: today, end: today }
    }
    if (filterMode === "month") {
      const start = `${y}-${String(m).padStart(2, "0")}-01`
      const lastDay = new Date(y, m, 0).getDate()
      const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
      return { start, end }
    }
    if (filterMode === "year") {
      return { start: `${y}-01-01`, end: `${y}-12-31` }
    }
    return { start: dateStart, end: dateEnd }
  }, [filterMode, selectedMonth, selectedYear, dateStart, dateEnd])

  const myTasks = useMemo(() => {
    return tasks
      .filter((t) => t.assignedTo === currentEmployeeId)
      .filter((t) => {
        if (!dateRange.start || !dateRange.end) return true
        const d = t.workingDate
        return d >= dateRange.start && d <= dateRange.end
      })
      .sort(
        (a, b) =>
          new Date(b.workingDate).getTime() - new Date(a.workingDate).getTime()
      )
  }, [currentEmployeeId, dateRange])

  const attendanceRecords = useMemo(() => {
    return attendance.filter(
      (a) =>
        a.employeeId === currentEmployeeId &&
        a.date >= dateRange.start &&
        a.date <= dateRange.end
    )
  }, [currentEmployeeId, dateRange])

  const summary = useMemo(() => {
    const completed = myTasks.filter((t) => t.status === "completed")
    const totalRewards = completed.reduce((sum, t) => sum + t.rewardPoints, 0)
    const totalWorkMinutes = attendanceRecords.reduce(
      (sum, a) => sum + a.workingDuration,
      0
    )
    const hariAbsen = attendanceRecords.filter((a) => a.status === "absent").length
    const tepatWaktu = attendanceRecords.filter(
      (a) => a.status === "present" && !a.isLate
    ).length
    const terlambat = attendanceRecords.filter((a) => a.status === "late").length

    return {
      total: myTasks.length,
      completed: completed.length,
      totalRewards,
      totalWorkMinutes,
      hariAbsen,
      tepatWaktu,
      terlambat,
      gajiDiperoleh: totalRewards * 100,
    }
  }, [myTasks, attendanceRecords])

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tugas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterMode === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("day")}
            >
              Hari
            </Button>
            <Button
              variant={filterMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("month")}
            >
              Bulan
            </Button>
            <Button
              variant={filterMode === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("year")}
            >
              Tahun
            </Button>
            <Button
              variant={filterMode === "range" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("range")}
            >
              Rentang
            </Button>
          </div>

          {filterMode === "month" && (
            <div className="flex flex-wrap gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {filterMode === "year" && (
            <div className="flex flex-wrap gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {filterMode === "range" && (
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Coins className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">Total Gaji Diperoleh</span>
            </div>
            <p className="text-lg font-bold">{formatRupiah(summary.gajiDiperoleh)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">Total Waktu Kerja</span>
            </div>
            <p className="text-lg font-bold">{formatHours(summary.totalWorkMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">Hari Absen</span>
            </div>
            <p className="text-lg font-bold">{summary.hariAbsen}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <CheckCircle className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">Tepat Waktu</span>
            </div>
            <p className="text-lg font-bold">{summary.tepatWaktu}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">Terlambat</span>
            </div>
            <p className="text-lg font-bold">{summary.terlambat}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tugas</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      Tidak ada data tugas
                    </TableCell>
                  </TableRow>
                ) : (
                  myTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColor[task.category]}`}
                        >
                          {categoryLabel[task.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(task.workingDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColor[task.status]}`}
                        >
                          {statusLabel[task.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDuration(task.startedAt, task.completedAt)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {task.status === "completed"
                          ? formatRupiah(task.rewardPoints * 100)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
