"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { attendance, employees } from "@/data/mock"
import type { AttendanceStatus } from "@/types"

const statusColor: Record<AttendanceStatus, string> = {
  present: "bg-green-500/10 text-green-600 border-green-500/20",
  late: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  absent: "bg-red-500/10 text-red-600 border-red-500/20",
  leave: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  holiday: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const statusLabel: Record<AttendanceStatus, string> = {
  present: "Hadir",
  late: "Terlambat",
  absent: "Tidak Hadir",
  leave: "Cuti",
  holiday: "Libur",
}

const currentEmployee = employees[2]

function formatTime(isoStr: string | null): string {
  if (!isoStr) return "-"
  return new Date(isoStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "-"
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

function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr)
  return d >= start && d <= end
}

function getDateRange(filter: string): { start: Date; end: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (filter === "today") {
    return { start: today, end: new Date(today.getTime() + 86400000 - 1) }
  }

  if (filter === "week") {
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return { start: monday, end: sunday }
  }

  if (filter === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start: firstDay, end: lastDay }
  }

  return { start: new Date("2020-01-01"), end: new Date("2099-12-31") }
}

export default function AttendanceHistoryPage() {
  const [filter, setFilter] = useState("month")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const filteredAttendance = useMemo(() => {
    let range: { start: Date; end: Date }

    if (filter === "custom" && customStart && customEnd) {
      range = {
        start: new Date(customStart),
        end: new Date(customEnd + "T23:59:59.999"),
      }
    } else {
      range = getDateRange(filter)
    }

    return attendance
      .filter(
        (a) =>
          a.employeeId === currentEmployee.id &&
          isInRange(a.date, range.start, range.end)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filter, customStart, customEnd])

  const summary = useMemo(() => {
    const present = filteredAttendance.filter(
      (a) => a.status === "present" || a.status === "late"
    )
    const totalMinutes = present.reduce((sum, a) => sum + a.workingDuration, 0)
    const lateCount = filteredAttendance.filter((a) => a.status === "late").length
    return {
      totalDays: present.length,
      totalHours: formatDuration(totalMinutes),
      lateCount,
    }
  }, [filteredAttendance])

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="today">Hari Ini</TabsTrigger>
              <TabsTrigger value="week">Minggu Ini</TabsTrigger>
              <TabsTrigger value="month">Bulan Ini</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            {filter === "custom" && (
              <TabsContent value="custom">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lokasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Tidak ada data absensi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell className="text-xs">{formatDate(att.date)}</TableCell>
                      <TableCell className="text-xs">{formatTime(att.checkIn)}</TableCell>
                      <TableCell className="text-xs">{formatTime(att.checkOut)}</TableCell>
                      <TableCell className="text-xs">
                        {formatDuration(att.workingDuration)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusColor[att.status]}`}>
                          {statusLabel[att.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                        {att.checkInLocation?.address ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total Hadir:</span>
              <span className="font-medium">{summary.totalDays} hari</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total Jam:</span>
              <span className="font-medium">{summary.totalHours}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Terlambat:</span>
              <span className="font-medium">{summary.lateCount} kali</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
