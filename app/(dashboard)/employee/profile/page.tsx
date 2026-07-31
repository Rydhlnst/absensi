"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Building2,
  MapPin,
  Lock,
  Bell,
  Settings,
  Edit3,
  X,
  Check,
  Sun,
  Moon,
  Monitor,
  Shield,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { employees } from "@/data/mock"

const CURRENT_EMPLOYEE_ID = "emp-002"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  employee: "Karyawan",
}

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  employee: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "bg-gray-200", width: "w-0" }
  if (password.length < 4) return { label: "Lemah", color: "bg-red-500", width: "w-1/4" }
  if (password.length < 8) return { label: "Sedang", color: "bg-amber-500", width: "w-2/4" }
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    return { label: "Kuat", color: "bg-emerald-500", width: "w-full" }
  }
  return { label: "Sedang", color: "bg-amber-500", width: "w-3/4" }
}

export default function EmployeeProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notifications, setNotifications] = useState({
    task: true,
    attendance: true,
    reward: true,
    system: false,
  })
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [compactMode, setCompactMode] = useState(false)

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    nik: "",
    npwp: "",
    address: "",
    bankName: "",
    bankAccount: "",
  })

  const employee = useMemo(() => {
    const emp = employees.find((e) => e.id === CURRENT_EMPLOYEE_ID)!
    setFormValues({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      nik: emp.nik,
      npwp: emp.npwp,
      address: emp.address,
      bankName: emp.bankName,
      bankAccount: emp.bankAccount,
    })
    return emp
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    const emp = employees.find((e) => e.id === CURRENT_EMPLOYEE_ID)!
    setFormValues({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      nik: emp.nik,
      npwp: emp.npwp,
      address: emp.address,
      bankName: emp.bankName,
      bankAccount: emp.bankAccount,
    })
    setIsEditing(false)
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan pengaturan akun Anda</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row">
          <Avatar size="lg">
            <AvatarFallback className="text-lg">{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">{employee.name}</h2>
            <p className="text-muted-foreground">
              {employee.position} · {employee.department}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge className={roleColors[employee.role]}>{roleLabels[employee.role]}</Badge>
              <Badge variant="secondary">
                <Calendar className="size-3" />
                Bergabung {format(new Date(employee.joinDate), "dd MMMM yyyy", { locale: id })}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Informasi Profil</TabsTrigger>
          <TabsTrigger value="password">Ubah Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informasi Pribadi</CardTitle>
                  <CardDescription>Detail informasi profil Anda</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit3 className="size-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="size-4" />
                      Batal
                    </Button>
                    <Button onClick={handleSave}>
                      <Check className="size-4" />
                      Simpan
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="email"
                      disabled={!isEditing}
                      value={formValues.email}
                      onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">No. Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.phone}
                      onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIK</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.nik}
                      onChange={(e) => setFormValues({ ...formValues, nik: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NPWP</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.npwp}
                      onChange={(e) => setFormValues({ ...formValues, npwp: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.address}
                      onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.bankName}
                      onChange={(e) => setFormValues({ ...formValues, bankName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">No. Rekening</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      disabled={!isEditing}
                      value={formValues.bankAccount}
                      onChange={(e) => setFormValues({ ...formValues, bankAccount: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>Perbarui password akun Anda untuk menjaga keamanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Saat Ini</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-9"
                    placeholder="Masukkan password saat ini"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-9"
                    placeholder="Masukkan password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className={`h-full rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kekuatan: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Konfirmasi Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-9"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Password tidak cocok</p>
                )}
              </div>
              <Button
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                <Lock className="size-4" />
                Simpan Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Atur notifikasi yang ingin Anda terima</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Bell className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notifikasi Tugas</p>
                    <p className="text-xs text-muted-foreground">
                      Notifikasi saat mendapat tugas baru atau perubahan status tugas
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.task}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, task: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notifikasi Absensi</p>
                    <p className="text-xs text-muted-foreground">
                      Pengingat absensi dan notifikasi terkait kehadiran
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.attendance}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, attendance: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notifikasi Reward</p>
                    <p className="text-xs text-muted-foreground">
                      Notifikasi poin reward diperoleh atau ditukar
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.reward}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, reward: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <Settings className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notifikasi Sistem</p>
                    <p className="text-xs text-muted-foreground">
                      Pembaruan sistem, pemeliharaan, dan informasi penting lainnya
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.system}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, system: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>Sesuaikan tampilan aplikasi sesuai preferensi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Tema</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Sun className="size-5" />
                    <span className="text-sm font-medium">Terang</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Moon className="size-5" />
                    <span className="text-sm font-medium">Gelap</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Monitor className="size-5" />
                    <span className="text-sm font-medium">Sistem</span>
                  </button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Mode Kompak</p>
                  <p className="text-xs text-muted-foreground">
                    Kurangi jarak antar elemen untuk menampilkan lebih banyak konten
                  </p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Bahasa</label>
                <select className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm">
                  <option value="id">Bahasa Indonesia</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Bahasa Indonesia adalah satu-satunya bahasa yang tersedia saat ini
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
