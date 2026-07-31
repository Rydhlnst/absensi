"use client"

import { useState, useMemo } from "react"
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Users,
  ClipboardCheck,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Timer,
  Coins,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { employees, attendance, tasks, salaries, rewards, companySetting } from "@/data/mock"
import type { AttendanceStatus, TaskCategory, SalaryStatus, RewardType } from "@/types"

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

function formatDateID(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

const categoryLabel: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Penagihan",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const salaryStatusLabel: Record<SalaryStatus, string> = {
  paid: "Dibayar",
  processing: "Diproses",
  pending: "Menunggu",
}

const salaryStatusColor: Record<SalaryStatus, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
}

const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("attendance")
  const [attendanceStartDate, setAttendanceStartDate] = useState("2026-07-01")
  const [attendanceEndDate, setAttendanceEndDate] = useState("2026-07-31")
  const [attendanceEmployee, setAttendanceEmployee] = useState("all")
  const [taskStartDate, setTaskStartDate] = useState("2026-07-01")
  const [taskEndDate, setTaskEndDate] = useState("2026-07-31")
  const [taskCategory, setTaskCategory] = useState("all")
  const [salaryMonth, setSalaryMonth] = useState("7")
  const [salaryYear, setSalaryYear] = useState("2026")
  const [rewardStartDate, setRewardStartDate] = useState("2026-07-01")
  const [rewardEndDate, setRewardEndDate] = useState("2026-07-31")

  const attendanceData = useMemo(() => {
    const filtered = attendance.filter((a) => {
      const d = a.date
      const inRange = d >= attendanceStartDate && d <= attendanceEndDate
      const empMatch = attendanceEmployee === "all" || a.employeeId === attendanceEmployee
      return inRange && empMatch
    })

    const byEmployee = new Map<string, { present: number; late: number; absent: number; totalHours: number }>()
    for (const a of filtered) {
      const existing = byEmployee.get(a.employeeId) || { present: 0, late: 0, absent: 0, totalHours: 0 }
      if (a.status === "present") existing.present++
      else if (a.status === "late") existing.late++
      else if (a.status === "absent") existing.absent++
      existing.totalHours += a.workingDuration / 60
      byEmployee.set(a.employeeId, existing)
    }

    const rows = Array.from(byEmployee.entries()).map(([empId, stats]) => {
      const emp = employees.find((e) => e.id === empId)
      return {
        employeeId: empId,
        employeeName: emp?.name || "-",
        department: emp?.department || "-",
        ...stats,
      }
    })

    const totalPresent = rows.reduce((s, r) => s + r.present, 0)
    const totalLate = rows.reduce((s, r) => s + r.late, 0)
    const totalAbsent = rows.reduce((s, r) => s + r.absent, 0)
    const totalDays = totalPresent + totalLate + totalAbsent
    const totalHours = rows.reduce((s, r) => s + r.totalHours, 0)

    return { rows, totalDays, totalPresent, totalLate, totalAbsent, totalHours }
  }, [attendanceStartDate, attendanceEndDate, attendanceEmployee])

  const taskData = useMemo(() => {
    const filtered = tasks.filter((t) => {
      const d = t.workingDate
      const inRange = d >= taskStartDate && d <= taskEndDate
      const catMatch = taskCategory === "all" || t.category === taskCategory
      return inRange && catMatch
    })

    const byCategory = new Map<TaskCategory, { completed: number; inProgress: number; pending: number; totalDuration: number; totalRewards: number; count: number }>()
    for (const cat of companySetting.taskCategories) {
      byCategory.set(cat, { completed: 0, inProgress: 0, pending: 0, totalDuration: 0, totalRewards: 0, count: 0 })
    }

    for (const t of filtered) {
      const existing = byCategory.get(t.category)
      if (!existing) continue
      existing.count++
      if (t.status === "completed") existing.completed++
      else if (t.status === "in_progress") existing.inProgress++
      else if (t.status === "pending") existing.pending++
      if (t.completedAt && t.startedAt) {
        existing.totalDuration += (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) / 60000
      } else {
        existing.totalDuration += t.estimatedDuration
      }
      existing.totalRewards += t.rewardPoints
    }

    const rows = Array.from(byCategory.entries())
      .filter(([_, s]) => s.count > 0)
      .map(([cat, stats]) => ({
        category: cat,
        categoryName: categoryLabel[cat],
        completed: stats.completed,
        inProgress: stats.inProgress,
        pending: stats.pending,
        avgDuration: stats.completed > 0 ? Math.round(stats.totalDuration / stats.completed) : 0,
        totalRewards: stats.totalRewards,
      }))

    const totalTugas = rows.reduce((s, r) => s + r.completed + r.inProgress + r.pending, 0)
    const totalSelesai = rows.reduce((s, r) => s + r.completed, 0)
    const totalInProses = rows.reduce((s, r) => s + r.inProgress, 0)
    const totalPending = rows.reduce((s, r) => s + r.pending, 0)

    return { rows, totalTugas, totalSelesai, totalInProses, totalPending }
  }, [taskStartDate, taskEndDate, taskCategory])

  const salaryData = useMemo(() => {
    const month = parseInt(salaryMonth)
    const year = parseInt(salaryYear)
    const filtered = salaries.filter((s) => s.month === month && s.year === year)

    const rows = filtered.map((s) => {
      const emp = employees.find((e) => e.id === s.employeeId)
      return {
        ...s,
        employeeName: emp?.name || "-",
        department: emp?.department || "-",
      }
    })

    const totalGaji = rows.reduce((s, r) => s + r.totalSalary, 0)
    const avg = rows.length > 0 ? totalGaji / rows.length : 0
    const max = rows.length > 0 ? Math.max(...rows.map((r) => r.totalSalary)) : 0
    const min = rows.length > 0 ? Math.min(...rows.map((r) => r.totalSalary)) : 0

    return { rows, totalGaji, avg, max, min }
  }, [salaryMonth, salaryYear])

  const rewardData = useMemo(() => {
    const filtered = rewards.filter((r) => {
      const d = r.createdAt.split("T")[0]
      return d >= rewardStartDate && d <= rewardEndDate
    })

    const byEmployee = new Map<string, { earned: number; redeemed: number }>()
    for (const r of filtered) {
      const existing = byEmployee.get(r.employeeId) || { earned: 0, redeemed: 0 }
      if (r.type === "earned") existing.earned += r.points
      else if (r.type === "redeemed") existing.redeemed += r.points
      byEmployee.set(r.employeeId, existing)
    }

    const rows = Array.from(byEmployee.entries()).map(([empId, stats]) => {
      const emp = employees.find((e) => e.id === empId)
      return {
        employeeId: empId,
        employeeName: emp?.name || "-",
        department: emp?.department || "-",
        earned: stats.earned,
        redeemed: stats.redeemed,
        net: stats.earned - stats.redeemed,
      }
    })

    const totalEarned = rows.reduce((s, r) => s + r.earned, 0)
    const totalRedeemed = rows.reduce((s, r) => s + r.redeemed, 0)
    const activePoints = employees.reduce((s, e) => s + e.rewardPoints, 0)

    return { rows, totalEarned, totalRedeemed, activePoints }
  }, [rewardStartDate, rewardEndDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground">Lihat dan ekspor laporan perusahaan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="size-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="attendance">
            <ClipboardCheck className="size-4" />
            Laporan Absensi
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle className="size-4" />
            Laporan Tugas
          </TabsTrigger>
          <TabsTrigger value="salary">
            <Coins className="size-4" />
            Laporan Gaji
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Award className="size-4" />
            Laporan Reward
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan Absensi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</label>
                  <Input
                    type="date"
                    value={attendanceStartDate}
                    onChange={(e) => setAttendanceStartDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal Akhir</label>
                  <Input
                    type="date"
                    value={attendanceEndDate}
                    onChange={(e) => setAttendanceEndDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Karyawan</label>
                  <Select value={attendanceEmployee} onValueChange={setAttendanceEmployee}>
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Karyawan</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Calendar className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Hari Kerja</span>
                </div>
                <p className="text-2xl font-bold">{attendanceData.totalDays.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Hadir</span>
                </div>
                <p className="text-2xl font-bold">{attendanceData.totalPresent.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Terlambat</span>
                </div>
                <p className="text-2xl font-bold">{attendanceData.totalLate.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <XCircle className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Tidak Hadir</span>
                </div>
                <p className="text-2xl font-bold">{attendanceData.totalAbsent.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Kehadiran Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead className="text-center">Hari Hadir</TableHead>
                    <TableHead className="text-center">Hari Terlambat</TableHead>
                    <TableHead className="text-center">Hari Tidak Hadir</TableHead>
                    <TableHead className="text-right">Total Jam Kerja</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada data untuk rentang tanggal ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceData.rows.map((row) => (
                      <TableRow key={row.employeeId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{row.employeeName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.department}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{row.present}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.late > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{row.late}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.absent > 0 ? (
                            <Badge variant="destructive">{row.absent}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{row.totalHours.toFixed(1)} jam</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex justify-end border-t px-6 py-3">
              <Button>
                <Download className="size-4" />
                Export Laporan Absensi
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan Tugas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</label>
                  <Input
                    type="date"
                    value={taskStartDate}
                    onChange={(e) => setTaskStartDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal Akhir</label>
                  <Input
                    type="date"
                    value={taskEndDate}
                    onChange={(e) => setTaskEndDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                  <Select value={taskCategory} onValueChange={setTaskCategory}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {companySetting.taskCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabel[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <ClipboardCheck className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Tugas</span>
                </div>
                <p className="text-2xl font-bold">{taskData.totalTugas.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Selesai</span>
                </div>
                <p className="text-2xl font-bold">{taskData.totalSelesai.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Timer className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Dalam Proses</span>
                </div>
                <p className="text-2xl font-bold">{taskData.totalInProses.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <AlertTriangle className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-bold">{taskData.totalPending.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Tugas per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Selesai</TableHead>
                    <TableHead className="text-center">Dalam Proses</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Rata-rata Durasi</TableHead>
                    <TableHead className="text-right">Total Poin Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada data untuk rentang tanggal ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    taskData.rows.map((row) => (
                      <TableRow key={row.category}>
                        <TableCell className="font-medium">{row.categoryName}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{row.completed}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{row.inProgress}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.pending > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{row.pending}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {row.avgDuration} mnt
                        </TableCell>
                        <TableCell className="text-right font-medium">{row.totalRewards} poin</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex justify-end border-t px-6 py-3">
              <Button>
                <Download className="size-4" />
                Export Laporan Tugas
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan Gaji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Bulan</label>
                  <Select value={salaryMonth} onValueChange={setSalaryMonth}>
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
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tahun</label>
                  <Select value={salaryYear} onValueChange={setSalaryYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Coins className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Gaji</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(salaryData.totalGaji)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Rata-rata</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(salaryData.avg))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Tertinggi</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(salaryData.max)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <TrendingDown className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Terendah</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(salaryData.min)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Gaji Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead className="text-right">Gaji Pokok</TableHead>
                    <TableHead className="text-right">Bonus</TableHead>
                    <TableHead className="text-right">Potongan</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Tidak ada data gaji untuk periode ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    salaryData.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <p className="font-medium">{row.employeeName}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.department}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.baseSalary)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          +{formatCurrency(row.bonus)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatCurrency(row.deduction)}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(row.totalSalary)}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={salaryStatusColor[row.status]}>
                            {salaryStatusLabel[row.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex justify-end border-t px-6 py-3">
              <Button>
                <Download className="size-4" />
                Export Laporan Gaji
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan Reward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</label>
                  <Input
                    type="date"
                    value={rewardStartDate}
                    onChange={(e) => setRewardStartDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal Akhir</label>
                  <Input
                    type="date"
                    value={rewardEndDate}
                    onChange={(e) => setRewardEndDate(e.target.value)}
                    className="w-44"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Poin Didapat</span>
                </div>
                <p className="text-2xl font-bold">{rewardData.totalEarned.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <TrendingDown className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Total Poin Ditukar</span>
                </div>
                <p className="text-2xl font-bold">{rewardData.totalRedeemed.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Award className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Poin Aktif (Total)</span>
                </div>
                <p className="text-2xl font-bold">{rewardData.activePoints.toLocaleString("id-ID")}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Poin Reward Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead className="text-right">Poin Didapat</TableHead>
                    <TableHead className="text-right">Poin Ditukar</TableHead>
                    <TableHead className="text-right">Poin Bersih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Tidak ada data reward untuk rentang tanggal ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    rewardData.rows.map((row) => (
                      <TableRow key={row.employeeId}>
                        <TableCell>
                          <p className="font-medium">{row.employeeName}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.department}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600">+{row.earned}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600">-{row.redeemed}</span>
                        </TableCell>
                        <TableCell className="text-right font-bold">{row.net}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="flex justify-end border-t px-6 py-3">
              <Button>
                <Download className="size-4" />
                Export Laporan Reward
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
