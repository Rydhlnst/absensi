"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { AdminTableSkeleton } from "@/components/skeletons"
import { toast } from "sonner"
import EmptyState from "@/components/empty-state"

const ITEMS_PER_PAGE = 15

interface Task {
  id: string
  title: string
  address?: string
  assignedTo?: string
  priority: string
  status: string
  rewardPoints?: number
}

interface Employee {
  id: string
  name: string
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  on_hold: "Ditunda",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
  on_hold: "secondary",
}

const priorityLabel: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Mendesak",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
}

export default function SuperAdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [t, e] = await Promise.all([
          apiClient.get<Task[]>("/api/tasks"),
          apiClient.get<Employee[]>("/api/employees"),
        ])
        if (!cancelled) {
          setTasks(t)
          setEmployees(e)
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e : null
        if (!cancelled) toast.error(err?.message || "Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of employees) {
      map.set(e.id, e.name)
    }
    return map
  }, [employees])

  const filteredTasks = useMemo(() => {
    let result = tasks
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.address?.toLowerCase().includes(q) ||
          employeeMap.get(t.assignedTo || "")?.toLowerCase().includes(q)
      )
    }
    return result
  }, [tasks, search, employeeMap])

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE)
  const paginatedTasks = filteredTasks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  if (loading) {
    return <AdminTableSkeleton rows={8} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="size-6" />
            Semua Tugas
          </h1>
          <p className="text-muted-foreground">Monitor semua tugas di sistem</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 w-72"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedTasks.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Tidak ada tugas ditemukan" description="Tidak ada tugas yang cocok dengan pencarian Anda" />
          ) : (
            <div className="space-y-2">
              {paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-border p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {task.address || "-"} · {employeeMap.get(task.assignedTo || "") || "Belum ditugaskan"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={priorityVariant[task.priority] || "outline"}>
                      {priorityLabel[task.priority] || task.priority}
                    </Badge>
                    <Badge variant={statusVariant[task.status] || "outline"}>
                      {statusLabel[task.status] || task.status}
                    </Badge>
                    {task.rewardPoints != null && task.rewardPoints > 0 && (
                      <span className="text-xs font-bold text-green-600">
                        +{task.rewardPoints}
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
    </div>
  )
}
