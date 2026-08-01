"use client"

import { useState } from "react"
import {
  Clock,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Tag,
  Award,
  Building2,
  Save,
  Plus,
  X,
  Upload,
  Trash2,
  Snowflake,
  Smartphone,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { companySetting } from "@/data/mock"
import type { TaskCategory } from "@/types"

const categoryLabel: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Penagihan",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const holidayNameMap: Record<string, string> = {
  "2025-08-17": "Hari Kemerdekaan RI",
  "2025-08-18": "Cuti Bersama Agustus",
  "2025-12-25": "Hari Natal",
  "2025-12-26": "Cuti Bersama Natal",
  "2026-01-01": "Tahun Baru",
  "2026-01-29": "Isra Mi'raj",
  "2026-01-30": "Cuti Bersama Isra Mi'raj",
  "2026-03-29": "Wafat Isa Almasih",
  "2026-04-01": "Cuti Bersama Wafat Isa Almasih",
  "2026-04-02": "Hari Raya Nyepi",
  "2026-05-01": "Hari Buruh",
  "2026-05-14": "Kenaikan Isa Almasih",
  "2026-05-15": "Cuti Bersama Kenaikan Isa Almasih",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-27": "Hari Raya Idul Adha",
  "2026-08-17": "Hari Kemerdekaan RI",
  "2026-08-18": "Cuti Bersama Agustus",
  "2026-09-05": "Tahun Baru Islam",
  "2026-11-06": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Natal",
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("working_hours")

  const [workingStart, setWorkingStart] = useState(companySetting.workingHours.start)
  const [workingEnd, setWorkingEnd] = useState(companySetting.workingHours.end)
  const [breakStart, setBreakStart] = useState("12:00")
  const [breakEnd, setBreakEnd] = useState("13:00")

  const [lateTolerance, setLateTolerance] = useState(companySetting.lateTolerance)
  const [autoAbsentMinutes, setAutoAbsentMinutes] = useState(60)

  const [gpsRadius, setGpsRadius] = useState(companySetting.gpsRadius)
  const [companyLat, setCompanyLat] = useState(String(companySetting.latitude))
  const [companyLng, setCompanyLng] = useState(String(companySetting.longitude))

  const [holidays, setHolidays] = useState(
    companySetting.holidays.map((date) => ({
      date,
      name: holidayNameMap[date] || "Hari Libur",
    }))
  )
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [newHolidayName, setNewHolidayName] = useState("")

  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([...companySetting.taskCategories])
  const [newCategory, setNewCategory] = useState("")

  const [rewardSettings, setRewardSettings] = useState({
    installationPoints: companySetting.rewardSettings.installationPoints,
    maintenancePoints: companySetting.rewardSettings.maintenancePoints,
    billingPoints: companySetting.rewardSettings.billingPoints,
    repairPoints: companySetting.rewardSettings.repairPoints,
    inspectionPoints: companySetting.rewardSettings.inspectionPoints,
    monthlyBonus: companySetting.rewardSettings.monthlyBonus,
    attendanceBonus: companySetting.rewardSettings.attendanceBonus,
  })

  const [companyName, setCompanyName] = useState(companySetting.name)
  const [companyAddress, setCompanyAddress] = useState(companySetting.address)
  const [companyPhone, setCompanyPhone] = useState(companySetting.phone)
  const [companyEmail, setCompanyEmail] = useState(companySetting.email)

  const [taskSalaryFreeze, setTaskSalaryFreeze] = useState(true)
  const [deviceBinding, setDeviceBinding] = useState(false)

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName) return
    setHolidays([...holidays, { date: newHolidayDate, name: newHolidayName }])
    setNewHolidayDate("")
    setNewHolidayName("")
  }

  const handleRemoveHoliday = (date: string) => {
    setHolidays(holidays.filter((h) => h.date !== date))
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    const slug = newCategory.toLowerCase().trim().replace(/\s+/g, "_") as TaskCategory
    if (!taskCategories.includes(slug)) {
      setTaskCategories([...taskCategories, slug])
    }
    setNewCategory("")
  }

  const handleRemoveCategory = (cat: TaskCategory) => {
    setTaskCategories(taskCategories.filter((c) => c !== cat))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi sistem aplikasi</p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="working_hours">
            <Clock className="size-4" />
            Jam Kerja
          </TabsTrigger>
          <TabsTrigger value="late_tolerance">
            <AlertTriangle className="size-4" />
            Toleransi Keterlambatan
          </TabsTrigger>
          <TabsTrigger value="gps">
            <MapPin className="size-4" />
            GPS
          </TabsTrigger>
          <TabsTrigger value="holidays">
            <CalendarDays className="size-4" />
            Hari Libur
          </TabsTrigger>
          <TabsTrigger value="task_categories">
            <Tag className="size-4" />
            Kategori Tugas
          </TabsTrigger>
          <TabsTrigger value="reward_settings">
            <Award className="size-4" />
            Pengaturan Reward
          </TabsTrigger>
          <TabsTrigger value="company_info">
            <Building2 className="size-4" />
            Informasi Perusahaan
          </TabsTrigger>
          <TabsTrigger value="salary_freeze">
            <Snowflake className="size-4" />
            Pembekuan Gaji
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4" />
            Keamanan & Gaji
          </TabsTrigger>
        </TabsList>

        <TabsContent value="working_hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jam Kerja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Jam Mulai Kerja</label>
                  <Input
                    type="time"
                    value={workingStart}
                    onChange={(e) => setWorkingStart(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Jam Selesai Kerja</label>
                  <Input
                    type="time"
                    value={workingEnd}
                    onChange={(e) => setWorkingEnd(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Jam Mulai Istirahat</label>
                  <Input
                    type="time"
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Jam Selesai Istirahat</label>
                  <Input
                    type="time"
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="late_tolerance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toleransi Keterlambatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Toleransi Keterlambatan (Menit)</label>
                  <Input
                    type="number"
                    value={lateTolerance}
                    onChange={(e) => setLateTolerance(Number(e.target.value))}
                    min={0}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Karyawan dianggap terlambat jika melewati batas ini
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tandai Tidak Hadir Setelah (Menit)</label>
                  <Input
                    type="number"
                    value={autoAbsentMinutes}
                    onChange={(e) => setAutoAbsentMinutes(Number(e.target.value))}
                    min={0}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Karyawan otomatis ditandai tidak hadir setelah durasi ini
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan GPS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Radius GPS (Meter)</label>
                  <Input
                    type="number"
                    value={gpsRadius}
                    onChange={(e) => setGpsRadius(Number(e.target.value))}
                    min={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Jarak maksimal dari kantor untuk absensi
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Latitude Kantor</label>
                  <Input
                    type="text"
                    value={companyLat}
                    onChange={(e) => setCompanyLat(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Longitude Kantor</label>
                  <Input
                    type="text"
                    value={companyLng}
                    onChange={(e) => setCompanyLng(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Hari Libur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tanggal</label>
                  <Input
                    type="date"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nama Hari Libur</label>
                  <Input
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    placeholder="Contoh: Tahun Baru"
                    className="w-64"
                  />
                </div>
                <Button onClick={handleAddHoliday}>
                  <Plus className="size-4" />
                  Tambah
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((h) => (
                      <TableRow key={h.date}>
                        <TableCell>
                          <span className="font-medium">
                            {new Date(h.date).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{h.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveHoliday(h.date)}
                          >
                            <X className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task_categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Tugas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nama Kategori Baru</label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Contoh: Delivery"
                    className="w-64"
                  />
                </div>
                <Button onClick={handleAddCategory}>
                  <Plus className="size-4" />
                  Tambah Kategori
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Kategori</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskCategories.map((cat) => (
                    <TableRow key={cat}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{cat}</code>
                      </TableCell>
                      <TableCell className="font-medium">
                        {categoryLabel[cat] || cat}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveCategory(cat)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reward_settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Poin Reward per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Instalasi (Poin)</label>
                  <Input
                    type="number"
                    value={rewardSettings.installationPoints}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, installationPoints: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Maintenance (Poin)</label>
                  <Input
                    type="number"
                    value={rewardSettings.maintenancePoints}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, maintenancePoints: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Penagihan (Poin)</label>
                  <Input
                    type="number"
                    value={rewardSettings.billingPoints}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, billingPoints: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Perbaikan (Poin)</label>
                  <Input
                    type="number"
                    value={rewardSettings.repairPoints}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, repairPoints: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Inspeksi (Poin)</label>
                  <Input
                    type="number"
                    value={rewardSettings.inspectionPoints}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, inspectionPoints: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bonus Poin Bulanan</label>
                  <Input
                    type="number"
                    value={rewardSettings.monthlyBonus}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, monthlyBonus: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Poin bonus yang diberikan setiap akhir bulan
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bonus Poin Kehadiran</label>
                  <Input
                    type="number"
                    value={rewardSettings.attendanceBonus}
                    onChange={(e) =>
                      setRewardSettings({ ...rewardSettings, attendanceBonus: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Poin bonus untuk karyawan hadir sempurna
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company_info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Perusahaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nama Perusahaan</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Telepon</label>
                  <Input
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Alamat</label>
                  <Textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Logo Perusahaan</label>
                  <div className="flex items-center gap-4">
                    <div className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed bg-muted/50">
                      <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="size-4" />
                        Pilih File
                      </Button>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Format: PNG, JPG, SVG. Maks 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary_freeze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pembekuan Gaji Berbasis Tugas (Task Salary Freeze)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Aktifkan Pembekuan Gaji</p>
                  <p className="text-sm text-muted-foreground">
                    Jika aktif, jam kerja & gaji karyawan otomatis dibekukan (paused) jika masih ada tugas namun karyawan berada di geofence kantor. Jika dimatikan, jam kerja & gaji berjalan normal tanpa dibekukan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTaskSalaryFreeze(!taskSalaryFreeze)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    taskSalaryFreeze ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      taskSalaryFreeze ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <h4 className="font-medium mb-2">Kondisi Pembekuan Gaji:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Karyawan memiliki tugas dengan status <strong>pending</strong> atau <strong>in_progress</strong></li>
                    <li>• Karyawan berada di dalam geofence kantor (radius {companySetting.gpsRadius}m)</li>
                    <li>• Jam kerja dan gaji akan <strong>dibekukan</strong> sampai tugas diselesaikan atau karyawan keluar dari geofence</li>
                    <li>• Jika toggle dimatikan, semua berjalan normal tanpa pembekuan</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="size-5" />
                PENGIKATAN PERANGKAT (DEVICE BINDING)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Aktifkan Pengikatan Perangkat</p>
                  <p className="text-sm text-muted-foreground">
                    Jika aktif, akun karyawan akan otomatis dikaitkan ke perangkat HP pertama yang digunakan untuk absensi. Karyawan tidak bisa absen menggunakan perangkat HP lain kecuali di-reset oleh Admin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeviceBinding(!deviceBinding)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    deviceBinding ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      deviceBinding ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <h4 className="font-medium mb-2">Cara Kerja Device Binding:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Saat pertama kali karyawan absen, Device ID HP akan tercatat otomatis</li>
                    <li>• Selanjutnya, hanya Device ID yang sama yang diperbolehkan untuk absensi</li>
                    <li>• Jika karyawan ingin berganti HP, Admin harus reset Device ID terlebih dahulu</li>
                    <li>• Reset dapat dilakukan dari halaman manajemen karyawan</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Snowflake className="size-5" />
                PEMBEKUAN GAJI BERBASIS TUGAS (TASK SALARY FREEZE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Aktifkan Pembekuan Gaji</p>
                  <p className="text-sm text-muted-foreground">
                    Jika aktif, jam kerja & gaji karyawan otomatis dibekukan (paused) jika masih ada tugas namun karyawan berada di geofence kantor. Jika dimatikan, jam kerja & gaji berjalan normal tanpa dibekukan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTaskSalaryFreeze(!taskSalaryFreeze)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    taskSalaryFreeze ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      taskSalaryFreeze ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <h4 className="font-medium mb-2">Kondisi Pembekuan Gaji:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Karyawan memiliki tugas dengan status <strong>pending</strong> atau <strong>in_progress</strong></li>
                    <li>• Karyawan berada di dalam geofence kantor (radius {companySetting.gpsRadius}m)</li>
                    <li>• Jam kerja dan gaji akan <strong>dibekukan</strong> sampai tugas diselesaikan atau karyawan keluar dari geofence</li>
                    <li>• Jika toggle dimatikan, semua berjalan normal tanpa pembekuan</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button>
                  <Save className="size-4" />
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
