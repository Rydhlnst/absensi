"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

const timeOptions = ["06.00", "07.00", "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00", "17.00", "18.00", "19.00", "20.00"]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
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
}

export default function AdminSettingsPage() {
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
  const [poinBuatTugas, setPoinBuatTugas] = useState("10")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<CompanySettings>("/api/settings")
        if (!cancelled && data) {
          if (data.workingStart) setCheckInTime(data.workingStart.slice(0, 5).replace(":", "."))
          if (data.breakStart) setBreakStart(data.breakStart.slice(0, 5).replace(":", "."))
          if (data.breakEnd) setBreakEnd(data.breakEnd.slice(0, 5).replace(":", "."))
          if (data.workingEnd) setCheckOutTime(data.workingEnd.slice(0, 5).replace(":", "."))
          if (data.lateTolerance != null) setToleranceIn(String(data.lateTolerance))
          if (data.deviceBinding != null) setDeviceBinding(data.deviceBinding)
          if (data.taskSalaryFreeze != null) setTaskSalaryFreeze(data.taskSalaryFreeze)
          if (data.installationPoints != null) setPoinPemasangan(String(data.installationPoints))
          if (data.repairPoints != null) setPoinGangguan(String(data.repairPoints))
          if (data.billingPoints != null) setPoinTagihan(String(data.billingPoints))
        }
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat pengaturan")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.put("/api/settings", {
        id: "default",
        workingStart: checkInTime.replace(".", ":"),
        workingEnd: checkOutTime.replace(".", ":"),
        breakStart: breakStart.replace(".", ":"),
        breakEnd: breakEnd.replace(".", ":"),
        lateTolerance: parseInt(toleranceIn) || 0,
        deviceBinding,
        taskSalaryFreeze,
        installationPoints: parseInt(poinPemasangan) || 0,
        repairPoints: parseInt(poinGangguan) || 0,
        billingPoints: parseInt(poinTagihan) || 0,
      })
      toast.success("Pengaturan berhasil disimpan!")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
  const labelClass = "text-sm font-medium text-gray-700 mb-1.5 block"

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
        <div>
          <label className={labelClass}>Jadwal Jam Masuk</label>
          <select value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className={fieldClass}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Mulai Istirahat</label>
          <select value={breakStart} onChange={(e) => setBreakStart(e.target.value)} className={fieldClass}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Selesai Istirahat</label>
          <select value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} className={fieldClass}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jadwal Selesai Pulang</label>
          <select value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className={fieldClass}>
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <label className={labelClass}>Toleransi Keterlambatan Jam Masuk (Menit)</label>
          <input type="number" value={toleranceIn} onChange={(e) => setToleranceIn(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Toleransi Keterlambatan Selesai Istirahat (Menit)</label>
          <input type="number" value={toleranceBreak} onChange={(e) => setToleranceBreak(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-primary mb-2">Keamanan Absensi &amp; Kontrol Gaji</h2>
        <div className="space-y-3">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-extrabold text-primary uppercase tracking-wide">Pengikatan Perangkat (Device Binding)</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Jika aktif, akun karyawan akan otomatis diikat ke perangkat HP pertama yang digunakan untuk absensi. Karyawan tidak bisa absen menggunakan perangkat HP lain kecuali di-reset oleh Admin.
              </p>
            </div>
            <div className="pt-1">
              <Toggle checked={deviceBinding} onChange={setDeviceBinding} />
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-extrabold text-primary uppercase tracking-wide">Pembekuan Gaji Berbasis Tugas (Task Salary Freeze)</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Jika aktif, jam kerja &amp; gaji karyawan otomatis dibekukan (paused) jika masih ada tugas namun karyawan berada di geofence kantor. Jika dimatikan, jam kerja &amp; gaji berjalan normal tanpa dibekukan.
              </p>
            </div>
            <div className="pt-1">
              <Toggle checked={taskSalaryFreeze} onChange={setTaskSalaryFreeze} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-primary mb-2">Poin Hadiah Per Kategori Tugas</h2>
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
          <div>
            <label className={labelClass}>Poin Pemasangan</label>
            <input type="number" value={poinPemasangan} onChange={(e) => setPoinPemasangan(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Poin Gangguan</label>
            <input type="number" value={poinGangguan} onChange={(e) => setPoinGangguan(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Poin Tagihan</label>
            <input type="number" value={poinTagihan} onChange={(e) => setPoinTagihan(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Poin Membuat Tugas (Karyawan)</label>
            <input type="number" value={poinBuatTugas} onChange={(e) => setPoinBuatTugas(e.target.value)} className={fieldClass} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : "Simpan Pengaturan"}
      </button>
    </div>
  )
}
