"use client"

import { useState, useMemo, useEffect } from "react"
import { MapPin, Eye, Plus, Home, FileText, Map } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { TaskListSkeleton } from "@/components/skeletons"
import type { Task, TaskCategory } from "@/types"
import { toast } from "sonner"

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

const createFormDefault = {
  category: "installation" as TaskCategory,
  address: "",
  addressDetail: "",
  customerPhone: "",
  coordinates: "",
  description: "",
}

interface EmployeeLite {
  id: string
  name: string
}

function TaskCard({ task, creatorName }: { task: Task; creatorName?: string }) {
  const mapsUrl = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`
  const catColor = categoryColors[task.category]

  const handleStartTask = async () => {
    try {
      await apiClient.put(`/api/tasks`, {
        id: task.id,
        status: "in_progress",
        startedAt: new Date().toISOString(),
      })
      toast.success("Tugas dimulai!")
      window.location.reload()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memulai tugas")
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
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

      <div className="p-4 space-y-2.5">
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

        <div className="flex items-start gap-2">
          <FileText className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-semibold text-gray-900">Keterangan Tugas:</span>{" "}
            <span className="text-gray-700">{task.description}</span>
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        <Link
          href={`/employee/tasks/${task.id}`}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Eye className="size-4" />
          Detail
        </Link>
        {(task.status === "pending" || task.status === "in_progress") && (
          <button
            onClick={handleStartTask}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90"
          >
            <span>▶</span>
            Kerjakan Tugas
          </button>
        )}
      </div>
    </div>
  )
}

export default function EmployeeTasksPage() {
  const { data: session } = authClient.useSession()
  const [activeTab, setActiveTab] = useState<"active" | "done">("active")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(createFormDefault)
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<EmployeeLite[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const currentUserId = session?.user?.id || ""

  useEffect(() => {
    if (!currentUserId) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [taskList, empList] = await Promise.all([
          apiClient.get<Task[]>("/api/tasks", { assignedTo: currentUserId }),
          apiClient.get<EmployeeLite[]>("/api/employees", { role: "employee" }),
        ])
        if (!cancelled) {
          setTasks(taskList)
          setEmployees(empList)
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
  }, [currentUserId])

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [tasks]
  )

  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === "completed"),
    [tasks]
  )

  const displayTasks = activeTab === "active" ? activeTasks : doneTasks

  const handleCreate = async () => {
    if (!currentUserId) {
      toast.error("Sesi tidak valid")
      return
    }
    if (!form.address) {
      toast.error("Alamat utama wajib diisi")
      return
    }

    let latitude = 0
    let longitude = 0
    if (form.coordinates) {
      const parts = form.coordinates.split(",").map((s) => parseFloat(s.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        latitude = parts[0]
        longitude = parts[1]
      }
    }

    setSubmitting(true)
    try {
      await apiClient.post("/api/tasks", {
        title: categoryLabels[form.category],
        category: form.category,
        priority: "medium",
        status: "pending",
        customerName: "Mandiri",
        customerPhone: form.customerPhone,
        address: form.address,
        addressDetail: form.addressDetail,
        latitude,
        longitude,
        description: form.description,
        assignedTo: currentUserId,
        assignedBy: currentUserId,
        rewardPoints: 10,
        workingDate: new Date().toISOString().split("T")[0],
        estimatedDuration: 120,
      })
      toast.success("Tugas berhasil dibuat! +10 poin")
      setDialogOpen(false)
      setForm(createFormDefault)
      const list = await apiClient.get<Task[]>("/api/tasks", { assignedTo: currentUserId })
      setTasks(list)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat tugas")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-4">
          {/* Tabs skeleton */}
          <div className="flex gap-2">
            <div className="flex-1 h-12 rounded-xl bg-gray-200 animate-pulse" />
            <div className="flex-1 h-12 rounded-xl bg-gray-200 animate-pulse" />
          </div>
          <TaskListSkeleton count={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="p-4 pb-28 space-y-4">
        <div className="flex gap-2">
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
            {activeTab === "active" ? "Tidak ada tugas aktif" : "Tidak ada tugas selesai"}
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => {
              const creator = employees.find((e) => e.id === task.assignedBy)
              return <TaskCard key={task.id} task={task} creatorName={creator?.name} />
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-24 right-5 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg z-40 hover:bg-primary/90"
      >
        <Plus className="size-7" />
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-5 pt-5 pb-2 shrink-0">
            <DialogTitle className="text-lg font-bold text-gray-900">Buat Tugas Mandiri Baru</DialogTitle>
          </DialogHeader>

          <div className="px-5 pb-5 space-y-3 overflow-y-auto flex-1">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Kategori Tugas</Label>
              <div className="flex gap-2 flex-wrap">
                {(["installation", "repair", "billing"] as TaskCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold border transition-colors ${
                      form.category === cat
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {cat === "installation" ? "Pemasangan" : cat === "repair" ? "Gangguan" : "Tagihan"}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-500">
              Reward Membuat Tugas: <span className="font-semibold text-green-600">+10 Poin</span>
            </div>

            <div>
              <Label className="text-xs">Alamat Utama *</Label>
              <Input
                placeholder="Masukkan alamat utama pelanggan..."
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Detail Alamat</Label>
              <Input
                placeholder="No. Rumah, Gang, Patokan..."
                value={form.addressDetail}
                onChange={(e) => setForm((f) => ({ ...f, addressDetail: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">No. Telp/WA Pelanggan</Label>
              <Input
                placeholder="Contoh: 08123456789"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Koordinat Lokasi (Latitude, Longitude)</Label>
              <Input
                placeholder="Contoh: -6.2297, 106.8158"
                value={form.coordinates}
                onChange={(e) => setForm((f) => ({ ...f, coordinates: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Keterangan</Label>
              <Textarea
                placeholder="Deskripsi tugas singkat..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0 bg-white">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1 h-11 rounded-xl border-gray-200"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 font-bold"
              disabled={submitting}
            >
              {submitting ? "Membuat..." : "Buat Tugas"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
