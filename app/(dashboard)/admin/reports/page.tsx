"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Printer, Share2, Trash2 } from "lucide-react"
import { attendance, employees } from "@/data/mock"
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

const statusDot: Record<AttendanceStatus, string> = {
  present: "bg-green-500",
  late: "bg-yellow-500",
  absent: "bg-red-500",
  leave: "bg-blue-500",
  holiday: "bg-gray-400",
}

type TimeFilter = "harian" | "bulanan" | "tahunan"

export default function AdminReportsPage() {
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("harian")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [logs, setLogs] = useState(attendance)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const filteredLogs = useMemo(() => {
    let result = logs

    if (selectedEmployee !== "all") {
      result = result.filter((a) => a.employeeId === selectedEmployee)
    }

    if (timeFilter === "harian") {
      result = result.filter((a) => a.date === selectedDate)
    } else if (timeFilter === "bulanan") {
      const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
      result = result.filter((a) => a.date.startsWith(prefix))
    } else if (timeFilter === "tahunan") {
      result = result.filter((a) => a.date.startsWith(String(selectedYear)))
    }

    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [logs, selectedEmployee, timeFilter, selectedDate, selectedMonth, selectedYear])

  const stats = useMemo(() => {
    const present = filteredLogs.filter((a) => a.status === "present" || a.status === "late")
    const totalMinutes = present.reduce((sum, a) => sum + a.workingDuration, 0)
    const totalSalary = present.reduce((sum, a) => {
      const emp = employees.find((e) => e.id === a.employeeId)
      if (!emp || emp.salary <= 0) return sum
      return sum + Math.round(a.workingDuration * (emp.salary / 22 / 8 / 60))
    }, 0)
    return { totalSalary, totalMinutes, totalLogs: filteredLogs.length }
  }, [filteredLogs])

  const handleDeleteAll = () => {
    setLogs([])
    toast.success("Semua log berhasil dihapus")
  }

  return (
    <div className="space-y-4">
      {/* Top action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => toast.info("Mencetak PDF...")}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Printer className="size-4" />
          Cetak PDF
        </button>
        <button
          onClick={() => toast.info("Mengekspor Excel...")}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          <Share2 className="size-4" />
          Ekspor Excel
        </button>
      </div>

      {/* Filter card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pilih Karyawan</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Semua Karyawan</option>
            {employees
              .filter((e) => e.role === "employee")
              .map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Tipe Filter Waktu</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="harian">Harian (Satu Hari)</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
        </div>

        {timeFilter === "harian" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pilih Hari</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {timeFilter === "bulanan" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tahun</label>
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

        {timeFilter === "tahunan" && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
          <p className="text-[10px] uppercase tracking-widest text-green-600 font-semibold mb-1">Total Gaji</p>
          <p className="text-lg font-bold text-green-700">Rp {stats.totalSalary.toLocaleString("id-ID")}</p>
          <p className="text-xs text-green-500 mt-0.5">Akumulasi upah terfilter</p>
        </div>
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
          <p className="text-[10px] uppercase tracking-widest text-green-600 font-semibold mb-1">Total Waktu</p>
          <p className="text-lg font-bold text-green-700">
            {Math.floor(stats.totalMinutes / 60)}J {stats.totalMinutes % 60}M
          </p>
          <p className="text-xs text-green-500 mt-0.5">Jam kerja bersih</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Jumlah Data</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLogs} Log</p>
          <p className="text-xs text-gray-400">Total catatan terfilter</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">📄</div>
      </div>

      {/* Log list */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Log Aktivitas Absensi Detil</h2>
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 className="size-3.5" />
            Hapus Semua Log
          </button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Tidak ada log ditemukan</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.slice(0, 50).map((log) => {
              const emp = employees.find((e) => e.id === log.employeeId)
              return (
                <div key={log.id} className="p-4 flex items-center gap-3">
                  <span className={`size-2 rounded-full shrink-0 ${statusDot[log.status]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{emp?.name || "-"}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(log.date), "dd MMM yyyy", { locale: id })}
                      {log.checkIn && ` · Masuk: ${new Date(log.checkIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                      {log.checkOut && ` · Pulang: ${new Date(log.checkOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 shrink-0">{statusLabel[log.status]}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
