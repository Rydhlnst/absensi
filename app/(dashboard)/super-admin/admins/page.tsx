"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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

interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  image: string | null
  department: string
  position: string
  status: string
  role: string
}

interface AdminFormData {
  name: string
  email: string
  phone: string
  password: string
  department: string
  position: string
  status: "active" | "inactive" | "suspended"
}

const defaultFormData: AdminFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  department: "",
  position: "",
  status: "active",
}

const departments = [
  "HRD",
  "Administrasi",
  "Finance",
  "Customer Service",
  "Teknisi Lapangan",
]

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState<AdminFormData>(defaultFormData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<AdminUser[]>("/api/admins")
      setAdmins(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memuat admin"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<AdminUser[]>("/api/admins")
        if (!cancelled) setAdmins(data)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Gagal memuat admin"
        if (!cancelled) toast.error(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingAdmin(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  const handleOpenEdit = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
      department: admin.department || "",
      position: admin.position || "",
      status: (admin.status as "active" | "inactive" | "suspended") || "active",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingAdmin && formData.password.length < 8) {
      toast.error("Password minimal 8 karakter")
      return
    }
    setSaving(true)
    try {
      if (editingAdmin) {
        await apiClient.put("/api/admins", {
          id: editingAdmin.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          status: formData.status,
        })
        toast.success("Admin berhasil diperbarui")
      } else {
        await apiClient.post("/api/admins", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: "admin",
          department: formData.department,
          position: formData.position,
        })
        toast.success("Admin berhasil dibuat")
      }
      setDialogOpen(false)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan admin")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Nonaktifkan admin ${admin.name}?`)) return
    try {
      await apiClient.delete(`/api/admins?id=${admin.id}`)
      toast.success("Admin dinonaktifkan")
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menonaktifkan admin")
    }
  }

  if (loading) {
    return <AdminTableSkeleton rows={5} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Admin</h1>
          <p className="text-muted-foreground">Kelola akun admin sistem</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-4" />
          Tambah Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Admin</CardTitle>
            <div className="relative">
              <Input
                placeholder="Cari admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAdmins.length === 0 ? (
            <EmptyState icon={Shield} title="Tidak ada admin ditemukan" description="Tidak ada admin yang cocok dengan pencarian Anda" />
          ) : (
            <div className="space-y-2">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <Avatar size="default">
                    <AvatarImage src={admin.image || getAvatarUrl(admin.name)} />
                    <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{admin.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {admin.email} · {admin.department}
                    </p>
                  </div>
                  <Badge variant={admin.status === "active" ? "default" : admin.status === "inactive" ? "secondary" : "destructive"}>
                    {admin.status === "active" ? "Aktif" : admin.status === "inactive" ? "Nonaktif" : "Suspended"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(admin)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(admin)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAdmin ? "Edit Admin" : "Tambah Admin"}</DialogTitle>
            <DialogDescription>
              {editingAdmin ? "Ubah informasi admin" : "Isi informasi untuk menambahkan admin baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input
                placeholder="Masukkan nomor telepon"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            {!editingAdmin && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData((p) => ({ ...p, department: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: "active" | "inactive" | "suspended") => setFormData((p) => ({ ...p, status: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input
                placeholder="Masukkan jabatan"
                value={formData.position}
                onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : editingAdmin ? "Simpan Perubahan" : "Tambah Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
