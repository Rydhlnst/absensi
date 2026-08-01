"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { tasks } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import type { TaskCategory, TaskStatus } from "@/types"

const categoryColor: Record<TaskCategory, string> = {
  installation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  billing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  repair: "bg-red-500/10 text-red-600 border-red-500/20",
  inspection: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
}

const statusColor: Record<TaskStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const categoryLabel: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Billing",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const statusLabel: Record<TaskStatus, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  on_hold: "Ditunda",
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return "N/A"
  const diff = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.round(diff / 60000)
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

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

export default function TaskHistoryPage() {
  const { data: session } = authClient.useSession()
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")

  const currentEmployeeId = session?.user?.id || ""

  const myTasks = useMemo(() => {
    return tasks
      .filter((t) => t.assignedTo === currentEmployeeId)
      .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
      .filter((t) => statusFilter === "all" || t.status === statusFilter)
      .filter((t) => {
        if (!dateStart || !dateEnd) return true
        const d = new Date(t.workingDate)
        return d >= new Date(dateStart) && d <= new Date(dateEnd + "T23:59:59.999")
      })
      .sort(
        (a, b) =>
          new Date(b.workingDate).getTime() - new Date(a.workingDate).getTime()
      )
  }, [categoryFilter, statusFilter, dateStart, dateEnd])

  const summary = useMemo(() => {
    const completed = myTasks.filter((t) => t.status === "completed")
    const totalRewards = myTasks
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.rewardPoints, 0)
    return {
      total: myTasks.length,
      completed: completed.length,
      totalRewards,
    }
  }, [myTasks])

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tugas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="all">Semua Kategori</option>
              <option value="installation">Instalasi</option>
              <option value="maintenance">Maintenance</option>
              <option value="billing">Billing</option>
              <option value="repair">Perbaikan</option>
              <option value="inspection">Inspeksi</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="in_progress">Dikerjakan</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="on_hold">Ditunda</option>
            </select>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              placeholder="Dari"
              className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              placeholder="Sampai"
              className="flex h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tugas</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      Tidak ada data tugas
                    </TableCell>
                  </TableRow>
                ) : (
                  myTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${categoryColor[task.category]}`}
                        >
                          {categoryLabel[task.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(task.workingDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColor[task.status]}`}
                        >
                          {statusLabel[task.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDuration(task.startedAt, task.completedAt)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {task.status === "completed"
                          ? formatRupiah(task.rewardPoints * 100)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total Tugas:</span>
              <span className="font-medium">{summary.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Selesai:</span>
              <span className="font-medium">{summary.completed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total Reward:</span>
              <span className="font-medium">{formatRupiah(summary.totalRewards * 100)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
