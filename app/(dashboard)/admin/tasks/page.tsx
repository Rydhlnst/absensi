"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tasks as initialTasks, employees } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types"

type SortField = "title" | "category" | "priority" | "status" | "workingDate" | "rewardPoints"
type SortDirection = "asc" | "desc"

const ITEMS_PER_PAGE = 10

const categoryLabels: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Penagihan",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const categoryColors: Record<TaskCategory, string> = {
  installation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  billing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  repair: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  inspection: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Mendesak",
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabels: Record<TaskStatus, string> = {
  pending: "Tertunda",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  on_hold: "Ditangguhkan",
}

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  on_hold: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
}

interface TaskFormState {
  category: TaskCategory | ""
  rewardPoints: string
  customerName: string
  customerPhone: string
  address: string
  addressDetail: string
  latitude: string
  longitude: string
  description: string
  assignedTo: string
  priority: TaskPriority | ""
  workingDate: string
}

const emptyForm: TaskFormState = {
  category: "",
  rewardPoints: "",
  customerName: "",
  customerPhone: "",
  address: "",
  addressDetail: "",
  latitude: "",
  longitude: "",
  description: "",
  assignedTo: "",
  priority: "",
  workingDate: "",
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function TaskManagementPage() {
  const { data: session } = authClient.useSession()
  const [taskList, setTaskList] = useState<Task[]>(initialTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [technicianFilter, setTechnicianFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("workingDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskFormState>({ ...emptyForm })

  const technicians = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.position === "Teknisi" ||
          e.position === "Driver" ||
          e.position === "Supervisor"
      ),
    []
  )

  const stats = useMemo(() => {
    const total = taskList.length
    const pending = taskList.filter((t) => t.status === "pending").length
    const inProgress = taskList.filter((t) => t.status === "in_progress").length
    const completed = taskList.filter((t) => t.status === "completed").length
    const cancelled = taskList.filter((t) => t.status === "cancelled").length
    return { total, pending, inProgress, completed, cancelled }
  }, [taskList])

  const filteredTasks = useMemo(() => {
    let result = taskList

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    if (technicianFilter !== "all") {
      result = result.filter((t) => t.assignedTo === technicianFilter)
    }

    return result
  }, [taskList, searchQuery, categoryFilter, statusFilter, priorityFilter, technicianFilter])

  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    sorted.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title)
          break
        case "category":
          cmp = a.category.localeCompare(b.category)
          break
        case "priority": {
          const order: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
          cmp = order[a.priority] - order[b.priority]
          break
        }
        case "status":
          cmp = a.status.localeCompare(b.status)
          break
        case "workingDate":
          cmp = a.workingDate.localeCompare(b.workingDate)
          break
        case "rewardPoints":
          cmp = a.rewardPoints - b.rewardPoints
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
    return sorted
  }, [filteredTasks, sortField, sortDirection])

  const totalPages = Math.ceil(sortedTasks.length / ITEMS_PER_PAGE)
  const paginatedTasks = sortedTasks.slice(
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

  const handleFormChange = (key: keyof TaskFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreate = () => {
    const newTask: Task = {
      id: `task-${String(taskList.length + 1).padStart(3, "0")}`,
      title: categoryLabels[form.category as TaskCategory] || "Tugas Baru",
      category: (form.category as TaskCategory) || "installation",
      priority: (form.priority as TaskPriority) || "medium",
      status: "pending",
      customerId: `cust-new-${Date.now()}`,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      address: form.address,
      addressDetail: form.addressDetail,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      description: form.description,
      assignedTo: form.assignedTo || null,
      assignedBy: session?.user?.id || "",
      rewardPoints: parseInt(form.rewardPoints) || 0,
      attachments: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      workingDate: form.workingDate,
      estimatedDuration: 120,
    }
    setTaskList((prev) => [newTask, ...prev])
    setForm(emptyForm)
    setCreateOpen(false)
    setCurrentPage(1)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setTaskList((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleteOpen(false)
    const newTotal = Math.ceil((sortedTasks.length - 1) / ITEMS_PER_PAGE)
    if (currentPage > newTotal && newTotal > 0) {
      setCurrentPage(newTotal)
    }
  }

  const getEmployeeName = (employeeId: string | null): string => {
    if (!employeeId) return "-"
    const emp = employees.find((e) => e.id === employeeId)
    return emp?.name || "-"
  }

  const SortableHead = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="size-3 text-muted-foreground" />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Tugas</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau seluruh tugas teknisi
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Buat Tugas
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <ListTodo className="size-5" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tugas</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-xs text-muted-foreground">Tertunda</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <PlayCircle className="size-5" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dikerjakan</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="size-5" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dibatalkan</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari tugas, pelanggan, deskripsi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="installation">Instalasi</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="billing">Penagihan</SelectItem>
                <SelectItem value="repair">Perbaikan</SelectItem>
                <SelectItem value="inspection">Inspeksi</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="pending">Tertunda</SelectItem>
                <SelectItem value="in_progress">Dikerjakan</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                <SelectItem value="on_hold">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                setPriorityFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Semua Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Prioritas</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="urgent">Mendesak</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={technicianFilter}
              onValueChange={(v) => {
                setTechnicianFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Semua Teknisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Teknisi</SelectItem>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead field="title">Judul</SortableHead>
                <SortableHead field="category">Kategori</SortableHead>
                <SortableHead field="priority">Prioritas</SortableHead>
                <SortableHead field="status">Status</SortableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead>Pelanggan</TableHead>
                <SortableHead field="workingDate">Tanggal</SortableHead>
                <SortableHead field="rewardPoints">Reward</SortableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Tidak ada data tugas
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <p className="font-medium">{task.title}</p>
                      <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={categoryColors[task.category]}
                      >
                        {categoryLabels[task.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={priorityColors[task.priority]}
                      >
                        {priorityLabels[task.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[task.status]}
                      >
                        {statusLabels[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getEmployeeName(task.assignedTo)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{task.customerName}</p>
                        <p className="max-w-[150px] truncate text-xs text-muted-foreground">
                          {task.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(task.workingDate), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {formatRupiah(task.rewardPoints * 1000)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setDeleteTarget(task)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, sortedTasks.length)}{" "}
                dari {sortedTasks.length} data
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      if (i > 0 && page - (arr[i - 1] as number) > 1) {
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
                        variant={currentPage === item ? "default" : "outline"}
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
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Tugas Baru</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk membuat tugas baru
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori Tugas</label>
              <Select
                value={form.category}
                onValueChange={(v) => handleFormChange("category", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installation">Instalasi</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="billing">Penagihan</SelectItem>
                  <SelectItem value="repair">Perbaikan</SelectItem>
                  <SelectItem value="inspection">Inspeksi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Poin Reward</label>
              <Input
                type="number"
                placeholder="0"
                value={form.rewardPoints}
                onChange={(e) => handleFormChange("rewardPoints", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Pelanggan</label>
              <Input
                placeholder="Masukkan nama pelanggan"
                value={form.customerName}
                onChange={(e) => handleFormChange("customerName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">No. Telepon</label>
              <Input
                placeholder="08xxxxxxxxxx"
                value={form.customerPhone}
                onChange={(e) =>
                  handleFormChange("customerPhone", e.target.value)
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Alamat Utama</label>
              <Input
                placeholder="Jl. ..."
                value={form.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Detail Alamat</label>
              <Textarea
                placeholder="Detail alamat (Lt. 2, Gedung Plaza, dll)"
                value={form.addressDetail}
                onChange={(e) =>
                  handleFormChange("addressDetail", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="any"
                placeholder="-6.2297"
                value={form.latitude}
                onChange={(e) => handleFormChange("latitude", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="any"
                placeholder="106.8197"
                value={form.longitude}
                onChange={(e) => handleFormChange("longitude", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                placeholder="Deskripsi tugas..."
                value={form.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Teknisi</label>
              <Select
                value={form.assignedTo}
                onValueChange={(v) => handleFormChange("assignedTo", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih teknisi" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioritas</label>
              <Select
                value={form.priority}
                onValueChange={(v) => handleFormChange("priority", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="urgent">Mendesak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Tanggal Kerja</label>
              <Input
                type="date"
                value={form.workingDate}
                onChange={(e) =>
                  handleFormChange("workingDate", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setForm(emptyForm)
                setCreateOpen(false)
              }}
            >
              Batal
            </Button>
            <Button onClick={handleCreate}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Tugas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tugas &quot;{deleteTarget?.title}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
