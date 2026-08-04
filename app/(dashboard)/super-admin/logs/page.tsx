"use client"

import { useState, useMemo, useEffect } from "react"
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
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { AdminTableSkeleton } from "@/components/skeletons"
import { getAvatarUrl } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LogEntry {
  id: string
  userId: string | null
  userName: string | null
  userImage: string | null
  type: string
  detail: string | null
  ipAddress: string | null
  timestamp: string
}

const ITEMS_PER_PAGE = 10

const typeConfig: Record<string, { label: string; color: string; icon: typeof LogIn }> = {
  login: { label: "Login", color: "bg-green-100 text-green-700", icon: LogIn },
  logout: { label: "Logout", color: "bg-slate-100 text-slate-700", icon: LogOut },
  task_update: { label: "Task Update", color: "bg-blue-100 text-blue-700", icon: CheckSquare },
  attendance: { label: "Absensi", color: "bg-orange-100 text-orange-700", icon: ClipboardList },
  settings_change: { label: "Settings", color: "bg-purple-100 text-purple-700", icon: Settings },
  task: { label: "Tugas", color: "bg-blue-100 text-blue-700", icon: CheckSquare },
  reward: { label: "Reward", color: "bg-warning/20 text-warning", icon: Settings },
  system: { label: "Sistem", color: "bg-purple-100 text-purple-700", icon: Settings },
  warning: { label: "Peringatan", color: "bg-red-100 text-red-700", icon: Settings },
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<LogEntry[]>("/api/system-logs", { limit: "200" })
        if (!cancelled) setLogs(data)
      } catch (e: unknown) {
        const err = e instanceof Error ? e : null
        if (!cancelled) toast.error(err?.message || "Gagal memuat log")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredLogs = useMemo(() => {
    let result = logs
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.detail?.toLowerCase().includes(q) ||
          l.userName?.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== "all") {
      result = result.filter((l) => l.type === typeFilter)
    }
    return result
  }, [logs, search, typeFilter])

  const handleClearLogs = async () => {
    setClearing(true)
    try {
      await apiClient.delete("/api/system-logs")
      setLogs([])
      toast.success("Semua log berhasil dihapus")
      setClearDialogOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus log")
    } finally {
      setClearing(false)
    }
  }

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  if (loading) {
    return <AdminTableSkeleton rows={8} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Log Sistem</h1>
          <p className="text-muted-foreground">Riwayat aktivitas sistem</p>
        </div>
        {logs.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setClearDialogOpen(true)}>
            <Trash2 className="size-4" />
            Hapus Semua Log
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari aktivitas, user..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="task">Tugas</SelectItem>
                <SelectItem value="attendance">Absensi</SelectItem>
                <SelectItem value="reward">Reward</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
                <SelectItem value="warning">Peringatan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada log aktivitas
            </p>
          ) : (
            <div className="space-y-2">
              {paginatedLogs.map((log) => {
                const config = typeConfig[log.type] || typeConfig.system
                const Icon = config.icon
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-xl border border-border p-3"
                  >
                    {log.userImage || log.userName ? (
                      <Avatar size="sm">
                        <AvatarImage src={log.userImage || (log.userName ? getAvatarUrl(log.userName) : "")} />
                        <AvatarFallback>{getInitials(log.userName || "?")}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`flex size-9 items-center justify-center rounded-full ${config.color}`}>
                        <Icon className="size-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={config.color}>{config.label}</Badge>
                        {log.userName && <span className="text-sm font-semibold">{log.userName}</span>}
                      </div>
                      <p className="text-sm text-foreground">{log.detail}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(log.timestamp), "dd MMM yyyy HH:mm:ss", { locale: id })}
                        {log.ipAddress && ` · ${log.ipAddress}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Log?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus semua log aktivitas secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClearLogs} disabled={clearing}>
              {clearing ? "Menghapus..." : "Hapus Semua"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
