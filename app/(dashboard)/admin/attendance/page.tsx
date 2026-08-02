"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { MapPin, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiClient } from "@/lib/api"
import { getAvatarUrl } from "@/lib/utils"
import { toast } from "sonner"
import type { AttendanceStatus } from "@/types"

interface Employee {
  id: string
  name: string
  image?: string | null
  position?: string
  salary?: number
}

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  workingDuration: number
  checkInLocation?: { address: string; latitude: number; longitude: number } | null
  checkOutLocation?: { address: string; latitude: number; longitude: number } | null
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "00:00:00"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

function formatTime(isoStr: string | null): string {
  if (!isoStr) return "--:--"
  return format(new Date(isoStr), "HH:mm")
}

function formatSalary(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID")
}

function getLiveEarning(rec: AttendanceRecord | undefined, salary: number): number {
  if (!rec || !rec.checkIn) return 0
  const start = new Date(rec.checkIn).getTime()
  const end = rec.checkOut ? new Date(rec.checkOut).getTime() : Date.now()
  const minutes = Math.max(0, (end - start) / 60000)
  const ratePerMinute = salary / 22 / 8 / 60
  return Math.round(minutes * ratePerMinute)
}

type StatusKey = "total" | "bekerja" | "pulang" | "belum"

const statusConfig = {
  belum: { label: "BELUM ABSEN", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
  bekerja: { label: "SEDANG BEKERJA", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  pulang: { label: "SUDAH PULANG", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
}

function getEmployeeStatus(rec: AttendanceRecord | undefined): "belum" | "bekerja" | "pulang" {
  if (!rec || !rec.checkIn) return "belum"
  if (rec.checkOut) return "pulang"
  return "bekerja"
}

export default function AdminAttendancePage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<StatusKey>("total")
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const [, startTransition] = useTransition()

  const load = useCallback(async () => {
    try {
      const [emps, att] = await Promise.all([
        apiClient.get<Employee[]>("/api/employees"),
        apiClient.get<AttendanceRecord[]>("/api/attendance"),
      ])
      setEmployees(emps)
      setAttendance(att)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data")
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      setLoading(true)
      void load().finally(() => setLoading(false))
    })
  }, [load, startTransition])

  const todayAtt = attendance.filter((a) => a.date === today)

  const getRecordForEmployee = (empId: string) =>
    todayAtt.find((a) => a.employeeId === empId)

  const stats = {
    total: employees.length,
    bekerja: employees.filter((e) => {
      const r = getRecordForEmployee(e.id)
      return getEmployeeStatus(r) === "bekerja"
    }).length,
    pulang: employees.filter((e) => {
      const r = getRecordForEmployee(e.id)
      return getEmployeeStatus(r) === "pulang"
    }).length,
    belum: employees.filter((e) => {
      const r = getRecordForEmployee(e.id)
      return getEmployeeStatus(r) === "belum"
    }).length,
  }

  const filteredEmployees = employees.filter((e) => {
    if (activeFilter === "total") return true
    const r = getRecordForEmployee(e.id)
    return getEmployeeStatus(r) === activeFilter
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
        </p>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["total", "bekerja", "pulang", "belum"] as StatusKey[]).map((key) => {
          const labels: Record<StatusKey, string> = {
            total: "Total",
            bekerja: "Bekerja",
            pulang: "Pulang",
            belum: "Belum Absen",
          }
          const colors: Record<StatusKey, string> = {
            total: "border-primary text-primary",
            bekerja: "border-green-500 text-green-600",
            pulang: "border-blue-500 text-blue-600",
            belum: "border-red-400 text-red-500",
          }
          const isActive = activeFilter === key
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`rounded-2xl border-2 bg-white p-3 text-center shadow-sm transition-all ${
                isActive ? colors[key] + " shadow-md" : "border-gray-200 text-gray-500"
              }`}
            >
              <p className={`text-2xl font-bold ${isActive ? "" : "text-gray-800"}`}>{stats[key]}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide leading-tight">{labels[key]}</p>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm border border-gray-200">
            Tidak ada data untuk filter ini
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const rec = getRecordForEmployee(emp.id)
            const empStatus = getEmployeeStatus(rec)
            const sc = statusConfig[empStatus]
            const salary = emp.salary || 0
            const earning = getLiveEarning(rec, salary)
            const location = rec?.checkInLocation

            return (
              <div key={emp.id} className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 p-4 pb-3">
                  <Avatar size="lg" className="!size-14 shrink-0">
                    <AvatarImage src={emp.image || getAvatarUrl(emp.name)} alt={emp.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {getInitials(emp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 uppercase text-sm leading-tight">{emp.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{emp.position || "Teknisi"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${sc.bg} ${sc.text}`}>
                    <span className={`inline-block size-1.5 rounded-full mr-1.5 ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                  <div className="p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Masuk</p>
                    <p className="mt-1 text-base font-bold text-gray-900">{formatTime(rec?.checkIn ?? null)}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pulang</p>
                    <p className="mt-1 text-base font-bold text-gray-900">{formatTime(rec?.checkOut ?? null)}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Durasi</p>
                    <p className="mt-1 text-base font-bold text-primary">{formatDuration(rec?.workingDuration ?? 0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gaji Berjalan</p>
                  <p className="text-sm font-bold text-gray-900">{formatSalary(earning)}</p>
                </div>

                {location && (
                  <div className="flex items-start gap-2 border-t border-gray-100 px-4 py-2.5">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline leading-snug"
                    >
                      {location.address}
                    </a>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      <span className="hidden">{now}</span>
    </div>
  )
}
