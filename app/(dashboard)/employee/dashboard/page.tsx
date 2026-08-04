"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Lock, Clock, Briefcase, Wallet, CalendarCheck, Snowflake } from "lucide-react"
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
  isFrozen: boolean | null
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
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [workingMinutes, setWorkingMinutes] = useState(0)
  const [, startTransition] = useTransition()

  const currentUserId = session?.user?.id || ""
  const [now] = useState(() => new Date())
  const todayStr = format(now, "yyyy-MM-dd")
  const currentMonthLabel = `BULAN INI (${format(now, "MMMM yyyy", { locale: id }).toUpperCase()})`

  const loadData = useCallback(async () => {
    if (sessionPending || !currentUserId) return
    try {
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
    }
  }, [currentUserId, sessionPending])

  useEffect(() => {
    if (sessionPending) return
    if (!currentUserId) { setLoading(false); return }
    startTransition(() => {
      setLoading(true)
      void loadData().finally(() => setLoading(false))
    })
  }, [loadData, startTransition, sessionPending, currentUserId])

  const todayAttendance = attendanceRecords.find(
    (a) => a.employeeId === currentUserId && a.date === todayStr
  )

  const monthRecords = attendanceRecords.filter((a) => a.date.startsWith(format(now, "yyyy-MM")))

  const monthPresent = monthRecords.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length
  const monthWorkingMinutes = monthRecords.reduce(
    (sum, a) => sum + (a.isFrozen ? 0 : (a.workingDuration || 0)), 0
  )
  const monthSalary = profile
    ? Math.round((monthPresent / Math.max(now.getDate(), 1)) * (profile.salary || 0))
    : 0

  const isAlreadyCheckedIn = !!todayAttendance?.checkIn
  const isAlreadyCheckedOut = !!todayAttendance?.checkOut
  const checkInTime = todayAttendance?.checkIn ? new Date(todayAttendance.checkIn) : null
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
    not_checked_in: { label: "Belum Absen", className: "bg-destructive text-destructive-foreground" },
    checked_in: { label: "Sudah Masuk", className: "bg-success text-success-foreground" },
    checked_out: { label: "Sudah Pulang", className: "bg-primary text-primary-foreground" },
  }[attendanceStatus]

  const dailySalary = (profile && !todayAttendance?.isFrozen) ? Math.round((profile.salary || 0) / 22) : 0
  const checkInDisplay = checkInTime ? format(checkInTime, "HH:mm") : "-"
  const checkOutDisplay =
    isAlreadyCheckedOut && todayAttendance?.checkOut
      ? format(new Date(todayAttendance.checkOut), "HH:mm")
      : "-"

  if (loading && !profile) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <div className="space-y-4">

        {/* Kehadiran Hari Ini */}
        <div className="rounded-2xl bg-card shadow-sm border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-foreground">Kehadiran Hari Ini</span>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Freeze Warning */}
          {todayAttendance?.isFrozen && (
            <div className="mb-4 rounded-xl bg-warning/10 border border-warning/20 px-3 py-2 flex items-center gap-2">
              <Snowflake className="size-4 text-warning shrink-0" />
              <p className="text-xs font-semibold text-warning">Gaji Dibekukan — Anda berada di kantor dengan tugas aktif</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-primary/10 p-3 text-center">
              <Clock className="size-4 mx-auto text-primary mb-1" />
              <p className="text-[10px] font-semibold uppercase text-primary">Durasi</p>
              <p className="font-mono text-sm font-bold text-primary mt-0.5">
                {formatDurationHMS(workingMinutes)}
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-center">
              <Wallet className="size-4 mx-auto text-primary mb-1" />
              <p className="text-[10px] font-semibold uppercase text-primary">Gaji</p>
              <p className="text-sm font-bold text-primary mt-0.5">
                {isAlreadyCheckedIn ? `Rp${dailySalary.toLocaleString("id-ID")}` : "Rp0"}
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-3 text-center">
              <Briefcase className="size-4 mx-auto text-primary mb-1" />
              <p className="text-[10px] font-semibold uppercase text-primary">Status</p>
              <p className="text-sm font-bold text-primary mt-0.5">
                {isAlreadyCheckedOut ? "Pulang" : isAlreadyCheckedIn ? "Masuk" : "-"}
              </p>
            </div>
          </div>

          {/* Jam Masuk / Pulang */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Jam Masuk</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{checkInDisplay}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Jam Pulang</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{checkOutDisplay}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isAlreadyCheckedIn && !toleranceExceeded && (
          <button
            onClick={() => void handleCheckIn()}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
          >
            Check In Sekarang
          </button>
        )}
        {isAlreadyCheckedIn && !isAlreadyCheckedOut && (
          <button
            onClick={() => void handleCheckOut()}
            className="w-full rounded-2xl bg-destructive py-3.5 text-sm font-bold text-destructive-foreground hover:bg-destructive/90 shadow-md transition-all active:scale-[0.98]"
          >
            Check Out Sekarang
          </button>
        )}
        {isAlreadyCheckedOut && (
          <div className="w-full rounded-2xl bg-success/10 border border-success/20 py-3.5 text-center text-sm font-medium text-success">
            Anda sudah check out hari ini
          </div>
        )}

        {/* Absen Ditutup */}
        {toleranceExceeded && !isAlreadyCheckedIn && (
          <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/20">
              <Lock className="size-4 text-warning" />
            </div>
            <p className="text-sm font-semibold text-warning">Absen Ditutup (Melewati Toleransi)</p>
          </div>
        )}

        {/* Bulan Ini */}
        <div className="rounded-2xl p-5 space-y-4 shadow-sm bg-primary">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-white">{currentMonthLabel}</p>
            <CalendarCheck className="size-4 text-white/70" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-white/70">Hadir</p>
              <p className="text-xl font-extrabold text-white mt-1">{monthPresent}</p>
              <p className="text-[10px] text-white/70">hari</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-white/70">Durasi</p>
              <p className="text-xl font-extrabold text-white mt-1">{formatDurationLong(monthWorkingMinutes)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-white/70">Gaji</p>
              <p className="text-xl font-extrabold text-white mt-1">
                Rp{monthSalary.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
