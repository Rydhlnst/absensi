"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { AdminTableSkeleton } from "@/components/skeletons"
import { toast } from "sonner"
import EmptyState from "@/components/empty-state"

interface Employee {
  id: string
  name: string
  department: string
  position: string
  salary: number
}

interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string | null
  department: string | null
  position: string | null
  month: number
  year: number
  baseSalary: number
  bonus: number
  deduction: number
  totalSalary: number
  status: string
}

interface SalaryFormData {
  employeeId: string
  month: string
  year: string
  baseSalary: string
  bonus: string
  deduction: string
  status: string
}

const defaultFormData: SalaryFormData = {
  employeeId: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  baseSalary: "",
  bonus: "0",
  deduction: "0",
  status: "pending",
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const ITEMS_PER_PAGE = 10

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

function getStatusConfig(status: string) {
  switch (status) {
    case "paid":
      return { label: "Dibayar", color: "bg-green-500/10 text-green-600 border-green-500/20" }
    case "pending":
      return { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" }
    case "processing":
      return { label: "Diproses", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" }
    default:
      return { label: status, color: "bg-muted text-muted-foreground" }
  }
}

export default function AdminSalariesPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SalaryFormData>(defaultFormData)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [monthFilter, setMonthFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [salData, empData] = await Promise.all([
        apiClient.get<SalaryRecord[]>("/api/salaries"),
        apiClient.get<Employee[]>("/api/employees", { role: "employee" }),
      ])
      setSalaries(salData)
      setEmployees(empData)
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
        const [salData, empData] = await Promise.all([
          apiClient.get<SalaryRecord[]>("/api/salaries"),
          apiClient.get<Employee[]>("/api/employees", { role: "employee" }),
        ])
        if (!cancelled) {
          setSalaries(salData)
          setEmployees(empData)
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

  const filteredSalaries = useMemo(() => {
    let result = salaries
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.employeeName?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q)
      )
    }
    if (monthFilter !== "all") {
      result = result.filter((s) => s.month === parseInt(monthFilter))
    }
    if (yearFilter !== "all") {
      result = result.filter((s) => s.year === parseInt(yearFilter))
    }
    return result
  }, [salaries, search, monthFilter, yearFilter])

  const totalPages = Math.ceil(filteredSalaries.length / ITEMS_PER_PAGE)
  const paginatedSalaries = filteredSalaries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const totalAll = filteredSalaries.reduce((sum, s) => sum + s.totalSalary, 0)

  const availableYears = useMemo(() => {
    const years = new Set(salaries.map((s) => s.year))
    return Array.from(years).sort((a, b) => b - a)
  }, [salaries])

  const openCreateDialog = () => {
    setEditingId(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  const openEditDialog = (record: SalaryRecord) => {
    setEditingId(record.id)
    setFormData({
      employeeId: record.employeeId,
      month: String(record.month),
      year: String(record.year),
      baseSalary: String(record.baseSalary),
      bonus: String(record.bonus),
      deduction: String(record.deduction),
      status: record.status,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.employeeId) {
      toast.error("Pilih karyawan")
      return
    }
    if (!formData.baseSalary || parseInt(formData.baseSalary) <= 0) {
      toast.error("Gaji pokok harus lebih dari 0")
      return
    }
    setSaving(true)
    try {
      const base = parseInt(formData.baseSalary) || 0
      const bonus = parseInt(formData.bonus) || 0
      const deduction = parseInt(formData.deduction) || 0
      const total = base + bonus - deduction

      if (editingId) {
        await apiClient.put("/api/salaries", {
          id: editingId,
          employeeId: formData.employeeId,
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          baseSalary: base,
          bonus,
          deduction,
          totalSalary: total,
          status: formData.status,
        })
        toast.success("Data gaji berhasil diperbarui")
      } else {
        await apiClient.post("/api/salaries", {
          employeeId: formData.employeeId,
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          baseSalary: base,
          bonus,
          deduction,
          totalSalary: total,
          status: formData.status,
        })
        toast.success("Data gaji berhasil dibuat")
      }
      setDialogOpen(false)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan data gaji")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await apiClient.delete(`/api/salaries?id=${deletingId}`)
      toast.success("Data gaji berhasil dihapus")
      setDeleteDialogOpen(false)
      setDeletingId(null)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus data gaji")
    }
  }

  if (loading) {
    return <AdminTableSkeleton rows={5} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Gaji</h1>
          <p className="text-muted-foreground">Kelola data gaji karyawan</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Tambah Gaji
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, departemen..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={monthFilter} onValueChange={(v) => { setMonthFilter(v); setPage(1) }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(1) }}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Semua Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedSalaries.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Belum ada data gaji"
              description="Tambahkan data gaji untuk karyawan"
              action={<Button size="sm" onClick={openCreateDialog}><Plus className="size-4 mr-1" />Tambah Gaji</Button>}
            />
          ) : (
            <div className="space-y-2">
              {paginatedSalaries.map((record) => {
                const status = getStatusConfig(record.status)
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <DollarSign className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold truncate">{record.employeeName}</p>
                        <Badge variant="outline" className={status.color}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {MONTHS[record.month - 1]} {record.year} · {record.department || "-"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Pokok: {formatRupiah(record.baseSalary)}</span>
                        {record.bonus > 0 && <span className="text-green-600">Bonus: +{formatRupiah(record.bonus)}</span>}
                        {record.deduction > 0 && <span className="text-red-500">Potongan: -{formatRupiah(record.deduction)}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">{formatRupiah(record.totalSalary)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(record)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => { setDeletingId(record.id); setDeleteDialogOpen(true) }}>
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredSalaries.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-foreground">{formatRupiah(totalAll)}</span>
                <span className="ml-2">({filteredSalaries.length} record)</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{page}/{totalPages}</span>
                  <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Gaji" : "Tambah Gaji"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Ubah data gaji karyawan" : "Isi data untuk menambahkan catatan gaji baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Karyawan</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData((p) => ({ ...p, employeeId: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih karyawan" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} — {emp.position || emp.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select value={formData.month} onValueChange={(v) => setFormData((p) => ({ ...p, month: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gaji Pokok (Rp)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.baseSalary}
                onChange={(e) => setFormData((p) => ({ ...p, baseSalary: e.target.value }))}
                min={0}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bonus (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.bonus}
                  onChange={(e) => setFormData((p) => ({ ...p, bonus: e.target.value }))}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Potongan (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.deduction}
                  onChange={(e) => setFormData((p) => ({ ...p, deduction: e.target.value }))}
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="paid">Dibayar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl bg-muted p-3 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold text-foreground">
                {formatRupiah(
                  (parseInt(formData.baseSalary) || 0) +
                  (parseInt(formData.bonus) || 0) -
                  (parseInt(formData.deduction) || 0)
                )}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : editingId ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Gaji?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data gaji secara permanen.
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
