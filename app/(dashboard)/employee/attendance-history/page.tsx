"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { attendance, employees } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
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
  const [filterType, setFilterType] = useState<FilterType>("bulan")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(format(new Date(), "yyyy-MM-dd"))
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")

  const currentUserId = session?.user?.id || ""
  const employee = employees.find((e) => e.id === currentUserId) || employees[2]

  const filteredRecords = useMemo(() => {
    let records = attendance.filter((a) => a.employeeId === employee.id)

    if (filterType === "hari") {
      records = records.filter((a) => a.date === selectedDay)
    } else if (filterType === "bulan") {
      const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
      records = records.filter((a) => a.date.startsWith(prefix))
    } else if (filterType === "tahun") {
      records = records.filter((a) => a.date.startsWith(String(selectedYear)))
    } else if (filterType === "rentang" && rangeStart && rangeEnd) {
      records = records.filter((a) => a.date >= rangeStart && a.date <= rangeEnd)
    }

    return records.sort((a, b) => b.date.localeCompare(a.date))
  }, [filterType, selectedMonth, selectedYear, selectedDay, rangeStart, rangeEnd, employee.id])

  const summary = useMemo(() => {
    const present = filteredRecords.filter((a) => a.status === "present" || a.status === "late")
    const onTime = filteredRecords.filter((a) => a.status === "present").length
    const late = filteredRecords.filter((a) => a.status === "late").length
    const totalMinutes = present.reduce((sum, a) => sum + a.workingDuration, 0)
    const totalSalary = present.reduce((sum, a) => {
      const rate = employee.salary / 22 / 8 / 60
      return sum + Math.round(a.workingDuration * rate)
    }, 0)
    return {
      totalDays: present.length,
      totalMinutes,
      totalSalary,
      onTime,
      late,
    }
  }, [filteredRecords, employee.salary])

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

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Riwayat &amp; Gaji</h1>
        <span className="text-sm font-semibold text-gray-500">{filteredRecords.length} Log</span>
      </div>

      {/* Filter type tabs */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Tipe Filter</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(["hari", "bulan", "tahun", "rentang"] as FilterType[]).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {filterType === "tahun" && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pilih Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sampai</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary card */}
      <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "#1e3a8a" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Ringkasan Periode Ini</p>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
            {filterLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/60">Total Gaji Diperoleh</p>
            <p className="text-xl font-bold text-white">Rp {summary.totalSalary.toLocaleString("id-ID")}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Total Waktu Kerja</p>
            <p className="text-xl font-bold text-white">
              {Math.floor(summary.totalMinutes / 60)}jam {summary.totalMinutes % 60}m
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
          <div className="text-center">
            <p className="text-xs text-white/60">Hari Absen</p>
            <p className="text-lg font-bold text-white">{summary.totalDays}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60">Tepat Waktu</p>
            <p className="text-lg font-bold text-green-300">{summary.onTime}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60">Terlambat</p>
            <p className="text-lg font-bold text-orange-300">{summary.late}</p>
          </div>
        </div>
      </div>

      {/* Log detail */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Rincian Log Kehadiran</h2>
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
            Tidak ada riwayat absensi
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((rec) => (
              <div key={rec.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
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
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Masuk</p>
                    <p className="text-sm font-bold text-gray-900">{formatTime(rec.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Pulang</p>
                    <p className="text-sm font-bold text-gray-900">{formatTime(rec.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Durasi</p>
                    <p className="text-sm font-bold text-primary">{formatDurationShort(rec.workingDuration)}</p>
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
