"use client"

import { useState, useMemo } from "react"
import { MapPin, Eye } from "lucide-react"
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

const categoryBannerColors: Record<TaskCategory, string> = {
  installation: "bg-blue-600",
  maintenance: "bg-purple-600",
  billing: "bg-yellow-500",
  repair: "bg-red-600",
  inspection: "bg-teal-600",
}

const createFormDefault = {
  category: "installation" as TaskCategory,
  address: "",
  addressDetail: "",
  customerPhone: "",
  coordinates: "",
  description: "",
}

function TaskCard({ task, currentEmployeeName }: { task: Task; currentEmployeeName: string }) {
  const mapsUrl = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden mb-3">
      {/* Category banner */}
      <div className={`${categoryBannerColors[task.category]} flex items-center justify-between px-4 py-2.5`}>
        <span className="text-sm font-bold text-white tracking-wide">
          {categoryLabels[task.category]}
        </span>
        <span className="text-xs font-bold text-green-300">+{task.rewardPoints} Poin</span>
      </div>

      <div className="px-4 py-1 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-500">
          Pembuat Tugas: <span className="font-semibold text-gray-700">{currentEmployeeName}</span>
        </p>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-semibold">Alamat:</span> {task.address}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 ml-auto"
              >
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50">
                  🗺 Google Maps
                </span>
              </a>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">🏠</span>
              <p className="text-sm">
                <span className="font-semibold">Detail Alamat:</span>{" "}
                {task.addressDetail || "-"}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">📋</span>
              <p className="text-sm">
                <span className="font-semibold">Keterangan Tugas:</span> {task.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Eye className="size-4" />
            Detail
          </button>
          {(task.status === "pending" || task.status === "in_progress") && (
            <button
              onClick={() => toast.success("Tugas dimulai!")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-primary py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              ▶ Kerjakan Tugas
            </button>
          )}
          {task.status === "completed" && (
            <span className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-green-300 py-2 text-sm font-medium text-green-600 bg-green-50">
              ✓ Selesai
            </span>
          )}
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
    <div className="relative min-h-screen">
      <div className="p-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              activeTab === "active"
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Belum Selesai ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
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
            {activeTab === "active" ? "Tidak ada tugas aktif" : "Tidak ada tugas selesai"}
          </div>
        ) : (
          displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} currentEmployeeName={currentEmployee.name} />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-24 right-5 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg text-2xl z-40 hover:bg-primary/90"
      >
        +
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
