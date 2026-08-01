"use client"

import { useState, useMemo } from "react"
import { MapPin, Pencil, Eye, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { tasks as initialTasks, employees } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import type { Task, TaskCategory, TaskPriority } from "@/types"
import { toast } from "sonner"

const categoryLabels: Record<TaskCategory, string> = {
  installation: "PEMASANGAN",
  maintenance: "MAINTENANCE",
  billing: "TAGIHAN",
  repair: "GANGGUAN",
  inspection: "INSPEKSI",
}

const categoryBannerBg: Record<TaskCategory, string> = {
  installation: "bg-blue-600",
  maintenance: "bg-purple-600",
  billing: "bg-yellow-500",
  repair: "bg-red-600",
  inspection: "bg-teal-600",
}

interface TaskForm {
  category: TaskCategory
  rewardPoints: string
  customerName: string
  customerPhone: string
  address: string
  addressDetail: string
  latitude: string
  longitude: string
  description: string
  assignedTo: string
  priority: TaskPriority
  workingDate: string
}

const defaultForm: TaskForm = {
  category: "installation",
  rewardPoints: "50",
  customerName: "",
  customerPhone: "",
  address: "",
  addressDetail: "",
  latitude: "",
  longitude: "",
  description: "",
  assignedTo: "",
  priority: "medium",
  workingDate: "",
}

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  const mapsUrl = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`
  const assignee = employees.find((e) => e.id === task.assignedTo)

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden mb-3">
      {/* Category banner */}
      <div className={`${categoryBannerBg[task.category]} flex items-center justify-between px-4 py-2.5`}>
        <span className="text-sm font-bold text-white tracking-wide">
          {categoryLabels[task.category]}
        </span>
        <span className="text-xs font-bold text-green-300">+{task.rewardPoints} Poin</span>
      </div>
      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-500">
          Pembuat Tugas: <span className="font-semibold text-gray-700">Admin</span>
          {assignee && (
            <> · Teknisi: <span className="font-semibold text-gray-700">{assignee.name}</span></>
          )}
        </p>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="size-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm flex-1 min-w-0">
            <span className="font-semibold">Alamat:</span> {task.address}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap">
              🗺 Google Maps
            </span>
          </a>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm shrink-0">🏠</span>
          <p className="text-sm">
            <span className="font-semibold">Detail Alamat:</span> {task.addressDetail || "-"}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm shrink-0">📋</span>
          <p className="text-sm">
            <span className="font-semibold">Keterangan Tugas:</span> {task.description}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 border-t border-gray-100">
        <button
          onClick={() => toast.info(`Detail: ${task.title}`)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 border-r border-gray-100"
        >
          <Eye className="size-4" />
          Detail
        </button>
        <button
          onClick={() => onEdit(task)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 border-r border-gray-100"
        >
          <Pencil className="size-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
          Hapus
        </button>
      </div>
    </div>
  )
}

export default function AdminTasksPage() {
  const { data: session } = authClient.useSession()
  const [taskList, setTaskList] = useState<Task[]>(initialTasks)
  const [activeTab, setActiveTab] = useState<"active" | "done">("active")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskForm>(defaultForm)
  const [loading, setLoading] = useState(false)

  const technicians = useMemo(
    () => employees.filter((e) => e.role === "employee"),
    []
  )

  const activeTasks = useMemo(
    () => taskList.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [taskList]
  )
  const doneTasks = useMemo(
    () => taskList.filter((t) => t.status === "completed"),
    [taskList]
  )

  const displayTasks = activeTab === "active" ? activeTasks : doneTasks

  const openCreate = () => {
    setEditingTask(null)
    setForm(defaultForm)
    setCreateOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setForm({
      category: task.category,
      rewardPoints: String(task.rewardPoints),
      customerName: task.customerName,
      customerPhone: task.customerPhone,
      address: task.address,
      addressDetail: task.addressDetail,
      latitude: String(task.latitude),
      longitude: String(task.longitude),
      description: task.description,
      assignedTo: task.assignedTo || "",
      priority: task.priority,
      workingDate: task.workingDate,
    })
    setCreateOpen(true)
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      if (editingTask) {
        setTaskList((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? {
                  ...t,
                  category: form.category,
                  rewardPoints: parseInt(form.rewardPoints) || 0,
                  customerName: form.customerName,
                  customerPhone: form.customerPhone,
                  address: form.address,
                  addressDetail: form.addressDetail,
                  latitude: parseFloat(form.latitude) || 0,
                  longitude: parseFloat(form.longitude) || 0,
                  description: form.description,
                  assignedTo: form.assignedTo || null,
                  priority: form.priority,
                  workingDate: form.workingDate,
                }
              : t
          )
        )
        toast.success("Tugas berhasil diubah")
      } else {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: categoryLabels[form.category],
          category: form.category,
          priority: form.priority,
          status: "pending",
          customerId: `cust-${Date.now()}`,
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
        toast.success("Tugas berhasil dibuat")
      }
      setCreateOpen(false)
      setLoading(false)
    }, 400)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setTaskList((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success("Tugas berhasil dihapus")
  }

  return (
    <div className="relative min-h-screen">
      <div className="p-0 pb-24">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
              activeTab === "active"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Belum Selesai ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
              activeTab === "done"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Selesai ({doneTasks.length})
          </button>
        </div>

        {/* Task list */}
        {displayTasks.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
            Tidak ada tugas
          </div>
        ) : (
          displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={(t) => setDeleteTarget(t)} />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-5 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg text-2xl z-40 hover:bg-primary/90"
      >
        +
      </button>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Tugas" : "Buat Tugas Baru"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Ubah detail tugas" : "Isi data tugas baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Kategori</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TaskCategory }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Reward Poin</Label>
              <Input
                type="number"
                value={form.rewardPoints}
                onChange={(e) => setForm((f) => ({ ...f, rewardPoints: e.target.value }))}
                placeholder="50"
              />
            </div>
            <div>
              <Label className="text-xs">Nama Pelanggan</Label>
              <Input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">No. Telepon Pelanggan</Label>
              <Input value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Alamat</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Detail Alamat</Label>
              <Input value={form.addressDetail} onChange={(e) => setForm((f) => ({ ...f, addressDetail: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Latitude</Label>
                <Input value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="-6.2297" />
              </div>
              <div>
                <Label className="text-xs">Longitude</Label>
                <Input value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="106.8158" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Keterangan Tugas</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="resize-none" />
            </div>
            <div>
              <Label className="text-xs">Teknisi</Label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">-- Pilih Teknisi --</option>
                {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Tanggal Kerja</Label>
              <Input type="date" value={form.workingDate} onChange={(e) => setForm((f) => ({ ...f, workingDate: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={loading}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Menyimpan...</> : editingTask ? "Simpan" : "Buat Tugas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tugas?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
