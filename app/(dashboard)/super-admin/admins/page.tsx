"use client"

import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { employees } from "@/data/mock"
import type { User } from "@/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface AdminFormData {
  name: string
  email: string
  phone: string
  department: string
  position: string
  status: "active" | "inactive" | "suspended"
}

const defaultFormData: AdminFormData = {
  name: "",
  email: "",
  phone: "",
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

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<User[]>(
    employees.filter((e) => e.role === "admin")
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)
  const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null)
  const [formData, setFormData] = useState<AdminFormData>(defaultFormData)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleOpenAdd() {
    setEditingAdmin(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  function handleOpenEdit(admin: User) {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      department: admin.department,
      position: admin.position,
      status: admin.status,
    })
    setDialogOpen(true)
  }

  function handleOpenDelete(admin: User) {
    setDeletingAdmin(admin)
    setDeleteDialogOpen(true)
  }

  function handleSave() {
    if (editingAdmin) {
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? { ...a, ...formData }
            : a
        )
      )
    } else {
      const newAdmin: User = {
        id: `emp-${String(employees.length + 1).padStart(3, "0")}`,
        ...formData,
        role: "admin",
        avatar: null,
        joinDate: new Date().toISOString(),
        salary: 0,
        address: "",
        nik: "",
        npwp: "",
        bankName: "",
        bankAccount: "",
        rewardPoints: 0,
      }
      setAdmins((prev) => [...prev, newAdmin])
    }
    setDialogOpen(false)
  }

  function handleDelete() {
    if (deletingAdmin) {
      setAdmins((prev) => prev.filter((a) => a.id !== deletingAdmin.id))
    }
    setDeleteDialogOpen(false)
    setDeletingAdmin(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Admin</h1>
          <p className="text-muted-foreground">
            Kelola akun admin sistem
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-4" />
          Tambah Admin
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Admin</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">Tidak ada admin ditemukan</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <Avatar size="sm">
                        <AvatarFallback>
                          {getInitials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {admin.position}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {admin.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {admin.department}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          admin.status === "active"
                            ? "default"
                            : admin.status === "inactive"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {admin.status === "active"
                          ? "Aktif"
                          : admin.status === "inactive"
                            ? "Nonaktif"
                            : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(admin)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDelete(admin)}
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Edit Admin" : "Tambah Admin"}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin
                ? "Ubah informasi admin di bawah ini."
                : "Isi informasi untuk menambahkan admin baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input
                placeholder="Masukkan nomor telepon"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Departemen</label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "suspended") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
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
              <label className="text-sm font-medium">Jabatan</label>
              <Input
                placeholder="Masukkan jabatan"
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {editingAdmin ? "Simpan Perubahan" : "Tambah Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Admin</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus admin{" "}
              <span className="font-medium text-foreground">
                {deletingAdmin?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
