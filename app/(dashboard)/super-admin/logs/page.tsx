"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  CheckSquare,
  ClipboardList,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { employees } from "@/data/mock"

type LogType = "login" | "logout" | "task_update" | "attendance" | "settings_change"

interface LogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  type: LogType
  detail: string
  ipAddress: string
}

const logEntries: LogEntry[] = [
  { id: "log-001", timestamp: "2026-07-31T08:00:12.000Z", userId: "emp-001", userName: "Ahmad Rizky Pratama", type: "login", detail: "Login berhasil dari perangkat Android", ipAddress: "192.168.1.101" },
  { id: "log-002", timestamp: "2026-07-31T08:01:45.000Z", userId: "emp-003", userName: "Budi Santoso", type: "attendance", detail: "Check-in di lokasi kantor", ipAddress: "10.0.0.55" },
  { id: "log-003", timestamp: "2026-07-31T08:05:30.000Z", userId: "emp-002", userName: "Siti Nurhaliza", type: "login", detail: "Login berhasil dari perangkat Web", ipAddress: "192.168.1.102" },
  { id: "log-004", timestamp: "2026-07-31T08:10:00.000Z", userId: "emp-005", userName: "Eko Prasetyo", type: "attendance", detail: "Check-in terlambat 10 menit", ipAddress: "10.0.0.60" },
  { id: "log-005", timestamp: "2026-07-31T08:15:22.000Z", userId: "emp-001", userName: "Ahmad Rizky Pratama", type: "task_update", detail: "Tugas \"Pemasangan Router WiFi\" ditugaskan ke Budi Santoso", ipAddress: "192.168.1.101" },
  { id: "log-006", timestamp: "2026-07-31T08:20:10.000Z", userId: "emp-004", userName: "Dewi Anggraini", type: "login", detail: "Login berhasil dari perangkat iOS", ipAddress: "10.0.0.70" },
  { id: "log-007", timestamp: "2026-07-31T08:30:00.000Z", userId: "emp-001", userName: "Ahmad Rizky Pratama", type: "settings_change", detail: "Mengubah radius GPS dari 100m menjadi 150m", ipAddress: "192.168.1.101" },
  { id: "log-008", timestamp: "2026-07-31T09:00:15.000Z", userId: "emp-007", userName: "Gilang Ramadhan", type: "attendance", detail: "Check-in di lokasi kantor", ipAddress: "10.0.0.80" },
  { id: "log-009", timestamp: "2026-07-31T09:10:30.000Z", userId: "emp-009", userName: "Indra Kusuma", type: "task_update", detail: "Tugas \"Maintenance Server Bulanan\" status diubah menjadi In Progress", ipAddress: "10.0.0.90" },
  { id: "log-010", timestamp: "2026-07-31T09:15:45.000Z", userId: "emp-010", userName: "Joko Widodo", type: "login", detail: "Login berhasil dari perangkat Android", ipAddress: "10.0.0.95" },
  { id: "log-011", timestamp: "2026-07-31T09:20:00.000Z", userId: "emp-002", userName: "Siti Nurhaliza", type: "task_update", detail: "Tugas \"Instalasi CCTV 4 Channel\" ditugaskan ke Dewi Anggraini", ipAddress: "192.168.1.102" },
  { id: "log-012", timestamp: "2026-07-31T09:30:10.000Z", userId: "emp-014", userName: "Nugroho Adi", type: "attendance", detail: "Check-in di lokasi kantor", ipAddress: "10.0.0.100" },
  { id: "log-013", timestamp: "2026-07-31T09:45:20.000Z", userId: "emp-001", userName: "Ahmad Rizky Pratama", type: "settings_change", detail: "Mengubah jam kerja dari 08:00-17:00 menjadi 08:00-17:30", ipAddress: "192.168.1.101" },
  { id: "log-014", timestamp: "2026-07-31T10:00:00.000Z", userId: "emp-012", userName: "Lukman Hakim", type: "login", detail: "Login berhasil dari perangkat Android", ipAddress: "10.0.0.110" },
  { id: "log-015", timestamp: "2026-07-31T10:15:30.000Z", userId: "emp-019", userName: "Saptono Putra", type: "task_update", detail: "Tugas \"Pengecekan Firewall\" status diubah menjadi Completed", ipAddress: "10.0.0.120" },
  { id: "log-016", timestamp: "2026-07-31T10:30:45.000Z", userId: "emp-008", userName: "Hana Permata", type: "attendance", detail: "Check-in di lokasi kantor", ipAddress: "10.0.0.85" },
  { id: "log-017", timestamp: "2026-07-31T10:45:00.000Z", userId: "emp-001", userName: "Ahmad Rizky Pratama", type: "logout", detail: "Logout dari sistem", ipAddress: "192.168.1.101" },
  { id: "log-018", timestamp: "2026-07-31T11:00:15.000Z", userId: "emp-022", userName: "Vita Anggraeni", type: "login", detail: "Login berhasil dari perangkat Web", ipAddress: "10.0.0.130" },
  { id: "log-019", timestamp: "2026-07-31T11:15:30.000Z", userId: "emp-027", userName: "Ahmad Fauzi", type: "task_update", detail: "Tugas \"Pemasangan Alarm Anti Pencurian\" ditugaskan ke Ahmad Fauzi", ipAddress: "10.0.0.140" },
  { id: "log-020", timestamp: "2026-07-31T11:30:45.000Z", userId: "emp-003", userName: "Budi Santoso", type: "logout", detail: "Logout dari sistem", ipAddress: "10.0.0.55" },
]

const ITEMS_PER_PAGE = 10

const typeConfig: Record<LogType, { label: string; color: string; icon: typeof LogIn }> = {
  login: { label: "Login", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: LogIn },
  logout: { label: "Logout", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: LogOut },
  task_update: { label: "Task Update", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckSquare },
  attendance: { label: "Absensi", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: ClipboardList },
  settings_change: { label: "Settings", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Settings },
}

export default function SystemLogsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredLogs = useMemo(() => {
    return logEntries.filter((log) => {
      if (typeFilter !== "all" && log.type !== typeFilter) return false
      if (dateFilter) {
        const logDate = format(new Date(log.timestamp), "yyyy-MM-dd")
        if (logDate !== dateFilter) return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          log.userName.toLowerCase().includes(query) ||
          log.detail.toLowerCase().includes(query) ||
          log.ipAddress.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [typeFilter, dateFilter, searchQuery])

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          Pantau semua aktivitas dan perubahan dalam sistem
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Log Aktivitas</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari log..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 w-56"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="task_update">Task Update</SelectItem>
                  <SelectItem value="attendance">Absensi</SelectItem>
                  <SelectItem value="settings_change">Settings Change</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-44"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">Tidak ada log ditemukan</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => {
                  const config = typeConfig[log.type]
                  const Icon = config.icon
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{log.userName}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Icon className="size-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {log.detail}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress}
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
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} dari{" "}
                {filteredLogs.length} log
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
