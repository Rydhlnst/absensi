"use client"

import { useEffect, useState } from "react"
import {
  ClipboardCheck,
  ListTodo,
  Coins,
  Award,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"

interface Attendance {
  status: string
}

interface Task {
  status: string
}

interface Employee {
  status: string
  role: string
}

interface Reward {
  id: string
}

interface ReportStats {
  totalPresent: number
  totalTasksCompleted: number
  totalActiveEmployees: number
  totalRewards: number
}

export default function SuperAdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)

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

  const reportTypes = stats ? [
    { title: "Laporan Absensi", description: "Rekap kehadiran karyawan", icon: ClipboardCheck, count: stats.totalPresent, badge: "Hadir" },
    { title: "Laporan Tugas", description: "Ringkasan pekerjaan dan penyelesaian", icon: ListTodo, count: stats.totalTasksCompleted, badge: "Selesai" },
    { title: "Laporan Gaji", description: "Data karyawan aktif", icon: Coins, count: stats.totalActiveEmployees, badge: "Karyawan" },
    { title: "Laporan Reward", description: "Transaksi poin reward", icon: Award, count: stats.totalRewards, badge: "Transaksi" },
  ] : []

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
                <Button variant="outline" size="sm">Lihat Detail</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
