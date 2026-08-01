"use client"

import { useState, useMemo } from "react"
import {
  Plus,
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
  Minus,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { employees } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import { getAvatarUrl } from "@/lib/utils"

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
  department: "",
  position: "",
  hourlyRate: "",
}

const mockHourlyRates: Record<string, number> = {
  "emp-003": 10000,
  "emp-005": 12000,
  "emp-007": 9000,
  "emp-009": 11000,
  "emp-012": 10000,
  "emp-014": 13000,
  "emp-016": 9500,
  "emp-017": 10500,
  "emp-019": 11500,
  "emp-021": 9000,
  "emp-024": 10000,
  "emp-025": 8500,
  "emp-027": 11000,
  "emp-028": 8000,
  "emp-030": 10000,
}

const mockDeviceIds: Record<string, string> = {
  "emp-003": "device-mob-8f3a",
  "emp-005": "device-mob-2b7c",
  "emp-007": "device-mob-9d1e",
  "emp-009": "device-mob-4a6f",
  "emp-012": "device-mob-7c2d",
  "emp-014": "device-mob-1e5b",
  "emp-016": "device-mob-6f8a",
  "emp-017": "device-mob-3d9c",
  "emp-019": "device-mob-5b4e",
  "emp-021": "device-mob-8a1f",
  "emp-024": "device-mob-2c7d",
  "emp-025": "device-mob-9e3b",
  "emp-027": "device-mob-4f6a",
  "emp-028": "device-mob-7d2c",
  "emp-030": "device-mob-1b5e",
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState("")
  const [employeeList, setEmployeeList] = useState(employees)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<EmployeeForm>(defaultForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [pointsMap, setPointsMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    employees.forEach((e) => { map[e.id] = e.rewardPoints })
    return map
  })

  const filteredEmployees = useMemo(() => {
    return employeeList.filter(
      (e) =>
        e.role !== "super_admin" &&
        (e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase()) ||
          e.position.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, employeeList])

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(defaultForm)
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (emp: (typeof employees)[number]) => {
    setEditingId(emp.id)
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || "",
      password: "",
      department: emp.department,
      position: emp.position,
      hourlyRate: String(mockHourlyRates[emp.id] || 0),
    })
    setFormError("")
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
    setFormError("")
    if (!editingId && form.password.length < 8) {
      setFormError("Password minimal 8 karakter")
      return
    }
    setFormLoading(true)
    if (editingId) {
      setEmployeeList((prev) =>
        prev.map((emp) =>
          emp.id === editingId
            ? { ...emp, name: form.name, email: form.email, phone: form.phone, department: form.department, position: form.position }
            : emp
        )
      )
      setDialogOpen(false)
    } else {
      const { error: signUpError } = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      if (signUpError) {
        setFormError(signUpError.message || "Gagal membuat akun karyawan.")
        setFormLoading(false)
        return
      }
      const newId = `emp-${String(employeeList.length + 1).padStart(3, "0")}`
      setEmployeeList((prev) => [
        ...prev,
        {
          id: newId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: "employee" as const,
          avatar: null,
          department: form.department,
          position: form.position,
          status: "active" as const,
          joinDate: new Date().toISOString(),
          salary: 0,
          address: "",
          nik: "",
          npwp: "",
          bankName: "",
          bankAccount: "",
          rewardPoints: 0,
        },
      ])
      setDialogOpen(false)
    }
    setFormLoading(false)
  }

  const handleDelete = () => {
    if (deletingId) {
      setEmployeeList((prev) => prev.filter((emp) => emp.id !== deletingId))
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari nama, posisi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Tambah Teknisi button */}
      <button
        onClick={openCreateDialog}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth={2}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        Tambah Teknisi
      </button>

      {/* Employee cards */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
            Tidak ada data ditemukan
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const hourlyRate = mockHourlyRates[emp.id] || 0
            const deviceId = mockDeviceIds[emp.id]
            const pts = pointsMap[emp.id] || 0

            return (
              <div key={emp.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Avatar + name */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <Avatar size="lg" className="!size-16">
                        <AvatarImage src={emp.avatar || getAvatarUrl(emp.name)} alt={emp.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-bold text-gray-900 uppercase text-center leading-tight">
                        {emp.name.split(" ")[0]}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Tarif / Jam</p>
                        <p className="text-base font-bold text-gray-900">
                          {hourlyRate > 0 ? `Rp ${hourlyRate.toLocaleString("id-ID")}` : "Rp -"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Total Poin</p>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🏅</span>
                          <span className="text-sm font-bold text-gray-900">{pts} Poin</span>
                          <button
                            onClick={() => setPointsMap((prev) => ({ ...prev, [emp.id]: Math.max(0, (prev[emp.id] || 0) - 10) }))}
                            className="flex size-5 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                          >-</button>
                          <button
                            onClick={() => setPointsMap((prev) => ({ ...prev, [emp.id]: (prev[emp.id] || 0) + 10 }))}
                            className="flex size-5 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                          >+</button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">No. Telp / WA</p>
                        <p className="text-sm font-medium text-gray-900">{emp.phone || "-"}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Device ID Terikat</p>
                        {deviceId ? (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-500 shrink-0" />
                            <span className="text-xs font-mono text-gray-700 truncate">{deviceId}</span>
                            <button className="text-xs text-red-500 font-medium whitespace-nowrap hover:underline">
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

                {/* Action buttons */}
                <div className="grid grid-cols-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditDialog(emp)}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-100"
                  >
                    <Pencil className="size-4" />
                    Ubah
                  </button>
                  <button
                    onClick={() => openDeleteDialog(emp.id)}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
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

      {/* Dialog Tambah/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Karyawan" : "Tambah Teknisi"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Ubah data karyawan." : "Isi data untuk membuat akun teknisi baru."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input placeholder="Masukkan nama" className="pl-10" value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)} disabled={formLoading} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="email" placeholder="email@perusahaan.com" className="pl-10" value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)} disabled={formLoading} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="tel" placeholder="+6281234567890" className="pl-10" value={form.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)} disabled={formLoading} required />
              </div>
            </div>
            {!editingId && (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input type="password" placeholder="Minimal 8 karakter" className="pl-10" value={form.password}
                    onChange={(e) => handleFormChange("password", e.target.value)} disabled={formLoading} required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Departemen</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input placeholder="Teknisi Lapangan" className="pl-10" value={form.department}
                  onChange={(e) => handleFormChange("department", e.target.value)} disabled={formLoading} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posisi</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input placeholder="Teknisi / Driver / Admin" className="pl-10" value={form.position}
                  onChange={(e) => handleFormChange("position", e.target.value)} disabled={formLoading} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tarif/Jam (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="number" placeholder="10000" className="pl-10" value={form.hourlyRate}
                  onChange={(e) => handleFormChange("hourlyRate", e.target.value)} disabled={formLoading} min={0} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={formLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <><Loader2 className="mr-2 size-4 animate-spin" />Menyimpan...</> : editingId ? "Simpan" : "Buat Akun"}
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
              Tindakan ini tidak dapat dibatalkan.
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
