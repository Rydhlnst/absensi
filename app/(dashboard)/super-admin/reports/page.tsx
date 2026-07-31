"use client"

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
import { attendance, tasks, employees, rewards } from "@/data/mock"

const reportTypes = [
  {
    title: "Laporan Absensi",
    description: "Rekap kehadiran karyawan bulanan",
    icon: ClipboardCheck,
    count: attendance.filter((a) => a.status === "present" || a.status === "late")
      .length,
    badge: "Hadir",
  },
  {
    title: "Laporan Tugas",
    description: "Ringkasan pekerjaan dan penyelesaian",
    icon: ListTodo,
    count: tasks.filter((t) => t.status === "completed").length,
    badge: "Selesai",
  },
  {
    title: "Laporan Gaji",
    description: "Data penggajian karyawan aktif",
    icon: Coins,
    count: employees.filter((e) => e.status === "active").length,
    badge: "Karyawan",
  },
  {
    title: "Laporan Reward",
    description: "Poin reward yang diterima dan ditukar",
    icon: Award,
    count: rewards.length,
    badge: "Transaksi",
  },
]

export default function SuperAdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">
          Ringkasan laporan perusahaan
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                {report.title}
              </CardTitle>
              <report.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {report.count} {report.badge}
                </Badge>
                <Button variant="outline" size="sm">
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
