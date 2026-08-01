"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Users,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  User,
  Lock,
  DollarSign,
  Smartphone,
  Minus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const ITEMS_PER_PAGE = 10

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

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
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
    employees.forEach((e) => {
      map[e.id] = e.rewardPoints
    })
    return map
  })

  const filteredEmployees = useMemo(() => {
    return employeeList.filter(
      (e) =>
        e.role !== "super_admin" &&
        (e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase()) ||
          e.department.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, employeeList])

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

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
            ? {
                ...emp,
                name: form.name,
                email: form.email,
                phone: form.phone,
                department: form.department,
                position: form.position,
              }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Karyawan</h1>
          <p className="text-muted-foreground">
            Kelola data karyawan perusahaan
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Tambah Karyawan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Karyawan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, departemen..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead className="text-right">Tarif/Jam</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead className="text-center">Poin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell className="text-right text-sm">
                        {mockHourlyRates[emp.id]
                          ? `Rp ${mockHourlyRates[emp.id].toLocaleString("id-ID")}/jam`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {mockDeviceIds[emp.id] ? (
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="size-3 text-muted-foreground" />
                            <span className="text-xs font-mono">{mockDeviceIds[emp.id]}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Belum terikat</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              setPointsMap((prev) => ({
                                ...prev,
                                [emp.id]: Math.max(0, (prev[emp.id] || 0) - 10),
                              }))
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="min-w-[32px] text-center text-sm font-medium">
                            {pointsMap[emp.id] || 0}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              setPointsMap((prev) => ({
                                ...prev,
                                [emp.id]: (prev[emp.id] || 0) + 10,
                              }))
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emp.status === "active" ? "default" : "secondary"
                          }
                        >
                          {emp.status === "active" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditDialog(emp)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {mockDeviceIds[emp.id] && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              title="Reset HP (Device ID)"
                            >
                              <Smartphone className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openDeleteDialog(emp.id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {paginatedEmployees.length} dari{" "}
              {filteredEmployees.length} karyawan
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Karyawan" : "Tambah Karyawan"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Ubah data karyawan di bawah ini."
                : "Isi data untuk membuat akun karyawan baru."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emp-name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="emp-name"
                  placeholder="Masukkan nama"
                  className="pl-10"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="emp-email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  className="pl-10"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-phone">No. Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="emp-phone"
                  type="tel"
                  placeholder="+6281234567890"
                  className="pl-10"
                  value={form.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  disabled={formLoading}
                  required
                />
              </div>
            </div>

            {!editingId && (
              <div className="space-y-2">
                <Label htmlFor="emp-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="emp-password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    className="pl-10"
                    value={form.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    disabled={formLoading}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="emp-department">Departemen</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="emp-department"
                  placeholder="Contoh: HRD, Marketing"
                  className="pl-10"
                  value={form.department}
                  onChange={(e) =>
                    handleFormChange("department", e.target.value)
                  }
                  disabled={formLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-position">Posisi</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="emp-position"
                  placeholder="Contoh: Staff, Manager"
                  className="pl-10"
                  value={form.position}
                  onChange={(e) =>
                    handleFormChange("position", e.target.value)
                  }
                  disabled={formLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-hourlyRate">Tarif/Jam (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="emp-hourlyRate"
                  type="number"
                  placeholder="Contoh: 10000"
                  className="pl-10"
                  value={form.hourlyRate}
                  onChange={(e) =>
                    handleFormChange("hourlyRate", e.target.value)
                  }
                  disabled={formLoading}
                  min={0}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={formLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingId ? (
                  "Simpan Perubahan"
                ) : (
                  "Buat Akun"
                )}
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
              Tindakan ini tidak dapat dibatalkan. Data karyawan akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
