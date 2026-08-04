"use client"

import { useState, useEffect, useRef, useCallback, useTransition } from "react"
import { Loader2, Upload, MapPin, Building2, Trash2, Plus, Star, Crosshair, Shield } from "lucide-react"
import { apiClient } from "@/lib/api"
import { uploadToR2 } from "@/lib/upload"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

const timeOptions = ["06.00", "07.00", "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00", "17.00", "18.00", "19.00", "20.00"]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-primary" : "bg-muted"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

interface CompanySettings {
  id: string
  name: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo: string | null
  latitude: number | null
  longitude: number | null
  workingStart: string | null
  workingEnd: string | null
  breakStart: string | null
  breakEnd: string | null
  lateTolerance: number | null
  gpsRadius: number | null
  taskSalaryFreeze: boolean | null
  deviceBinding: boolean | null
  installationPoints: number | null
  repairPoints: number | null
  billingPoints: number | null
  maintenancePoints: number | null
  inspectionPoints: number | null
}

interface OfficeBranch {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  isMain: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SettingsPageProps {
  role: "admin" | "super_admin"
}

export default function SettingsPage({ role }: SettingsPageProps) {
  const isAdmin = role === "admin"
  const canEdit = !isAdmin

  const [checkInTime, setCheckInTime] = useState("08.00")
  const [breakStart, setBreakStart] = useState("12.00")
  const [breakEnd, setBreakEnd] = useState("13.00")
  const [checkOutTime, setCheckOutTime] = useState("17.00")
  const [toleranceIn, setToleranceIn] = useState("30")
  const [toleranceBreak, setToleranceBreak] = useState("30")
  const [deviceBinding, setDeviceBinding] = useState(true)
  const [taskSalaryFreeze, setTaskSalaryFreeze] = useState(true)
  const [poinPemasangan, setPoinPemasangan] = useState("100")
  const [poinGangguan, setPoinGangguan] = useState("50")
  const [poinTagihan, setPoinTagihan] = useState("20")
  const [poinMaintenance, setPoinMaintenance] = useState("50")
  const [poinInspeksi, setPoinInspeksi] = useState("30")
  const [poinBuatTugas, setPoinBuatTugas] = useState("10")

  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyLat, setCompanyLat] = useState("")
  const [companyLng, setCompanyLng] = useState("")
  const [gpsRadius, setGpsRadius] = useState("100")

