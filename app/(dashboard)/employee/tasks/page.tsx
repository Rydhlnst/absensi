"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  MapPin,
  Phone,
  MessageCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  User,
  FileText,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { tasks } from "@/data/mock"
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types"

const CURRENT_EMPLOYEE_ID = "emp-003"

const categoryColors: Record<TaskCategory, string> = {
  installation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  billing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  repair: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  inspection: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

const categoryLabels: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Billing",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Urgent",
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  in_progress: {
    label: "Dikerjakan",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Selesai",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
  on_hold: {
    label: "Ditunda",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
}

function TaskCard({ task }: { task: Task }) {
  const isCompleted = task.status === "completed"
  const status = statusConfig[task.status]

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={categoryColors[task.category]}>
            {categoryLabels[task.category]}
          </Badge>
          <Badge variant="secondary">
            <Star className="size-3" />
            {task.rewardPoints} poin
          </Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="size-3.5" />
            {task.customerName}
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {task.address}
              {task.addressDetail && `, ${task.addressDetail}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3.5" />
            {task.customerPhone}
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {task.description}
        </p>

        {isCompleted && task.completedAt && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Selesai:{" "}
              {format(new Date(task.completedAt), "dd MMM yyyy, HH:mm", {
                locale: id,
              })}
            </span>
            {task.startedAt && (
              <span>
                Durasi:{" "}
                {Math.round(
                  (new Date(task.completedAt).getTime() -
                    new Date(task.startedAt).getTime()) /
                    60000
                )}{" "}
                mnt
              </span>
            )}
          </div>
        )}

        {!isCompleted && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="outline">
              <FileText className="size-3.5" />
              Detail
            </Button>
            {task.status === "pending" && (
              <Button size="sm">
                <Clock className="size-3.5" />
                Mulai Tugas
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <a
                href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="size-3.5" />
                Maps
              </a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
            >
              <a
                href={`https://wa.me/${task.customerPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${task.customerPhone}`}>
                <Phone className="size-3.5" />
                Telepon
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function EmployeeTasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("priority")
  const [dialogOpen, setDialogOpen] = useState(false)

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedTo === CURRENT_EMPLOYEE_ID),
    []
  )

  const activeTasks = useMemo(
    () => myTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [myTasks]
  )

  const completedTasks = useMemo(
    () => myTasks.filter((t) => t.status === "completed"),
    [myTasks]
  )

  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  const filterAndSort = (taskList: Task[]) => {
    let filtered = taskList

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    const sorted = [...filtered]
    switch (sortBy) {
      case "priority":
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        break
      case "date":
        sorted.sort(
          (a, b) =>
            new Date(b.workingDate).getTime() - new Date(a.workingDate).getTime()
        )
        break
      case "status":
        sorted.sort((a, b) => {
          const order: Record<TaskStatus, number> = {
            in_progress: 0,
            pending: 1,
            on_hold: 2,
            completed: 3,
            cancelled: 4,
          }
          return order[a.status] - order[b.status]
        })
        break
    }

    return sorted
  }

  const filteredActive = useMemo(
    () => filterAndSort(activeTasks),
    [activeTasks, searchQuery, categoryFilter, sortBy]
  )

  const filteredCompleted = useMemo(
    () => filterAndSort(completedTasks),
    [completedTasks, searchQuery, categoryFilter, sortBy]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tugas Saya</h1>
          <p className="text-muted-foreground">
            {activeTasks.length} tugas aktif, {completedTasks.length} selesai
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Buat Tugas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Tugas Baru</DialogTitle>
              <DialogDescription>
                Form pembuatan tugas baru akan tersedia di sini.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari tugas..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SlidersHorizontal className="size-4" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="installation">Instalasi</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="repair">Perbaikan</SelectItem>
                <SelectItem value="inspection">Inspeksi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Prioritas</SelectItem>
                <SelectItem value="date">Tanggal</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Aktif ({filteredActive.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Selesai ({filteredCompleted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {filteredActive.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <FileText className="size-10" />
                <p>Tidak ada tugas aktif</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredActive.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {filteredCompleted.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <FileText className="size-10" />
                <p>Tidak ada tugas selesai</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCompleted.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
