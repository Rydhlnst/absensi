"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Users,
  Shield,
  UserCheck,
  HeartPulse,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { AdminDashboardSkeleton } from "@/components/skeletons"
import { toast } from "sonner"

interface Stats {
  totalUsers: number
  totalAdmins: number
  totalEmployees: number
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  presentToday: number
  absentToday: number
}

interface AttendanceRecord {
  id: string
  date: string
  status: string
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [s, att] = await Promise.all([
        apiClient.get<Stats>("/api/stats"),
        apiClient.get<AttendanceRecord[]>("/api/attendance"),
      ])
      setStats(s)
      setAttendance(att)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memuat data"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  void loadData

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [s, att] = await Promise.all([
          apiClient.get<Stats>("/api/stats"),
          apiClient.get<AttendanceRecord[]>("/api/attendance"),
        ])
        if (!cancelled) {
          setStats(s)
          setAttendance(att)
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Gagal memuat data"
        if (!cancelled) toast.error(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const statConfig = stats ? [
    { key: "totalUsers", label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-100 text-blue-600" },
    { key: "totalAdmins", label: "Total Admin", value: stats.totalAdmins, icon: Shield, color: "bg-purple-100 text-purple-600" },
    { key: "totalEmployees", label: "Total Karyawan", value: stats.totalEmployees, icon: UserCheck, color: "bg-green-100 text-green-600" },
    { key: "systemHealth", label: "System Health", value: "98.5%", icon: HeartPulse, color: "bg-orange-100 text-orange-600" },
  ] : []

  const activityData = (() => {
    const days: { day: string; present: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const dayAtt = attendance.filter((a) => a.date === dateStr)
      const present = dayAtt.filter((a) => a.status === "present" || a.status === "late").length
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" })
      days.push({ day: dayName, present })
    }
    return days
  })()

  if (loading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((s) => (
          <Card key={s.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="size-5" />
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Kehadiran 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
