"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Search,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { attendance, employees } from "@/data/mock"

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

export default function SuperAdminAttendancePage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of employees) {
      map.set(e.id, e.name)
    }
    return map
  }, [])

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
  }, [search, employeeMap])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rekap Absensi</h1>
        <p className="text-muted-foreground">
          Pantau kehadiran seluruh karyawan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Data Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau tanggal..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell className="font-medium">
                        {format(new Date(att.date), "dd MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>
                        {employeeMap.get(att.employeeId) || att.employeeId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[att.status]}>
                          {statusLabel[att.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(att.workingDuration)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {paginated.length} dari{" "}
              {filteredAttendance.length} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
