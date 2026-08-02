"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 15

const statusLabel: Record<string, string> = {
  present: "Hadir",
  late: "Terlambat",
  absent: "Tidak Hadir",
  leave: "Cuti",
  holiday: "Libur",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  late: "destructive",
  absent: "destructive",
  leave: "secondary",
  holiday: "outline",
}

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  workingDuration: number
  status: string
}

interface EmployeeRecord {
  id: string
  name: string
}

export default function SuperAdminAttendancePage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [att, emps] = await Promise.all([
        apiClient.get<AttendanceRecord[]>("/api/attendance"),
        apiClient.get<EmployeeRecord[]>("/api/employees"),
      ])
      setAttendance(att)
      setEmployees(emps)
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
        const [att, emps] = await Promise.all([
          apiClient.get<AttendanceRecord[]>("/api/attendance"),
          apiClient.get<EmployeeRecord[]>("/api/employees"),
        ])
        if (!cancelled) {
          setAttendance(att)
          setEmployees(emps)
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

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of employees) {
      map.set(e.id, e.name)
    }
    return map
  }, [employees])

  const filteredAttendance = useMemo(() => {
    return attendance
      .filter((a) => {
        const name = employeeMap.get(a.employeeId) || ""
        return (
          a.date.includes(search) ||
          name.toLowerCase().includes(search.toLowerCase())
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [search, employeeMap, attendance])

  const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE)
  const paginated = filteredAttendance.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  function formatDuration(minutes: number): string {
    if (minutes === 0) return "-"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}j ${m}m`
  }

  function formatTime(dateStr: string | null): string {
    if (!dateStr) return "-"
    return format(new Date(dateStr), "HH:mm")
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Absensi</h1>
          <p className="text-muted-foreground">
            Pantau kehadiran seluruh karyawan
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama / tanggal..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell className="font-medium">
                        {employeeMap.get(att.employeeId) || "-"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(att.date), "dd MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>{formatTime(att.checkIn)}</TableCell>
                      <TableCell>{formatTime(att.checkOut)}</TableCell>
                      <TableCell>{formatDuration(att.workingDuration)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[att.status] || "outline"}>
                          {statusLabel[att.status] || att.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
