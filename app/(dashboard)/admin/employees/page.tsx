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
  MapPin,
  Clock,
  DollarSign as MoneyIcon,
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

const mockSessions: Record<string, { pagi: string | null; siang: string | null; pagiStatus: "hadir" | "terlambat" | "belum"; siangStatus: "hadir" | "terlambat" | "belum"; durasi: string; gajiBerjalan: number; lokasi: string; status: string }> = {
  "emp-001": { pagi: "07:55", siang: "17:05", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 10m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "SELESAI" },
  "emp-002": { pagi: "08:02", siang: "17:00", pagiStatus: "terlambat", siangStatus: "hadir", durasi: "8j 58m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "SELESAI" },
  "emp-003": { pagi: "07:45", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "5j 30m", gajiBerjalan: 55000, lokasi: "Jl. Pemuda No. 88, Bekasi", status: "BEKERJA" },
  "emp-004": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "BELUM ABSEN" },
  "emp-005": { pagi: "07:30", siang: "17:15", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 45m", gajiBerjalan: 117000, lokasi: "Jl. Pahlawan No. 7, Surabaya", status: "SELESAI" },
  "emp-006": { pagi: "08:10", siang: null, pagiStatus: "terlambat", siangStatus: "belum", durasi: "4j 20m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "BEKERJA" },
  "emp-007": { pagi: "07:50", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "6j 15m", gajiBerjalan: 56250, lokasi: "Jl. Majapahit No. 56, Semarang", status: "BEKERJA" },
  "emp-008": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "LIBUR" },
  "emp-009": { pagi: "07:55", siang: "17:10", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 15m", gajiBerjalan: 101750, lokasi: "Jl. Ahmad Yani No. 42, Bogor", status: "SELESAI" },
  "emp-010": { pagi: "07:40", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "7j 0m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "BEKERJA" },
  "emp-011": { pagi: "08:05", siang: "17:00", pagiStatus: "terlambat", siangStatus: "hadir", durasi: "8j 55m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "SELESAI" },
  "emp-012": { pagi: "07:35", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "5j 45m", gajiBerjalan: 57500, lokasi: "Jl. Pahlawan No. 9, Tangerang", status: "BEKERJA" },
  "emp-013": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "BELUM ABSEN" },
  "emp-014": { pagi: "07:48", siang: "17:20", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 32m", gajiBerjalan: 123500, lokasi: "Jl. Gajah Mada No. 18, Malang", status: "SELESAI" },
  "emp-015": { pagi: "08:15", siang: null, pagiStatus: "terlambat", siangStatus: "belum", durasi: "3j 50m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "BEKERJA" },
  "emp-016": { pagi: "07:42", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "6j 30m", gajiBerjalan: 61750, lokasi: "Jl. Hasanudin No. 5, Cirebon", status: "BEKERJA" },
  "emp-017": { pagi: "07:58", siang: "17:08", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 10m", gajiBerjalan: 96250, lokasi: "Jl. Pahlawan No. 22, Purwokerto", status: "SELESAI" },
  "emp-018": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "LIBUR" },
  "emp-019": { pagi: "07:38", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "7j 15m", gajiBerjalan: 83375, lokasi: "Jl. Sultan Agung No. 7, Serang", status: "BEKERJA" },
  "emp-020": { pagi: "08:00", siang: "17:05", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 5m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "SELESAI" },
  "emp-021": { pagi: "08:08", siang: null, pagiStatus: "terlambat", siangStatus: "belum", durasi: "4j 45m", gajiBerjalan: 42750, lokasi: "Jl. Pemuda No. 12, Jember", status: "BEKERJA" },
  "emp-022": { pagi: "07:45", siang: "17:00", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 15m", gajiBerjalan: 0, lokasi: "Kantor Pusat", status: "SELESAI" },
  "emp-023": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "TIDAK AKTIF" },
  "emp-024": { pagi: "07:52", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "5j 20m", gajiBerjalan: 53333, lokasi: "Jl. Sultan Agung No. 28, Tasikmalaya", status: "BEKERJA" },
  "emp-025": { pagi: "07:40", siang: "17:10", pagiStatus: "hadir", siangStatus: "hadir", durasi: "9j 30m", gajiBerjalan: 80750, lokasi: "Jl. Pahlawan No. 14, Karawang", status: "SELESAI" },
  "emp-026": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "BELUM ABSEN" },
  "emp-027": { pagi: "07:55", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "6j 0m", gajiBerjalan: 66000, lokasi: "Jl. Raya No. 8, Karawang", status: "BEKERJA" },
  "emp-028": { pagi: "08:05", siang: null, pagiStatus: "terlambat", siangStatus: "belum", durasi: "4j 30m", gajiBerjalan: 36000, lokasi: "Jl. Sultan Agung No. 3, Indramayu", status: "BEKERJA" },
  "emp-029": { pagi: null, siang: null, pagiStatus: "belum", siangStatus: "belum", durasi: "0j 0m", gajiBerjalan: 0, lokasi: "-", status: "DITANGGUHKAN" },
  "emp-030": { pagi: "07:48", siang: null, pagiStatus: "hadir", siangStatus: "belum", durasi: "5j 50m", gajiBerjalan: 58333, lokasi: "Jl. Gajah Mada No. 11, Sukabumi", status: "BEKERJA" },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function getStatusBadge(status: string) {
  switch (status) {
    case "BELUM ABSEN":
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
    case "BEKERJA":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
    case "SELESAI":
      return <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
    case "LIBUR":
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
    case "TIDAK AKTIF":
      return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
    case "DITANGGUHKAN":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 font-semibold">{status}</Badge>
  }
}

function getSessionBadge(status: "hadir" | "terlambat" | "belum") {
  if (status === "hadir") {
    return <span className="ml-1 inline-flex items-center rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">HADIR</span>
  }
  if (status === "terlambat") {
    return <span className="ml-1 inline-flex items-center rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">MERAH</span>
  }
  return <span className="ml-1 inline-flex items-center rounded-full bg-gray-300 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 uppercase tracking-wider">--</span>
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
      <div className="relative">
        <input
          type="text"
          placeholder="Cari nama, posisi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

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
            const session = mockSessions[emp.id]

            return (
              <div key={emp.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Avatar className="!size-14">
                        <AvatarImage src={emp.avatar || getAvatarUrl(emp.name)} alt={emp.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.position}</p>
                        </div>
                        {session && getStatusBadge(session.status)}
                      </div>

                      {session && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-20 shrink-0">Sesi Pagi:</span>
                            <span className="font-medium text-gray-900">{session.pagi || "--:--"}</span>
                            {getSessionBadge(session.pagiStatus)}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-20 shrink-0">Sesi Siang:</span>
                            <span className="font-medium text-gray-900">{session.siang || "--:--"}</span>
                            {getSessionBadge(session.siangStatus)}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-20 shrink-0">Durasi Kerja:</span>
                            <span className="font-medium text-gray-900">{session.durasi}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-20 shrink-0">Gaji Berjalan:</span>
                            <span className="font-medium text-gray-900">
                              {session.gajiBerjalan > 0 ? `Rp ${session.gajiBerjalan.toLocaleString("id-ID")}` : "Rp -"}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-xs">
                            <span className="text-gray-500 w-20 shrink-0">Lokasi Terakhir:</span>
                            <span className="font-medium text-gray-900 leading-tight">{session.lokasi}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Tarif / Jam</p>
                      <p className="text-sm font-bold text-gray-900">
                        {hourlyRate > 0 ? `Rp ${hourlyRate.toLocaleString("id-ID")}` : "Rp -"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Total Poin</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🏅</span>
                        <span className="text-sm font-bold text-gray-900">{pts}</span>
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
                      <p className="text-xs font-medium text-gray-900">{emp.phone || "-"}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Device ID Terikat</p>
                      {deviceId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-green-500 shrink-0" />
                          <span className="text-[11px] font-mono text-gray-700 truncate">{deviceId}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Belum terikat</span>
                      )}
                    </div>
                  </div>

                  {deviceId && (
                    <div className="mt-2">
                      <button className="text-xs text-red-500 font-medium hover:underline">
                        Reset HP (Device ID)
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditDialog(emp)}
                    className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-100"
                  >
                    <Pencil className="size-4" />
                    Edit
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
