"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { AttendanceHistorySkeleton } from "@/components/skeletons"
import { toast } from "sonner"
import type { AttendanceStatus } from "@/types"

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const statusLabel: Record<AttendanceStatus, string> = {
  present: "Hadir",
  late: "Terlambat",
  absent: "Tidak Hadir",
  leave: "Cuti",
  holiday: "Libur",
}

const statusDotColor: Record<AttendanceStatus, string> = {
  present: "bg-green-500",
  late: "bg-yellow-500",
  absent: "bg-red-500",
  leave: "bg-blue-500",
  holiday: "bg-gray-400",
}

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  workingDuration: number
}

interface UserProfile {
  id: string
  name: string
  salary: number
}

function formatTime(isoStr: string | null): string {
  if (!isoStr) return "--:--"
  return new Date(isoStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function formatDurationShort(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}j ${m}m`
}

type FilterType = "hari" | "bulan" | "tahun" | "rentang"

export default function AttendanceHistoryPage() {
  const { data: session } = authClient.useSession()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>("bulan")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(format(new Date(), "yyyy-MM-dd"))
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")

  const currentUserId = session?.user?.id || ""

  useEffect(() => {
    if (!currentUserId) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [att, users] = await Promise.all([
          apiClient.get<AttendanceRecord[]>("/api/attendance", {
            employeeId: currentUserId,
          }),
          apiClient.get<UserProfile[]>("/api/employees"),
        ])
        if (!cancelled) {
          setRecords(att)
          setProfile(users.find((u) => u.id === currentUserId) || null)
        }
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentUserId])

  const filteredRecords = useMemo(() => {
    let res = records
    if (filterType === "hari") {
      res = res.filter((a) => a.date === selectedDay)
    } else if (filterType === "bulan") {
      const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
      res = res.filter((a) => a.date.startsWith(prefix))
    } else if (filterType === "tahun") {
      res = res.filter((a) => a.date.startsWith(String(selectedYear)))
    } else if (filterType === "rentang" && rangeStart && rangeEnd) {
      res = res.filter((a) => a.date >= rangeStart && a.date <= rangeEnd)
    }
    return [...res].sort((a, b) => b.date.localeCompare(a.date))
  }, [records, filterType, selectedMonth, selectedYear, selectedDay, rangeStart, rangeEnd])

  const summary = useMemo(() => {
    const present = filteredRecords.filter(
      (a) => a.status === "present" || a.status === "late"
    )
    const onTime = filteredRecords.filter((a) => a.status === "present").length
    const late = filteredRecords.filter((a) => a.status === "late").length
    const totalMinutes = present.reduce((sum, a) => sum + (a.workingDuration || 0), 0)
    const totalSalary = present.reduce((sum, a) => {
      const rate = (profile?.salary || 0) / 22 / 8 / 60
      return sum + Math.round((a.workingDuration || 0) * rate)
    }, 0)
    return { totalDays: present.length, totalMinutes, totalSalary, onTime, late }
  }, [filteredRecords, profile])

  const filterLabel =
    filterType === "bulan"
      ? "BULANAN"
      : filterType === "hari"
        ? "HARIAN"
        : filterType === "tahun"
          ? "TAHUNAN"
          : "RENTANG"

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  if (loading) {
    return <AttendanceHistorySkeleton />
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Riwayat &amp; Gaji</h1>
        <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
          {filteredRecords.length} Log
        </span>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe Filter</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(["hari", "bulan", "tahun", "rentang"] as FilterType[]).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                filterType === ft
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {ft.charAt(0).toUpperCase() + ft.slice(1)}
            </button>
          ))}
        </div>

        {filterType === "bulan" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pilih Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {monthNames.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pilih Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {filterType === "hari" && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pilih Hari</label>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {filterType === "tahun" && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pilih Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}

        {filterType === "rentang" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dari</label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sampai</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-5 space-y-4 shadow-sm" style={{ backgroundColor: "#1e3a8a" }}>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-white">Ringkasan Periode Ini</p>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
            {filterLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/70 font-medium">Total Gaji Diperoleh</p>
            <p className="mt-1 text-xl font-bold text-white">
              Rp {summary.totalSalary.toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/70 font-medium">Total Waktu Kerja</p>
            <p className="mt-1 text-xl font-bold text-white">
              {Math.floor(summary.totalMinutes / 60)}jam {summary.totalMinutes % 60}m
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
          <div className="text-center">
            <p className="text-[11px] text-white/70">Hari Absen</p>
            <p className="text-xl font-bold text-white mt-0.5">{summary.totalDays}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-white/70">Tepat Waktu</p>
            <p className="text-xl font-bold text-green-300 mt-0.5">{summary.onTime}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-white/70">Terlambat</p>
            <p className="text-xl font-bold text-red-300 mt-0.5">{summary.late}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Rincian Log Kehadiran</h2>
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-200">
            Tidak ada riwayat absensi
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((rec) => (
              <div key={rec.id} className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full shrink-0 ${statusDotColor[rec.status]}`} />
                    <span className="text-sm font-semibold text-gray-900">
                      {format(new Date(rec.date), "EEEE, dd MMM yyyy", { locale: id })}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {statusLabel[rec.status]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Masuk</p>
                    <p className="text-sm font-bold text-gray-900">{formatTime(rec.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pulang</p>
                    <p className="text-sm font-bold text-gray-900">{formatTime(rec.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Durasi</p>
                    <p className="text-sm font-bold text-primary">{formatDurationShort(rec.workingDuration || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
