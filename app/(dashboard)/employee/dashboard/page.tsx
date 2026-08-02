"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Lock, RefreshCw, Clock, MapPin, FileText, Home } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { DashboardSkeleton } from "@/components/skeletons"

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: "present" | "late" | "absent" | "leave" | "holiday"
  workingDuration: number
}

interface UserProfile {
  id: string
  name: string
  salary: number
  rewardPoints: number
  department?: string
  position?: string
}

function formatDurationHMS(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

function formatDurationLong(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h} jam ${m} menit`
}

export default function EmployeeDashboardPage() {
  const { data: session } = authClient.useSession()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [workingMinutes, setWorkingMinutes] = useState(0)

  const currentUserId = session?.user?.id || ""
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")
  const currentMonthLabel = `BULAN INI (${format(now, "MMMM yyyy", { locale: id }).toUpperCase()})`

  const loadData = useCallback(async () => {
    if (!currentUserId) return
    try {
      setLoading(true)
      const [att, prof] = await Promise.all([
        apiClient.get<AttendanceRecord[]>("/api/attendance", {
          employeeId: currentUserId,
        }),
        apiClient.get<UserProfile[]>("/api/employees").then((users) => {
          return users.find((u) => u.id === currentUserId) || null
        }),
      ])
      setAttendanceRecords(att)
      setProfile(prof)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memuat data"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const todayAttendance = useMemo(
    () => attendanceRecords.find((a) => a.employeeId === currentUserId && a.date === todayStr),
    [attendanceRecords, currentUserId, todayStr]
  )

  const monthRecords = useMemo(
    () => attendanceRecords.filter((a) => a.date.startsWith(format(now, "yyyy-MM"))),
    [attendanceRecords]
  )

  const monthPresent = monthRecords.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length
  const monthWorkingMinutes = monthRecords.reduce((sum, a) => sum + (a.workingDuration || 0), 0)
  const monthSalary = profile
    ? Math.round((monthPresent / Math.max(now.getDate(), 1)) * (profile.salary || 0))
    : 0

  const isAlreadyCheckedIn = !!todayAttendance?.checkIn
  const isAlreadyCheckedOut = !!todayAttendance?.checkOut
  const checkInTime = useMemo(
    () => (todayAttendance?.checkIn ? new Date(todayAttendance.checkIn) : null),
    [todayAttendance?.checkIn]
  )
  const toleranceExceeded = now.getHours() >= 9

  useEffect(() => {
    if (!isAlreadyCheckedIn || isAlreadyCheckedOut || !todayAttendance?.checkIn) return

    const start = new Date(todayAttendance.checkIn).getTime()
    const calc = () => {
      const diff = Math.floor((Date.now() - start) / 60000)
      setWorkingMinutes(diff)
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [isAlreadyCheckedIn, isAlreadyCheckedOut, todayAttendance?.checkIn])

  const handleCheckIn = async () => {
    if (!currentUserId) return
    try {
      await apiClient.post("/api/attendance", {
        employeeId: currentUserId,
        date: todayStr,
        checkIn: new Date().toISOString(),
        status: "present",
        isLate: false,
        lateMinutes: 0,
      })
      toast.success("Check in berhasil!")
      await loadData()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal check in"
      toast.error(message)
    }
  }

  const handleCheckOut = async () => {
    if (!currentUserId || !todayAttendance) return
    try {
      await apiClient.put("/api/attendance", {
        id: todayAttendance.id,
        checkOut: new Date().toISOString(),
      })
      toast.success("Check out berhasil!")
      await loadData()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal check out"
      toast.error(message)
    }
  }

  const attendanceStatus = isAlreadyCheckedOut
    ? "checked_out"
    : isAlreadyCheckedIn
      ? "checked_in"
      : "not_checked_in"

  const statusBadge = {
    not_checked_in: { label: "Belum Absen", className: "bg-red-500 text-white" },
    checked_in: { label: "Sudah Masuk", className: "bg-green-500 text-white" },
    checked_out: { label: "Sudah Pulang", className: "bg-blue-500 text-white" },
  }[attendanceStatus]

  const dailySalary = profile ? Math.round((profile.salary || 0) / 22) : 0
  const checkInDisplay = checkInTime ? format(checkInTime, "HH:mm") : "-"
  const checkOutDisplay =
    isAlreadyCheckedOut && todayAttendance?.checkOut
      ? format(new Date(todayAttendance.checkOut), "HH:mm")
      : "-"

  if (loading && !profile) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-end">
          <button
            onClick={() => void loadData()}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="size-3" />
            Refresh
          </button>
        </div>

        {/* Kehadiran Hari Ini Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900 capitalize">Kehadiran Hari Ini</span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Durasi Kerja Hari Ini</p>
              <p className="mt-1 font-mono text-xl font-extrabold text-blue-600">
                {formatDurationHMS(workingMinutes)}
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Gaji Hari Ini</p>
              <p className="mt-1 text-lg font-extrabold text-green-600">
                Rp {isAlreadyCheckedIn ? dailySalary.toLocaleString("id-ID") : "0"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-gray-50 p-2.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Jam Masuk</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{checkInDisplay}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2.5">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Jam Pulang</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{checkOutDisplay}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isAlreadyCheckedIn && !toleranceExceeded && (
          <button
            onClick={() => void handleCheckIn()}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
          >
            Check In Sekarang
          </button>
        )}
        {isAlreadyCheckedIn && !isAlreadyCheckedOut && (
          <button
            onClick={() => void handleCheckOut()}
            className="w-full rounded-2xl bg-red-500 py-3.5 text-sm font-bold text-white hover:bg-red-600 shadow-md transition-all active:scale-[0.98]"
          >
            Check Out Sekarang
          </button>
        )}
        {isAlreadyCheckedOut && (
          <div className="w-full rounded-2xl bg-green-50 border border-green-200 py-3.5 text-center text-sm font-medium text-green-700">
            Anda sudah check out hari ini
          </div>
        )}

        {/* Absen Ditutup */}
        {toleranceExceeded && !isAlreadyCheckedIn && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Lock className="size-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-amber-800">Absen Masuk Ditutup (Melewati Toleransi)</p>
          </div>
        )}

        {/* Bulan Ini */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">{currentMonthLabel}</p>

          <div className="rounded-2xl border border-gray-100 p-4 text-center bg-gradient-to-br from-green-50 to-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kehadiran</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{monthPresent} Hari</p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-4 text-center bg-gradient-to-br from-blue-50 to-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Durasi Kerja</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">{formatDurationLong(monthWorkingMinutes)}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 p-4 text-center bg-gradient-to-br from-green-50 to-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gaji</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">
              Rp {monthSalary.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
