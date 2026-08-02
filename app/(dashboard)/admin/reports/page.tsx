"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Printer, Share2, Trash2, DollarSign, Clock, FileText } from "lucide-react"
import { apiClient } from "@/lib/api"
import { generatePDF, generateExcel, formatCurrency, formatDateTime } from "@/lib/export"
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

interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  workingDuration: number
  status: AttendanceStatus
}

interface Employee {
  id: string
  name: string
  salary: number
  role: string
}

type TimeFilter = "harian" | "bulanan" | "tahunan"

export default function AdminReportsPage() {
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("harian")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [att, emps] = await Promise.all([
        apiClient.get<Attendance[]>("/api/attendance"),
        apiClient.get<Employee[]>("/api/employees"),
      ])
      setAttendanceList(att)
      setEmployees(emps)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      void loadData()
    })
  }, [loadData])

  const filteredLogs = useMemo(() => {
    let result = attendanceList

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

    return [...result].sort((a, b) => b.date.localeCompare(a.date))
  }, [attendanceList, selectedEmployee, timeFilter, selectedDate, selectedMonth, selectedYear])

  const stats = useMemo(() => {
    const present = filteredLogs.filter((a) => a.status === "present" || a.status === "late")
    const totalMinutes = present.reduce((sum, a) => sum + (a.workingDuration || 0), 0)
    const totalSalary = present.reduce((sum, a) => {
      const emp = employees.find((e) => e.id === a.employeeId)
      if (!emp || emp.salary <= 0) return sum
      return sum + Math.round((a.workingDuration || 0) * (emp.salary / 22 / 8 / 60))
    }, 0)
    return { totalSalary, totalMinutes, totalLogs: filteredLogs.length }
  }, [filteredLogs, employees])

  const getFilterLabel = (): string => {
    if (timeFilter === "harian") return `Harian - ${format(new Date(selectedDate), "dd MMMM yyyy", { locale: id })}`
    if (timeFilter === "bulanan") return `Bulanan - ${monthNames[selectedMonth - 1]} ${selectedYear}`
    return `Tahunan - ${selectedYear}`
  }

  const handleExportPDF = () => {
    const rows = filteredLogs.map((log) => {
      const emp = employees.find((e) => e.id === log.employeeId)
      return {
        nama: emp?.name || "-",
        tanggal: format(new Date(log.date), "dd MMM yyyy", { locale: id }),
        masuk: log.checkIn ? format(new Date(log.checkIn), "HH:mm") : "-",
        pulang: log.checkOut ? format(new Date(log.checkOut), "HH:mm") : "-",
        durasi: log.workingDuration > 0 ? `${Math.floor(log.workingDuration / 60)}j ${log.workingDuration % 60}m` : "-",
        status: statusLabel[log.status] || log.status,
        gaji: formatCurrency(
          emp && emp.salary > 0
            ? Math.round((log.workingDuration || 0) * (emp.salary / 22 / 8 / 60))
            : 0
        ),
      }
    })

    generatePDF({
      title: "Laporan Absensi Karyawan",
      subtitle: `Filter: ${getFilterLabel()}`,
      companyName: "ANDAR.NET",
      companyAddress: "Jl. TB Simatupang No. 88, Lt. 5, Jakarta Selatan",
      companyPhone: "+622129529666",
      filename: `laporan-absensi-${format(new Date(), "yyyyMMdd-HHmmss")}`,
      summary: [
        { label: "Total Gaji", value: formatCurrency(stats.totalSalary) },
        { label: "Total Waktu", value: `${Math.floor(stats.totalMinutes / 60)}j ${stats.totalMinutes % 60}m` },
        { label: "Jumlah Log", value: `${stats.totalLogs} Data` },
      ],
      columns: [
        { header: "No", dataKey: "no", width: 10, align: "center" },
        { header: "Nama Karyawan", dataKey: "nama", width: 45 },
        { header: "Tanggal", dataKey: "tanggal", width: 28, align: "center" },
        { header: "Masuk", dataKey: "masuk", width: 16, align: "center" },
        { header: "Pulang", dataKey: "pulang", width: 16, align: "center" },
        { header: "Durasi", dataKey: "durasi", width: 18, align: "center" },
        { header: "Status", dataKey: "status", width: 22, align: "center" },
        { header: "Gaji", dataKey: "gaji", width: 28, align: "right" },
      ],
      rows: rows.map((r, i) => ({ ...r, no: i + 1 })),
    })

    toast.success("PDF berhasil diunduh!")
  }

  const handleExportExcel = () => {
    const rows = filteredLogs.map((log) => {
      const emp = employees.find((e) => e.id === log.employeeId)
      return {
        "No": filteredLogs.indexOf(log) + 1,
        "Nama Karyawan": emp?.name || "-",
        Tanggal: format(new Date(log.date), "dd MMM yyyy", { locale: id }),
        "Jam Masuk": log.checkIn ? format(new Date(log.checkIn), "HH:mm") : "-",
        "Jam Pulang": log.checkOut ? format(new Date(log.checkOut), "HH:mm") : "-",
        "Durasi (menit)": log.workingDuration || 0,
        Status: statusLabel[log.status] || log.status,
        Gaji: emp && emp.salary > 0
          ? Math.round((log.workingDuration || 0) * (emp.salary / 22 / 8 / 60))
          : 0,
      }
    })

    generateExcel({
      title: "Laporan Absensi Karyawan",
      subtitle: `Filter: ${getFilterLabel()}`,
      filename: `laporan-absensi-${format(new Date(), "yyyyMMdd-HHmmss")}`,
      summary: [
        { label: "Total Gaji", value: formatCurrency(stats.totalSalary) },
        { label: "Total Waktu", value: `${Math.floor(stats.totalMinutes / 60)}j ${stats.totalMinutes % 60}m` },
        { label: "Jumlah Log", value: `${stats.totalLogs} Data` },
      ],
      columns: [
        { header: "No", dataKey: "No", width: 5 },
        { header: "Nama Karyawan", dataKey: "Nama Karyawan", width: 25 },
        { header: "Tanggal", dataKey: "Tanggal", width: 15 },
        { header: "Jam Masuk", dataKey: "Jam Masuk", width: 12 },
        { header: "Jam Pulang", dataKey: "Jam Pulang", width: 12 },
        { header: "Durasi (menit)", dataKey: "Durasi (menit)", width: 15 },
        { header: "Status", dataKey: "Status", width: 15 },
        { header: "Gaji (Rp)", dataKey: "Gaji", width: 18 },
      ],
      rows,
    })

    toast.success("Excel berhasil diunduh!")
  }

  const handleDeleteAll = async () => {
    if (!confirm("Hapus semua log absensi? Tindakan ini tidak dapat dibatalkan.")) return
    try {
      for (const log of attendanceList) {
        await apiClient.delete(`/api/attendance?id=${log.id}`)
      }
      toast.success("Semua log berhasil dihapus")
      setAttendanceList([])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus log")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handleExportPDF}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Printer className="size-4" />
          Cetak PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          <Share2 className="size-4" />
          Ekspor Excel
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
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

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">Total Gaji</p>
            <p className="text-lg font-extrabold text-blue-700 mt-1">{formatCurrency(stats.totalSalary)}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Akumulasi upah terfilter</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 shrink-0"><DollarSign className="size-5 text-blue-600" /></div>
        </div>
        <div className="rounded-2xl bg-green-50 border border-green-100 p-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">Total Waktu</p>
            <p className="text-lg font-extrabold text-green-700 mt-1">
              {Math.floor(stats.totalMinutes / 60)}J {stats.totalMinutes % 60}M
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Jam kerja bersih</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 shrink-0"><Clock className="size-5 text-green-600" /></div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Jumlah Data</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.totalLogs} Log</p>
          <p className="text-xs text-gray-500 mt-0.5">Total catatan terfilter</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 shrink-0"><FileText className="size-5 text-blue-600" /></div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
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
                      {log.checkIn && ` · Masuk: ${formatDateTime(log.checkIn)}`}
                      {log.checkOut && ` · Pulang: ${formatDateTime(log.checkOut)}`}
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
