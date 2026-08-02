"use client"

import { useState, useEffect } from "react"
import {
  Pencil,
  Trash2,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Lock,
  DollarSign,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { apiClient } from "@/lib/api"
import { getAvatarUrl } from "@/lib/utils"
import { toast } from "sonner"

interface EmployeeForm {
  name: string
  email: string
  phone: string
  password: string
  department: string
  position: string
  hourlyRate: string
}

const defaultForm: EmployeeForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  department: "Teknisi Lapangan",
  position: "Teknisi",
  hourlyRate: "",
}

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  image: string | null
  position: string
  department: string
  hourlyRate: number
  rewardPoints: number
  status: string
}

interface DeviceInfo {
  id: string
  userId: string
  deviceId: string
  deviceName: string | null
  isActive: boolean
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<EmployeeForm>(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [emps, devs] = await Promise.all([
        apiClient.get<Employee[]>("/api/employees", { role: "employee" }),
        apiClient.get<DeviceInfo[]>("/api/devices"),
      ])
      setEmployees(emps)
      setDevices(devs)
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
        const [emps, devs] = await Promise.all([
          apiClient.get<Employee[]>("/api/employees", { role: "employee" }),
          apiClient.get<DeviceInfo[]>("/api/devices"),
        ])
        if (!cancelled) {
          setEmployees(emps)
          setDevices(devs)
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

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEditDialog = (emp: Employee) => {
    setEditingId(emp.id)
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || "",
      password: "",
      department: emp.department || "Teknisi Lapangan",
      position: emp.position || "Teknisi",
      hourlyRate: String(emp.hourlyRate || ""),
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleFormChange = (field: keyof EmployeeForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId && form.password.length < 8) {
      toast.error("Password minimal 8 karakter")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiClient.put("/api/employees", {
          id: editingId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          position: form.position,
          hourlyRate: parseInt(form.hourlyRate) || 0,
        })
        toast.success("Karyawan berhasil diperbarui")
      } else {
        await apiClient.post("/api/employees", {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "employee",
          department: form.department,
          position: form.position,
          hourlyRate: parseInt(form.hourlyRate) || 0,
        })
        toast.success("Karyawan berhasil dibuat")
      }
      setDialogOpen(false)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan karyawan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await apiClient.delete(`/api/employees?id=${deletingId}`)
      toast.success("Karyawan berhasil dinonaktifkan")
      setDeleteDialogOpen(false)
      setDeletingId(null)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus karyawan")
    }
  }

  const handleResetDevice = async (userId: string, name: string) => {
    if (!confirm(`Reset device ID untuk ${name}?`)) return
    try {
      await apiClient.delete(`/api/devices?userId=${userId}`)
      toast.success("Device ID berhasil direset")
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal reset device")
    }
  }

  const handlePointsAdjust = async (userId: string, currentPoints: number, delta: number) => {
    const newPoints = Math.max(0, currentPoints + delta)
    if (newPoints === currentPoints) return
    try {
      await apiClient.post("/api/rewards", {
        employeeId: userId,
        points: delta,
        type: "adjusted",
        description: `Penyesuaian poin oleh admin (${delta > 0 ? "+" : ""}${delta})`,
      })
      toast.success(`Poin diperbarui: ${newPoints}`)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui poin")
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
    <div className="space-y-3">
      <button
        onClick={openCreateDialog}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
      >
        <UserPlus className="size-5" />
        Tambah Teknisi
      </button>

      <div className="space-y-3">
        {employees.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-200">
            Belum ada data teknisi
          </div>
        ) : (
          employees.map((emp) => {
            const device = devices.find((d) => d.userId === emp.id && d.isActive)

            return (
              <div key={emp.id} className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 flex gap-4">
                  <div className="shrink-0">
                    <Avatar className="!size-16">
                      <AvatarImage src={emp.image || getAvatarUrl(emp.name)} alt={emp.name} />
                      <AvatarFallback className="bg-blue-100 text-primary font-bold text-lg">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-base font-bold text-gray-900 truncate">{emp.name}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tarif / Jam</p>
                        <p className="text-sm font-bold text-gray-900">
                          {emp.hourlyRate > 0 ? `Rp ${emp.hourlyRate.toLocaleString("id-ID")}` : "Rp -"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Poin</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🏅</span>
                          <span className="text-sm font-bold text-gray-900">{emp.rewardPoints} Poin</span>
                          <button
                            onClick={() => handlePointsAdjust(emp.id, emp.rewardPoints, -10)}
                            className="flex size-5 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                          >−</button>
                          <button
                            onClick={() => handlePointsAdjust(emp.id, emp.rewardPoints, 10)}
                            className="flex size-5 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                          >+</button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">No. Telp / Wa</p>
                        <p className="text-sm font-bold text-gray-900">{emp.phone || "-"}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Device ID Terikat</p>
                        {device ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                            <span className="text-xs font-mono text-gray-700 truncate">{device.deviceId}</span>
                            <button
                              onClick={() => handleResetDevice(emp.id, emp.name)}
                              className="text-xs text-red-500 font-medium hover:underline ml-auto"
                            >
                              Reset HP (Device ID)
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Belum terikat</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-gray-200">
                  <button
                    onClick={() => openEditDialog(emp)}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 border-r border-gray-200"
                  >
                    <Pencil className="size-4" />
                    Ubah
                  </button>
                  <button
                    onClick={() => openDeleteDialog(emp.id)}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                    Hapus
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Karyawan" : "Tambah Teknisi"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Ubah data karyawan." : "Isi data untuk membuat akun teknisi baru."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input placeholder="Masukkan nama" className="pl-10" value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)} disabled={saving} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="email" placeholder="email@perusahaan.com" className="pl-10" value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)} disabled={saving} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="tel" placeholder="+6281234567890" className="pl-10" value={form.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)} disabled={saving} required />
              </div>
            </div>
            {!editingId && (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input type="password" placeholder="Minimal 8 karakter" className="pl-10" value={form.password}
                    onChange={(e) => handleFormChange("password", e.target.value)} disabled={saving} required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Departemen</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input placeholder="Teknisi Lapangan" className="pl-10" value={form.department}
                  onChange={(e) => handleFormChange("department", e.target.value)} disabled={saving} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posisi</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input placeholder="Teknisi / Driver / Admin" className="pl-10" value={form.position}
                  onChange={(e) => handleFormChange("position", e.target.value)} disabled={saving} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tarif/Jam (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="number" placeholder="10000" className="pl-10" value={form.hourlyRate}
                  onChange={(e) => handleFormChange("hourlyRate", e.target.value)} disabled={saving} min={0} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 size-4 animate-spin" />Menyimpan...</> : editingId ? "Simpan" : "Buat Akun"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Karyawan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menonaktifkan akun karyawan.
            </AlertDialogDescription>
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
