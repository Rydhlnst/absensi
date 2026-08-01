"use client"

import { useState, useMemo } from "react"
import { MapPin, Eye, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { tasks, employees } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
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

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "Dikerjakan", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Selesai", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Dibatalkan", className: "bg-gray-100 text-gray-500" },
}

const createFormDefault = {
  category: "installation" as TaskCategory,
  address: "",
  addressDetail: "",
  customerPhone: "",
  coordinates: "",
  description: "",
}

function TaskCard({ task }: { task: Task }) {
  const mapsUrl = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`
  const badge = statusLabels[task.status] || statusLabels.pending

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${categoryColors[task.category]}`}>
            {categoryLabels[task.category]}
          </span>
          <span className="text-xs font-bold text-green-600">+{task.rewardPoints} Poin</span>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">{task.address}</p>
          <p className="text-xs text-gray-500 mt-0.5">{task.addressDetail || "-"}</p>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-xs shrink-0 mt-0.5">📋</span>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Keterangan Tugas:</span> {task.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Eye className="size-3.5" />
            Detail
          </button>
          {(task.status === "pending" || task.status === "in_progress") && (
            <button
              onClick={() => toast.success("Tugas dimulai!")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-white hover:bg-primary/90"
            >
              Kerjakan Tugas
            </button>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            🗺
          </a>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeTasksPage() {
  const { data: session } = authClient.useSession()
  const [activeTab, setActiveTab] = useState<"active" | "done">("active")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(createFormDefault)

  const currentUserId = session?.user?.id || ""
  const currentEmployee = employees.find((e) => e.id === currentUserId) || employees[2]

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedTo === currentUserId),
    [currentUserId]
  )

  const activeTasks = useMemo(
    () => myTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [myTasks]
  )

  const doneTasks = useMemo(
    () => myTasks.filter((t) => t.status === "completed"),
    [myTasks]
  )

  const displayTasks = activeTab === "active" ? activeTasks : doneTasks

  const handleCreate = () => {
    toast.success("Tugas berhasil dibuat!")
    setDialogOpen(false)
    setForm(createFormDefault)
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="p-4 pb-24 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              activeTab === "active"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Tugas Aktif ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              activeTab === "done"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Tugas Selesai ({doneTasks.length})
          </button>
        </div>

        {/* Task list */}
        {displayTasks.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
            {activeTab === "active" ? "Tidak ada tugas aktif" : "Tidak ada tugas selesai"}
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-24 right-5 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg z-40 hover:bg-primary/90"
      >
        <Plus className="size-6" />
      </button>

      {/* Create task dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Tugas Mandiri Baru</DialogTitle>
            <DialogDescription>Isi detail tugas yang akan dikerjakan</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
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

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
              Buat Tugas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
