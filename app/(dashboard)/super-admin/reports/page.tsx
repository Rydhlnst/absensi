"use client"

import { useEffect, useState } from "react"
import {
  ClipboardCheck,
  ListTodo,
  Coins,
  Award,
  TrendingUp,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workingDuration: number
}

interface Task {
  id: string
  title: string
  status: string
  assignedTo: string
  workingDate: string
  rewardPoints: number
}

interface Employee {
  id: string
  name: string
  salary: number
  role: string
  status: string
  position?: string
}

interface Reward {
  id: string
  employeeId: string
  points: number
  createdAt: string
}

interface ReportStats {
  totalPresent: number
  totalTasksCompleted: number
  totalActiveEmployees: number
  totalRewards: number
}

type DetailType = "absensi" | "tugas" | "gaji" | "reward" | null

export default function SuperAdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailType, setDetailType] = useState<DetailType>(null)

  const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
  const [taskData, setTaskData] = useState<Task[]>([])
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [rewardData, setRewardData] = useState<Reward[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [attendance, tasks, employees, rewards] = await Promise.all([
          apiClient.get<Attendance[]>("/api/attendance"),
          apiClient.get<Task[]>("/api/tasks"),
          apiClient.get<Employee[]>("/api/employees"),
          apiClient.get<Reward[]>("/api/rewards"),
        ])
        if (!cancelled) {
          setStats({
            totalPresent: attendance.filter((a) => a.status === "present" || a.status === "late").length,
            totalTasksCompleted: tasks.filter((t) => t.status === "completed").length,
            totalActiveEmployees: employees.filter((e) => e.status === "active" && e.role === "employee").length,
            totalRewards: rewards.length,
          })
          setAttendanceData(attendance)
          setTaskData(tasks)
          setEmployeeData(employees)
          setRewardData(rewards)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const loadDetail = async (type: DetailType) => {
    setDetailType(type)
    setDetailLoading(true)
    try {
      if (type === "absensi" && attendanceData.length === 0) {
        const data = await apiClient.get<Attendance[]>("/api/attendance")
        setAttendanceData(data)
      } else if (type === "tugas" && taskData.length === 0) {
        const data = await apiClient.get<Task[]>("/api/tasks")
        setTaskData(data)
      } else if (type === "gaji" && employeeData.length === 0) {
        const data = await apiClient.get<Employee[]>("/api/employees")
        setEmployeeData(data)
      } else if (type === "reward" && rewardData.length === 0) {
        const data = await apiClient.get<Reward[]>("/api/rewards")
        setRewardData(data)
      }
    } catch {
      // data already loaded from initial fetch
    } finally {
      setDetailLoading(false)
    }
  }

  const reportTypes = stats ? [
    { key: "absensi" as const, title: "Laporan Absensi", description: "Rekap kehadiran karyawan", icon: ClipboardCheck, count: stats.totalPresent, badge: "Hadir" },
    { key: "tugas" as const, title: "Laporan Tugas", description: "Ringkasan pekerjaan dan penyelesaian", icon: ListTodo, count: stats.totalTasksCompleted, badge: "Selesai" },
    { key: "gaji" as const, title: "Laporan Gaji", description: "Data karyawan aktif", icon: Coins, count: stats.totalActiveEmployees, badge: "Karyawan" },
    { key: "reward" as const, title: "Laporan Reward", description: "Transaksi poin reward", icon: Award, count: stats.totalRewards, badge: "Transaksi" },
  ] : []

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (detailType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDetailType(null)}
            className="flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {detailType === "absensi" && "Laporan Absensi"}
              {detailType === "tugas" && "Laporan Tugas"}
              {detailType === "gaji" && "Laporan Gaji"}
              {detailType === "reward" && "Laporan Reward"}
            </h1>
            <p className="text-xs text-gray-500">Detail laporan</p>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DetailContent type={detailType} attendance={attendanceData} tasks={taskData} employees={employeeData} rewards={rewardData} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">Ringkasan laporan perusahaan</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">{report.title}</CardTitle>
              <report.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {report.count} {report.badge}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => loadDetail(report.key)}>
                  Lihat Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DetailContent({
  type,
  attendance,
  tasks,
  employees,
  rewards,
}: {
  type: "absensi" | "tugas" | "gaji" | "reward"
  attendance: Attendance[]
  tasks: Task[]
  employees: Employee[]
  rewards: Reward[]
}) {
  if (type === "absensi") {
    const present = attendance.filter((a) => a.status === "present")
    const late = attendance.filter((a) => a.status === "late")
    const absent = attendance.filter((a) => a.status === "absent")
    const totalMinutes = attendance.reduce((s, a) => s + (a.workingDuration || 0), 0)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Hadir" value={present.length} color="green" />
          <StatCard label="Terlambat" value={late.length} color="yellow" />
          <StatCard label="Tidak Hadir" value={absent.length} color="red" />
          <StatCard label="Total Jam" value={`${Math.floor(totalMinutes / 60)}j ${totalMinutes % 60}m`} color="blue" />
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Riwayat Absensi</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {attendance.slice(0, 30).map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.date}</p>
                  <p className="text-xs text-gray-400">
                    {a.checkIn ? format(new Date(a.checkIn), "HH:mm") : "--:--"} - {a.checkOut ? format(new Date(a.checkOut), "HH:mm") : "--:--"}
                  </p>
                </div>
                <Badge variant={a.status === "present" ? "default" : a.status === "late" ? "secondary" : "destructive"} className="text-[10px]">
                  {a.status === "present" ? "Hadir" : a.status === "late" ? "Telat" : "Absen"}
                </Badge>
              </div>
            ))}
            {attendance.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Tidak ada data</p>}
          </div>
        </div>
      </div>
    )
  }

  if (type === "tugas") {
    const completed = tasks.filter((t) => t.status === "completed")
    const pending = tasks.filter((t) => t.status !== "completed")
    const totalPoints = completed.reduce((s, t) => s + (t.rewardPoints || 0), 0)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Selesai" value={completed.length} color="green" />
          <StatCard label="Belum Selesai" value={pending.length} color="red" />
          <StatCard label="Total Poin" value={totalPoints} color="blue" />
          <StatCard label="Total Tugas" value={tasks.length} color="gray" />
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Tugas</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {tasks.slice(0, 30).map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.workingDate}</p>
                </div>
                <Badge variant={t.status === "completed" ? "default" : "secondary"} className="text-[10px]">
                  {t.status === "completed" ? "Selesai" : t.status}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Tidak ada data</p>}
          </div>
        </div>
      </div>
    )
  }

  if (type === "gaji") {
    const activeEmployees = employees.filter((e) => e.role === "employee" && e.status === "active")
    const totalSalary = activeEmployees.reduce((s, e) => s + (e.salary || 0), 0)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Karyawan Aktif" value={activeEmployees.length} color="green" />
          <StatCard label="Total Gaji/Bulan" value={`Rp ${totalSalary.toLocaleString("id-ID")}`} color="blue" />
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data Karyawan</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {activeEmployees.map((e) => (
              <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">{e.position || "-"}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">Rp {(e.salary || 0).toLocaleString("id-ID")}</p>
              </div>
            ))}
            {activeEmployees.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Tidak ada data</p>}
          </div>
        </div>
      </div>
    )
  }

  if (type === "reward") {
    const totalPoints = rewards.reduce((s, r) => s + (r.points || 0), 0)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Transaksi" value={rewards.length} color="blue" />
          <StatCard label="Total Poin" value={totalPoints} color="green" />
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Riwayat Reward</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {rewards.slice(0, 30).map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Poin: {r.points}</p>
                  <p className="text-xs text-gray-400">{r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy", { locale: id }) : "-"}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">+{r.points} poin</Badge>
              </div>
            ))}
            {rewards.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Tidak ada data</p>}
          </div>
        </div>
      </div>
    )
  }

  return null
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-50 border-green-100 text-green-700",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
    red: "bg-red-50 border-red-100 text-red-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    gray: "bg-gray-50 border-gray-100 text-gray-700",
  }
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color] || colorMap.gray}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-lg font-extrabold mt-1">{value}</p>
    </div>
  )
}
