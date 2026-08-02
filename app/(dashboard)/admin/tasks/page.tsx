"use client"

import { useState, useMemo, useEffect } from "react"
import { MapPin, Pencil, Eye, Trash2, Loader2, Plus, Phone, Home, FileText, Map } from "lucide-react"
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
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import type { Task, TaskCategory, TaskPriority } from "@/types"

const categoryLabels: Record<TaskCategory, string> = {
  installation: "PEMASANGAN",
  maintenance: "MAINTENANCE",
  billing: "TAGIHAN",
  repair: "GANGGUAN",
  inspection: "INSPEKSI",
}

const categoryColors: Record<TaskCategory, string> = {
  installation: "bg-blue-600 text-white",
  maintenance: "bg-purple-600 text-white",
  billing: "bg-yellow-500 text-white",
  repair: "bg-red-600 text-white",
  inspection: "bg-teal-600 text-white",
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

interface EmployeeLite {
  id: string
  name: string
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1)
  if (cleaned.startsWith("62")) return cleaned
  return "62" + cleaned
}

function TaskCard({
  task,
  creatorName,
  onEdit,
  onDelete,
}: {
  task: Task
  creatorName?: string
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  const mapsUrl = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`
  const catColor = categoryColors[task.category]
  const phoneNumber = formatPhone(task.customerPhone || "")
  const waUrl = `https://wa.me/${phoneNumber}`
  const telUrl = `tel:${phoneNumber}`

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden mb-3">
      <div className="px-4 py-3 flex items-center justify-center gap-3 bg-gray-50 border-b border-gray-200">
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold tracking-wider ${catColor}`}>
          {categoryLabels[task.category]}
        </span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 border border-green-200">
          +{task.rewardPoints} Poin
        </span>
      </div>

      <div className="px-4 py-1.5 text-center text-xs text-gray-500 border-b border-gray-100">
        <p>
          Pembuat Tugas: <span className="font-bold text-gray-700">{creatorName || "Admin"}</span>
        </p>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="size-4 text-red-500 shrink-0" />
            <p className="text-sm min-w-0">
              <span className="font-semibold text-gray-900">Alamat:</span>{" "}
              <span className="font-bold text-gray-900 truncate">{task.address}</span>
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
          >
            <span className="text-blue-500"><Map className="size-3.5 inline" /></span> Google Maps
          </a>
        </div>

        <div className="flex items-start gap-2">
          <Home className="size-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-semibold text-gray-900">Detail Alamat:</span>{" "}
            <span className="text-gray-700">{task.addressDetail || "-"}</span>
          </p>
        </div>

        {task.customerPhone && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="size-4 text-green-600 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold text-gray-900">Telp/WA:</span>{" "}
                <span className="font-bold text-gray-900">{task.customerPhone}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-[11px] font-bold text-white hover:bg-green-600"
              >
                WhatsApp
              </a>
              <a
                href={telUrl}
                className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-600"
              >
                Telepon
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <FileText className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-semibold text-gray-900">Keterangan Tugas:</span>{" "}
            <span className="text-gray-700">{task.description}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-gray-200">
        <button
          onClick={() => toast.info(`Detail: ${task.title}`)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 border-r border-gray-200"
        >
          <Eye className="size-4" />
          Detail
        </button>
        <button
          onClick={() => onEdit(task)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 border-r border-gray-200"
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
  const [taskList, setTaskList] = useState<Task[]>([])
  const [employees, setEmployees] = useState<EmployeeLite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "done">("active")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskForm>(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasks, emps] = await Promise.all([
        apiClient.get<Task[]>("/api/tasks"),
        apiClient.get<EmployeeLite[]>("/api/employees", { role: "employee" }),
      ])
      setTaskList(tasks)
      setEmployees(emps)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [tasks, emps] = await Promise.all([
          apiClient.get<Task[]>("/api/tasks"),
          apiClient.get<EmployeeLite[]>("/api/employees", { role: "employee" }),
        ])
        if (!cancelled) {
          setTaskList(tasks)
          setEmployees(emps)
        }
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const technicians = employees

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
      customerName: task.customerName || "",
      customerPhone: task.customerPhone || "",
      address: task.address || "",
      addressDetail: task.addressDetail || "",
      latitude: String(task.latitude || ""),
      longitude: String(task.longitude || ""),
      description: task.description || "",
      assignedTo: task.assignedTo || "",
      priority: task.priority,
      workingDate: task.workingDate || "",
    })
    setCreateOpen(true)
  }

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast.error("Sesi tidak valid")
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        rewardPoints: parseInt(form.rewardPoints) || 0,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
        assignedTo: form.assignedTo || null,
      }

      if (editingTask) {
        await apiClient.put("/api/tasks", { id: editingTask.id, ...payload })
        toast.success("Tugas berhasil diubah")
      } else {
        await apiClient.post("/api/tasks", {
          ...payload,
          title: categoryLabels[form.category],
          status: "pending",
          assignedBy: session.user.id,
        })
        toast.success("Tugas berhasil dibuat")
      }
      setCreateOpen(false)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan tugas")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiClient.delete(`/api/tasks?id=${deleteTarget.id}`)
      toast.success("Tugas berhasil dihapus")
      setDeleteTarget(null)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus tugas")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="pb-24">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
              activeTab === "active"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Belum Selesai
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
              activeTab === "done"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Selesai
          </button>
        </div>

        {displayTasks.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-200">
            Tidak ada tugas
          </div>
        ) : (
          displayTasks.map((task) => {
            const creator = employees.find((e) => e.id === task.assignedBy)
            return (
              <TaskCard
                key={task.id}
                task={task}
                creatorName={creator?.name}
                onEdit={openEdit}
                onDelete={(t) => setDeleteTarget(t)}
              />
            )
          })
        )}
      </div>

      <button
        onClick={openCreate}
        className="fixed bottom-6 right-5 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
      >
        <Plus className="size-6" />
      </button>

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
              <Input type="number" value={form.rewardPoints} onChange={(e) => setForm((f) => ({ ...f, rewardPoints: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Nama Pelanggan</Label>
              <Input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">No. Telepon/WA Pelanggan</Label>
              <Input value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} placeholder="08xxx" />
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
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Menyimpan...</> : editingTask ? "Simpan" : "Buat Tugas"}
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