  const [branches, setBranches] = useState<OfficeBranch[]>([])
  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<OfficeBranch | null>(null)
  const [branchForm, setBranchForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radius: "100",
    isMain: false,
    isActive: true,
  })
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [settings, branchList] = await Promise.all([
        apiClient.get<CompanySettings>("/api/settings", undefined, { useLocalCache: true, cacheTTL: 5 * 60 * 1000 }),
        apiClient.get<OfficeBranch[]>("/api/branches", undefined, { useLocalCache: true, cacheTTL: 5 * 60 * 1000 }),
      ])
      if (settings) {
        if (settings.workingStart) setCheckInTime(settings.workingStart.slice(0, 5).replace(":", "."))
        if (settings.breakStart) setBreakStart(settings.breakStart.slice(0, 5).replace(":", "."))
        if (settings.breakEnd) setBreakEnd(settings.breakEnd.slice(0, 5).replace(":", "."))
        if (settings.workingEnd) setCheckOutTime(settings.workingEnd.slice(0, 5).replace(":", "."))
        if (settings.lateTolerance != null) setToleranceIn(String(settings.lateTolerance))
        if (settings.deviceBinding != null) setDeviceBinding(settings.deviceBinding)
        if (settings.taskSalaryFreeze != null) setTaskSalaryFreeze(settings.taskSalaryFreeze)
        if (settings.installationPoints != null) setPoinPemasangan(String(settings.installationPoints))
        if (settings.repairPoints != null) setPoinGangguan(String(settings.repairPoints))
        if (settings.billingPoints != null) setPoinTagihan(String(settings.billingPoints))
        if (settings.maintenancePoints != null) setPoinMaintenance(String(settings.maintenancePoints))
        if (settings.inspectionPoints != null) setPoinInspeksi(String(settings.inspectionPoints))
        setCompanyName(settings.name || "")
        setCompanyAddress(settings.address || "")
        setCompanyPhone(settings.phone || "")
        setCompanyEmail(settings.email || "")
        setCompanyLogo(settings.logo || null)
        if (settings.latitude != null) setCompanyLat(String(settings.latitude))
        if (settings.longitude != null) setCompanyLng(String(settings.longitude))
        if (settings.gpsRadius != null) setGpsRadius(String(settings.gpsRadius))
      }
      if (branchList) setBranches(branchList)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat pengaturan")
    } finally {
      setLoading(false)
    }
  }, [])

  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      void loadData()
    })
  }, [loadData, startTransition])

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) { toast.error("Hanya Super Admin yang dapat mengubah logo"); return }
    const file = event.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const publicUrl = await uploadToR2(file, "logos")
      setCompanyLogo(publicUrl)
      toast.success("Logo berhasil diupload (klik Simpan untuk menyimpan)")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal upload logo")
    } finally {
      setLogoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleGetCurrentLocation = () => {
    if (!canEdit) { toast.error("Hanya Super Admin yang dapat mengubah lokasi"); return }
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung geolocation")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCompanyLat(String(pos.coords.latitude.toFixed(6)))
        setCompanyLng(String(pos.coords.longitude.toFixed(6)))
        toast.success("Lokasi berhasil dideteksi")
      },
      () => {
        toast.error("Gagal mendeteksi lokasi. Pastikan GPS aktif dan izinkan akses lokasi.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("Hanya Super Admin yang dapat mengubah pengaturan ini")
      return
    }
    setSaving(true)
    try {
      await apiClient.put("/api/settings", {
        id: "default",
        name: companyName,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        logo: companyLogo,
        latitude: companyLat ? parseFloat(companyLat) : null,
        longitude: companyLng ? parseFloat(companyLng) : null,
        workingStart: checkInTime.replace(".", ":"),
        workingEnd: checkOutTime.replace(".", ":"),
        breakStart: breakStart.replace(".", ":"),
        breakEnd: breakEnd.replace(".", ":"),
        lateTolerance: parseInt(toleranceIn) || 0,
        gpsRadius: parseInt(gpsRadius) || 100,
        deviceBinding,
        taskSalaryFreeze,
        installationPoints: parseInt(poinPemasangan) || 0,
        repairPoints: parseInt(poinGangguan) || 0,
        billingPoints: parseInt(poinTagihan) || 0,
        maintenancePoints: parseInt(poinMaintenance) || 0,
        inspectionPoints: parseInt(poinInspeksi) || 0,
      })
      const { removeCache } = await import("@/lib/cache")
      removeCache("GET:/api/settings")
      toast.success("Pengaturan berhasil disimpan!")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const openBranchDialog = (branch: OfficeBranch | null = null) => {
    if (!canEdit) { toast.error("Hanya Super Admin yang dapat mengubah kantor cabang"); return }
    if (branch) {
      setEditingBranch(branch)
      setBranchForm({
        name: branch.name,
        address: branch.address,
        latitude: String(branch.latitude),
        longitude: String(branch.longitude),
        radius: String(branch.radius),
        isMain: branch.isMain,
        isActive: branch.isActive,
      })
    } else {
      setEditingBranch(null)
      setBranchForm({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        radius: "100",
        isMain: false,
        isActive: true,
      })
    }
    setBranchDialogOpen(true)
  }

  const handleSaveBranch = async () => {
    if (!branchForm.name || !branchForm.address || !branchForm.latitude || !branchForm.longitude) {
      toast.error("Semua field wajib diisi")
      return
    }
    try {
      const payload = {
        name: branchForm.name,
        address: branchForm.address,
        latitude: parseFloat(branchForm.latitude),
        longitude: parseFloat(branchForm.longitude),
        radius: parseInt(branchForm.radius) || 100,
        isMain: branchForm.isMain,
        isActive: branchForm.isActive,
      }
      if (editingBranch) {
        await apiClient.put("/api/branches", { id: editingBranch.id, ...payload })
        toast.success("Kantor cabang berhasil diperbarui")
      } else {
        await apiClient.post("/api/branches", payload)
        toast.success("Kantor cabang berhasil ditambahkan")
      }
      setBranchDialogOpen(false)
      const { removeCache } = await import("@/lib/cache")
      removeCache("GET:/api/branches")
      const data = await apiClient.get<OfficeBranch[]>("/api/branches", undefined, { useLocalCache: false })
      setBranches(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan kantor cabang")
    }
  }

  const handleDeleteBranch = async (id: string) => {
    try {
      await apiClient.delete(`/api/branches?id=${id}`)
      toast.success("Kantor cabang berhasil dihapus")
      setDeletingBranchId(null)
      const { removeCache } = await import("@/lib/cache")
      removeCache("GET:/api/branches")
      const data = await apiClient.get<OfficeBranch[]>("/api/branches", undefined, { useLocalCache: false })
      setBranches(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus kantor cabang")
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung browser ini")
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        setBranchForm((f) => ({ ...f, latitude: lat, longitude: lng }))
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`)
          const data = await res.json()
          if (data.display_name) {
            setBranchForm((f) => ({ ...f, address: data.display_name.split(",").slice(0, 3).join(",").trim() }))
          }
        } catch { /* ignore */ }
        setGettingLocation(false)
        toast.success("Lokasi berhasil dideteksi")
      },
      () => {
        setGettingLocation(false)
        toast.error("Gagal mendapatkan lokasi. Pastikan GPS aktif.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const fieldClass = `w-full rounded-xl border bg-card px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${canEdit ? "border-border" : "border-border/50 bg-background cursor-not-allowed"}`
  const labelClass = "text-sm font-medium text-foreground mb-1.5 block"

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Perusahaan</h1>
        <p className="text-muted-foreground">Konfigurasi informasi dan pengaturan sistem</p>
      </div>

      {isAdmin && (
        <div className="rounded-2xl bg-warning/10 border border-warning/30 p-3 flex items-center gap-3">
          <Shield className="size-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning">Mode Admin (Read-Only)</p>
            <p className="text-xs text-warning">Anda hanya dapat melihat pengaturan. Hubungi Super Admin untuk perubahan.</p>
          </div>
        </div>
      )}

      {/* Company Identity */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <Building2 className="size-4" />
          Identitas Perusahaan
        </h2>

        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyLogo}
                alt="Logo"
                className="size-20 rounded-xl object-contain border border-border bg-white p-1"
              />
            ) : (
              <div className="size-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-background">
                <Building2 className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => canEdit && !logoUploading ? fileInputRef.current?.click() : undefined}
              disabled={!canEdit || logoUploading}
              className={`w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${canEdit && !logoUploading ? "border-border bg-white text-foreground hover:bg-muted/50" : "border-border/50 bg-background text-muted-foreground cursor-not-allowed"}`}
            >
              {logoUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {logoUploading ? "Mengupload..." : companyLogo ? "Ganti Logo" : "Upload Logo"}
            </button>
            {companyLogo && canEdit && (
              <button
                type="button"
                onClick={() => setCompanyLogo(null)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />
                Hapus Logo
              </button>
            )}
            <p className="text-[10px] text-muted-foreground text-center">Maks. 5MB (PNG, JPG, WebP, GIF)</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Nama Perusahaan</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => canEdit && setCompanyName(e.target.value)}
            className={fieldClass}
            placeholder="PT Mitra Solusindo"
            readOnly={!canEdit}
          />
        </div>

        <div>
          <label className={labelClass}>Alamat</label>
          <input
            type="text"
            value={companyAddress}
            onChange={(e) => canEdit && setCompanyAddress(e.target.value)}
            className={fieldClass}
            placeholder="Jl. TB Simatupang No. 88, Jakarta"
            readOnly={!canEdit}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Telepon</label>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => canEdit && setCompanyPhone(e.target.value)}
              className={fieldClass}
              placeholder="+6221..."
              readOnly={!canEdit}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => canEdit && setCompanyEmail(e.target.value)}
              className={fieldClass}
              placeholder="info@..."
              readOnly={!canEdit}
            />
          </div>
        </div>
      </div>

      {/* Office Coordinates & Geofence */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <MapPin className="size-4" />
          Lokasi Kantor & Geofence
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              type="number"
              step="any"
              value={companyLat}
              onChange={(e) => canEdit && setCompanyLat(e.target.value)}
              className={fieldClass}
              placeholder="-6.2297"
              readOnly={!canEdit}
            />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input
              type="number"
              step="any"
              value={companyLng}
              onChange={(e) => canEdit && setCompanyLng(e.target.value)}
              className={fieldClass}
              placeholder="106.8197"
              readOnly={!canEdit}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className={`w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${canEdit ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" : "border-border/50 bg-background text-muted-foreground cursor-not-allowed"}`}
        >
          <MapPin className="size-4" />
          Deteksi Lokasi Saya
        </button>

        <div>
          <label className={labelClass}>Radius GPS (Meter)</label>
          <input
            type="number"
            value={gpsRadius}
            onChange={(e) => canEdit && setGpsRadius(e.target.value)}
            className={fieldClass}
            placeholder="100"
            readOnly={!canEdit}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Karyawan hanya bisa absen dalam radius ini dari titik koordinat
          </p>
        </div>
      </div>

      {/* Office Branches */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Building2 className="size-4" />
            Kantor Cabang ({branches.length})
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={() => openBranchDialog(null)}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Tambah
            </button>
          )}
        </div>

        {branches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Building2 className="size-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada kantor cabang</p>
            <p className="text-xs text-muted-foreground mt-1">
              {canEdit ? "Tambahkan kantor cabang untuk lokasi tambahan" : "Belum ada kantor cabang yang dikonfigurasi"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl border border-border p-3 flex items-start gap-3 bg-card"
              >
                <div className={`shrink-0 size-10 rounded-lg flex items-center justify-center ${
                  branch.isMain ? "bg-warning/20" : "bg-muted"
                }`}>
                  {branch.isMain ? (
                    <Star className="size-5 text-warning fill-warning" />
                  ) : (
                    <Building2 className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{branch.name}</p>
                    {branch.isMain && (
                      <span className="px-1.5 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-bold">
                        PUSAT
                      </span>
                    )}
                    {!branch.isActive && (
                      <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                        OFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{branch.address}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)} • Radius {branch.radius}m
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openBranchDialog(branch)}
                      className="size-8 rounded-lg border border-border bg-white flex items-center justify-center text-muted-foreground hover:bg-muted/50"
                    >
                      <Upload className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingBranchId(branch.id)}
                      className="size-8 rounded-lg border border-red-200 bg-white flex items-center justify-center text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Work Schedule */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <h2 className="text-base font-bold text-primary">Jadwal Kerja</h2>

        <div>
          <label className={labelClass}>Jadwal Jam Masuk</label>
          <select value={checkInTime} onChange={(e) => canEdit && setCheckInTime(e.target.value)} className={fieldClass} disabled={!canEdit}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Mulai Istirahat</label>
          <select value={breakStart} onChange={(e) => canEdit && setBreakStart(e.target.value)} className={fieldClass} disabled={!canEdit}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Selesai Istirahat</label>
          <select value={breakEnd} onChange={(e) => canEdit && setBreakEnd(e.target.value)} className={fieldClass} disabled={!canEdit}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jadwal Selesai Pulang</label>
          <select value={checkOutTime} onChange={(e) => canEdit && setCheckOutTime(e.target.value)} className={fieldClass} disabled={!canEdit}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="border-t border-border pt-3">
          <label className={labelClass}>Toleransi Keterlambatan Jam Masuk (Menit)</label>
          <input type="number" value={toleranceIn} onChange={(e) => canEdit && setToleranceIn(e.target.value)} className={fieldClass} readOnly={!canEdit} />
        </div>
        <div>
          <label className={labelClass}>Toleransi Keterlambatan Selesai Istirahat (Menit)</label>
          <input type="number" value={toleranceBreak} onChange={(e) => canEdit && setToleranceBreak(e.target.value)} className={fieldClass} readOnly={!canEdit} />
        </div>
      </div>

      {/* Security & Salary Controls */}
      <div>
        <h2 className="text-base font-bold text-primary mb-2">Keamanan Absensi &amp; Kontrol Gaji</h2>
        <div className="space-y-3">
          <div className="rounded-2xl bg-card shadow-sm border border-border p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-extrabold text-primary uppercase tracking-wide">Pengikatan Perangkat (Device Binding)</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Jika aktif, akun karyawan akan otomatis diikat ke perangkat HP pertama yang digunakan untuk absensi. Karyawan tidak bisa absen menggunakan perangkat HP lain kecuali di-reset oleh Admin.
              </p>
            </div>
            <div className="pt-1">
              <Toggle checked={deviceBinding} onChange={setDeviceBinding} disabled={!canEdit} />
            </div>
          </div>
          <div className="rounded-2xl bg-card shadow-sm border border-border p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-extrabold text-primary uppercase tracking-wide">Pembekuan Gaji Berbasis Tugas (Task Salary Freeze)</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Jika aktif, jam kerja &amp; gaji karyawan otomatis dibekukan (paused) jika masih ada tugas namun karyawan berada di geofence kantor. Jika dimatikan, jam kerja &amp; gaji berjalan normal tanpa dibekukan.
              </p>
            </div>
            <div className="pt-1">
              <Toggle checked={taskSalaryFreeze} onChange={setTaskSalaryFreeze} disabled={!canEdit} />
            </div>
          </div>
        </div>
      </div>

      {/* Points Configuration */}
      <div>
        <h2 className="text-base font-bold text-primary mb-2">Poin Hadiah Per Kategori Tugas</h2>
        <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
          <div>
            <label className={labelClass}>Poin Pemasangan</label>
            <input type="number" value={poinPemasangan} onChange={(e) => canEdit && setPoinPemasangan(e.target.value)} className={fieldClass} readOnly={!canEdit} />
          </div>
          <div>
            <label className={labelClass}>Poin Gangguan</label>
            <input type="number" value={poinGangguan} onChange={(e) => canEdit && setPoinGangguan(e.target.value)} className={fieldClass} readOnly={!canEdit} />
          </div>
          <div>
            <label className={labelClass}>Poin Tagihan</label>
            <input type="number" value={poinTagihan} onChange={(e) => canEdit && setPoinTagihan(e.target.value)} className={fieldClass} readOnly={!canEdit} />
          </div>
          <div>
            <label className={labelClass}>Poin Maintenance</label>
            <input type="number" value={poinMaintenance} onChange={(e) => canEdit && setPoinMaintenance(e.target.value)} className={fieldClass} readOnly={!canEdit} />
          </div>
          <div>
            <label className={labelClass}>Poin Inspeksi</label>
            <input type="number" value={poinInspeksi} onChange={(e) => canEdit && setPoinInspeksi(e.target.value)} className={fieldClass} readOnly={!canEdit} />
          </div>
          <div>
            <label className={labelClass}>Poin Membuat Tugas (Karyawan)</label>
            <input type="number" value={poinBuatTugas} onChange={(e) => canEdit && setPoinBuatTugas(e.target.value)} className={fieldClass} readOnly={!canEdit} />
          </div>
        </div>
      </div>

      {canEdit && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : "Simpan Pengaturan"}
        </button>
      )}

      {/* Branch Dialog */}
      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Kantor Cabang" : "Tambah Kantor Cabang"}</DialogTitle>
            <DialogDescription>
              Tambahkan lokasi kantor tambahan untuk mendukung multi-cabang
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Nama Cabang *</Label>
              <input
                type="text"
                value={branchForm.name}
                onChange={(e) => setBranchForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Kantor Pusat Jakarta"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Alamat *</Label>
              <input
                type="text"
                value={branchForm.address}
                onChange={(e) => setBranchForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Jl. Sudirman No. 1, Jakarta"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Latitude *</Label>
                <input
                  type="number"
                  step="any"
                  value={branchForm.latitude}
                  onChange={(e) => setBranchForm((f) => ({ ...f, latitude: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="-6.2088"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Longitude *</Label>
                <input
                  type="number"
                  step="any"
                  value={branchForm.longitude}
                  onChange={(e) => setBranchForm((f) => ({ ...f, longitude: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="106.8456"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {gettingLocation ? (
                <><Loader2 className="size-4 animate-spin" /> Mendeteksi lokasi...</>
              ) : (
                <><Crosshair className="size-4" /> Ambil Lokasi Saat Ini</>
              )}
            </button>

            {branchForm.latitude && branchForm.longitude && (
              <div className="rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${branchForm.longitude},${branchForm.latitude}&zoom=15&marker=lonlat:${branchForm.longitude},${branchForm.latitude};color:%23ff0000;size:medium&apiKey=demo`}
                  alt="Map preview"
                  className="w-full h-40 object-cover bg-muted"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-full h-40 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                        <div class="text-center">
                          <svg class="size-8 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <p class="text-xs text-muted-foreground">${branchForm.latitude}, ${branchForm.longitude}</p>
                        </div>
                      </div>
                    `
                  }}
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Radius GPS (Meter)</Label>
              <input
                type="number"
                value={branchForm.radius}
                onChange={(e) => setBranchForm((f) => ({ ...f, radius: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="100"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Jadikan Kantor Pusat</p>
                <p className="text-xs text-muted-foreground">Cabang utama sebagai default</p>
              </div>
              <input
                type="checkbox"
                checked={branchForm.isMain}
                onChange={(e) => setBranchForm((f) => ({ ...f, isMain: e.target.checked }))}
                className="size-5 accent-primary"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-semibold">Status Aktif</p>
                <p className="text-xs text-muted-foreground">Cabang dapat digunakan untuk absensi</p>
              </div>
              <input
                type="checkbox"
                checked={branchForm.isActive}
                onChange={(e) => setBranchForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="size-5 accent-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveBranch} className="bg-primary">
              {editingBranch ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingBranchId} onOpenChange={(o) => !o && setDeletingBranchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kantor Cabang?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Cabang akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingBranchId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingBranchId && handleDeleteBranch(deletingBranchId)}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-xs font-semibold mb-1.5 block ${className || ""}`}>{children}</label>
}
