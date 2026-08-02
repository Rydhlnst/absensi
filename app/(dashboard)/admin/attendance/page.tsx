"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Download,
  Search,
  Camera,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertTriangle,
  Plane,
  Snowflake,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { apiClient } from "@/lib/api"
import { getAvatarUrl } from "@/lib/utils"
import { toast } from "sonner"
import type { Attendance, AttendanceStatus } from "@/types"

type SortField =
  | "name"
  | "checkIn"
  | "checkOut"
  | "duration"
  | "status"
  | "late"
type SortDirection = "asc" | "desc"

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  image: string | null
  department: string
  position: string
  role: string
  nik?: string
}

interface AttendanceRow {
  attendance: Attendance
  employee: Employee
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "-"
  return format(new Date(dateStr), "HH:mm")
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "-"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}j`
  return `${h}j ${m}m`
}

function getStatusBadge(status: AttendanceStatus) {
  const config: Record<
    AttendanceStatus,
    { label: string; className: string }
  > = {
    present: {
      label: "Hadir",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    late: {
      label: "Terlambat",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    absent: {
      label: "Tidak Hadir",
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    leave: {
      label: "Cuti/Izin",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    holiday: {
      label: "Libur",
      className:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    },
  }
  const c = config[status]
  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  )
}

function getShortAddress(address: string): string {
  const parts = address.split(",")
  return parts[0] || address
}

const ITEMS_PER_PAGE = 10

function SortableHead({
  field,
  children,
  onSort,
}: {
  field: SortField
  children: React.ReactNode
  onSort: (field: SortField) => void
}) {
  return (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="size-3 text-muted-foreground" />
      </div>
    </TableHead>
  )
}

export default function AttendanceManagementPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const [selectedDate, setSelectedDate] = useState(today)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedRow, setSelectedRow] = useState<AttendanceRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [approvals, setApprovals] = useState<Record<string, boolean>>({})

  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [att, emps] = await Promise.all([
          apiClient.get<Attendance[]>("/api/attendance"),
          apiClient.get<Employee[]>("/api/employees"),
        ])
        if (!cancelled) {
          setAttendance(att)
          setEmployees(emps)
        }
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const departments = useMemo(() => {
    const deps = new Set(employees.map((e) => e.department))
    return Array.from(deps).sort()
  }, [employees])

  const dateAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === selectedDate)
  }, [attendance, selectedDate])

  const attendanceRows = useMemo(() => {
    return dateAttendance
      .map((att) => {
        const emp = employees.find((e) => e.id === att.employeeId)
        if (!emp) return null
        return { attendance: att, employee: emp }
      })
      .filter(Boolean) as AttendanceRow[]
  }, [dateAttendance])

  const stats = useMemo(() => {
    const present = dateAttendance.filter(
      (a) => a.status === "present"
    ).length
    const late = dateAttendance.filter((a) => a.status === "late").length
    const absent = dateAttendance.filter(
      (a) => a.status === "absent"
    ).length
    const leave = dateAttendance.filter(
      (a) => a.status === "leave" || a.status === "holiday"
    ).length
    return { present, late, absent, leave }
  }, [dateAttendance])

  const filteredRows = useMemo(() => {
    let result = attendanceRows

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) =>
        r.employee.name.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (r) => r.attendance.status === statusFilter
      )
    }

    if (departmentFilter !== "all") {
      result = result.filter(
        (r) => r.employee.department === departmentFilter
      )
    }

    return result
  }, [attendanceRows, searchQuery, statusFilter, departmentFilter])

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows]
    sorted.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.employee.name.localeCompare(b.employee.name)
          break
        case "checkIn":
          cmp = (a.attendance.checkIn || "").localeCompare(
            b.attendance.checkIn || ""
          )
          break
        case "checkOut":
          cmp = (a.attendance.checkOut || "").localeCompare(
            b.attendance.checkOut || ""
          )
          break
        case "duration":
          cmp =
            a.attendance.workingDuration -
            b.attendance.workingDuration
          break
        case "status":
          cmp = a.attendance.status.localeCompare(b.attendance.status)
          break
        case "late":
          cmp =
            a.attendance.lateMinutes - b.attendance.lateMinutes
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
    return sorted
  }, [filteredRows, sortField, sortDirection])

  const totalPages = Math.ceil(sortedRows.length / ITEMS_PER_PAGE)
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleApprove = (id: string) => {
    setApprovals((prev) => ({ ...prev, [id]: true }))
  }

  const handleReject = (id: string) => {
    setApprovals((prev) => ({ ...prev, [id]: false }))
  }

  const openDetail = (row: AttendanceRow) => {
    setSelectedRow(row)
    setDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manajemen Absensi
            </h1>
            <p className="text-muted-foreground">
              Kelola dan pantau kehadiran karyawan
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="size-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert("Export PDF")}>
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Export Excel")}>
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Export CSV")}>
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tanggal:</span>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-fit"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Hadir Hari Ini
                </p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <Clock className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Terlambat
                </p>
                <p className="text-2xl font-bold">{stats.late}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertTriangle className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Tidak Hadir
                </p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Plane className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Cuti/Izin
                </p>
                <p className="text-2xl font-bold">{stats.leave}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Daftar Karyawan</CardTitle>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama karyawan..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-9 sm:w-64"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="present">Hadir</SelectItem>
                    <SelectItem value="late">Terlambat</SelectItem>
                    <SelectItem value="absent">Tidak Hadir</SelectItem>
                    <SelectItem value="leave">Cuti/Izin</SelectItem>
                    <SelectItem value="holiday">Libur</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={departmentFilter}
                  onValueChange={(v) => {
                    setDepartmentFilter(v)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Semua Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Semua Departemen
                    </SelectItem>
                    {departments.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Foto</TableHead>
                  <SortableHead field="name" onSort={handleSort}>Nama</SortableHead>
                  <SortableHead field="checkIn" onSort={handleSort}>Check In</SortableHead>
                  <SortableHead field="checkOut" onSort={handleSort}>
                    Check Out
                  </SortableHead>
                  <SortableHead field="duration" onSort={handleSort}>Durasi</SortableHead>
                  <SortableHead field="status" onSort={handleSort}>Status</SortableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Selfie</TableHead>
                  <SortableHead field="late" onSort={handleSort}>
                    Keterlambatan
                  </SortableHead>
                  <TableHead>Persetujuan</TableHead>
                  <TableHead>Status Gaji</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Tidak ada data absensi untuk tanggal ini
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => {
                    const approval = approvals[row.attendance.id]
                    const isUnapproved =
                      (row.attendance.status === "present" ||
                        row.attendance.status === "late") &&
                      approval === undefined

                    return (
                      <TableRow
                        key={row.attendance.id}
                        className="cursor-pointer"
                        onClick={() => openDetail(row)}
                      >
                        <TableCell>
                          <Avatar size="sm">
                            <AvatarImage src={row.employee.image || getAvatarUrl(row.employee.name)} />
                            <AvatarFallback>
                              {getInitials(row.employee.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {row.employee.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {row.employee.department}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTime(row.attendance.checkIn)}
                        </TableCell>
                        <TableCell>
                          {formatTime(row.attendance.checkOut)}
                        </TableCell>
                        <TableCell>
                          {formatDuration(
                            row.attendance.workingDuration
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(row.attendance.status)}
                        </TableCell>
                        <TableCell>
                          {row.attendance.checkInLocation ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex max-w-[120px] cursor-help items-center gap-1 truncate text-sm text-muted-foreground">
                                  <MapPin className="size-3 shrink-0" />
                                  {getShortAddress(
                                    row.attendance.checkInLocation
                                      .address
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {
                                  row.attendance.checkInLocation
                                    .address
                                }
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.attendance.checkInPhoto ? (
                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                              <Camera className="size-4 text-muted-foreground" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.attendance.isLate &&
                          row.attendance.lateMinutes > 0 ? (
                            <span className="text-sm font-medium text-yellow-600">
                              {row.attendance.lateMinutes} mnt
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {isUnapproved ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() =>
                                  handleApprove(row.attendance.id)
                                }
                              >
                                <CheckCircle className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() =>
                                  handleReject(row.attendance.id)
                                }
                              >
                                <XCircle className="size-4" />
                              </Button>
                            </div>
                          ) : approval !== undefined ? (
                            <Badge
                              variant="outline"
                              className={
                                approval
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }
                            >
                              {approval ? "Disetujui" : "Ditolak"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {((row.attendance.status === "present" || row.attendance.status === "late") &&
                            row.attendance.checkIn &&
                            !row.attendance.checkOut) ? (
                            <Badge
                              variant="outline"
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              <Snowflake className="size-3" />
                              Dibekukan
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              Normal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openDetail(row)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Menampilkan{" "}
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    sortedRows.length
                  )}{" "}
                  dari {sortedRows.length} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .reduce<(number | "ellipsis")[]>(
                      (acc, page, i, arr) => {
                        if (
                          i > 0 &&
                          page - (arr[i - 1] as number) > 1
                        ) {
                          acc.push("ellipsis")
                        }
                        acc.push(page)
                        return acc
                      },
                      []
                    )
                    .map((item, i) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-1 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={
                            currentPage === item
                              ? "default"
                              : "outline"
                          }
                          size="icon-sm"
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </Button>
                      )
                    )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detail Absensi</DialogTitle>
              <DialogDescription>
                Informasi lengkap kehadiran karyawan
              </DialogDescription>
            </DialogHeader>
            {selectedRow && (
              <div className="space-y-6">
                    <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    <AvatarImage src={selectedRow.employee.image || getAvatarUrl(selectedRow.employee.name)} />
                    <AvatarFallback>
                      {getInitials(selectedRow.employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedRow.employee.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRow.employee.position} -{" "}
                      {selectedRow.employee.department}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      NIK: {selectedRow.employee.nik}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Tanggal
                    </p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(selectedRow.attendance.date),
                        "dd MMMM yyyy",
                        { locale: id }
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Status
                    </p>
                    {getStatusBadge(selectedRow.attendance.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Check In
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(selectedRow.attendance.checkIn)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Check Out
                    </p>
                    <p className="text-sm font-medium">
                      {formatTime(selectedRow.attendance.checkOut)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Durasi Kerja
                    </p>
                    <p className="text-sm font-medium">
                      {formatDuration(
                        selectedRow.attendance.workingDuration
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Keterlambatan
                    </p>
                    <p className="text-sm font-medium">
                      {selectedRow.attendance.lateMinutes > 0
                        ? `${selectedRow.attendance.lateMinutes} menit`
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Foto Check In/Out
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Foto Check In
                      </p>
                      <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed bg-muted/50">
                        <div className="text-center">
                          <Camera className="mx-auto size-8 text-muted-foreground/50" />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Foto absen masuk
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Foto Check Out
                      </p>
                      <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed bg-muted/50">
                        <div className="text-center">
                          <Camera className="mx-auto size-8 text-muted-foreground/50" />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Foto absen keluar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRow.attendance.checkInLocation && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Lokasi GPS
                    </p>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {
                              selectedRow.attendance.checkInLocation
                                .address
                            }
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Lat:{" "}
                            {selectedRow.attendance.checkInLocation.latitude.toFixed(
                              6
                            )}{" "}
                            | Lng:{" "}
                            {selectedRow.attendance.checkInLocation.longitude.toFixed(
                              6
                            )}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${selectedRow.attendance.checkInLocation.latitude},${selectedRow.attendance.checkInLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                          >
                            Buka di Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRow.attendance.notes && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Catatan</p>
                    <p className="rounded-xl bg-muted/50 p-3 text-sm">
                      {selectedRow.attendance.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDetailOpen(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
