"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { MapPin, LogOut, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { employees, attendance } from "@/data/mock"
import { authClient } from "@/lib/auth-client"

function formatDurationHMS(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return <span>{format(time, "HH:mm")}</span>
}

export default function EmployeeDashboardPage() {
  const { data: session } = authClient.useSession()
  const [isAlreadyCheckedIn, setIsAlreadyCheckedIn] = useState(false)
  const [isAlreadyCheckedOut, setIsAlreadyCheckedOut] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [workingMinutes, setWorkingMinutes] = useState(0)

  const currentUserId = session?.user?.id || ""
  const employee = employees.find((e) => e.id === currentUserId) || employees[2]
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")
  const currentMonthLabel = format(now, "MMMM yyyy", { locale: id }).toUpperCase()

  const todayAttendance = useMemo(
    () => attendance.find((a) => a.employeeId === employee.id && a.date === todayStr),
    [todayStr, employee.id]
  )

  const monthRecords = useMemo(
    () =>
      attendance.filter(
        (a) =>
          a.employeeId === employee.id &&
          a.date.startsWith(format(now, "yyyy-MM"))
      ),
    [employee.id]
  )

  const monthPresent = monthRecords.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length
  const monthWorkingMinutes = monthRecords.reduce((sum, a) => sum + a.workingDuration, 0)
  const monthSalary = Math.round((monthPresent / Math.max(now.getDate(), 1)) * employee.salary)

  useEffect(() => {
    if (todayAttendance?.checkIn && !todayAttendance?.checkOut) {
      setIsAlreadyCheckedIn(true)
      setCheckInTime(new Date(todayAttendance.checkIn))
    }
    if (todayAttendance?.checkOut) {
      setIsAlreadyCheckedIn(true)
      setIsAlreadyCheckedOut(true)
      setWorkingMinutes(todayAttendance.workingDuration)
    }
  }, [todayAttendance])

  useEffect(() => {
    if (isAlreadyCheckedIn && !isAlreadyCheckedOut && checkInTime) {
      const calc = () => {
        const diff = Math.floor((Date.now() - checkInTime.getTime()) / 60000)
        setWorkingMinutes(diff)
      }
      calc()
      const interval = setInterval(calc, 60000)
      return () => clearInterval(interval)
    }
  }, [isAlreadyCheckedIn, isAlreadyCheckedOut, checkInTime])

  const handleCheckIn = () => {
    const t = new Date()
    setCheckInTime(t)
    setIsAlreadyCheckedIn(true)
    toast.success("Check in berhasil!")
  }

  const handleCheckOut = () => {
    setIsAlreadyCheckedOut(true)
    toast.success("Check out berhasil!")
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

  const dailySalary = Math.round(employee.salary / 22)

  return (
    <div className="space-y-4 p-4">
      {/* Sync banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-amber-800">
            Jam Sistem Admin: <LiveClock />
          </p>
          <p className="text-xs text-amber-600">
            {format(now, "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
        <button
          onClick={() => toast.success("Jam berhasil disinkronisasi!")}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 shrink-0"
        >
          <RefreshCw className="size-3" />
          SIMULASI SINKRON
        </button>
      </div>

      {/* Kehadiran Hari Ini */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">kehadiran hari ini</span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Durasi Kerja Hari Ini</p>
            <p className="text-xl font-bold text-primary font-mono">
              {formatDurationHMS(workingMinutes)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Gaji Hari Ini</p>
            <p className="text-lg font-bold text-gray-900">
              Rp {isAlreadyCheckedIn ? dailySalary.toLocaleString("id-ID") : "0"}
            </p>
          </div>
        </div>

        {!isAlreadyCheckedIn && (
          <button
            onClick={handleCheckIn}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            <MapPin className="size-4" />
            Check In
          </button>
        )}
        {isAlreadyCheckedIn && !isAlreadyCheckedOut && (
          <button
            onClick={handleCheckOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600"
          >
            <LogOut className="size-4" />
            Check Out
          </button>
        )}
        {isAlreadyCheckedOut && (
          <div className="w-full rounded-xl bg-gray-100 py-3 text-center text-sm font-medium text-gray-500">
            Anda sudah check out hari ini
          </div>
        )}
      </div>

      {/* Bulan ini */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">
          Bulan Ini ({currentMonthLabel})
        </p>
        <div className="space-y-2">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Kehadiran</p>
            <p className="text-2xl font-bold text-primary">{monthPresent} Hari</p>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Durasi Kerja</p>
            <p className="text-2xl font-bold text-primary">
              {Math.floor(monthWorkingMinutes / 60)} jam {monthWorkingMinutes % 60} menit
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Gaji</p>
            <p className="text-2xl font-bold text-primary">
              Rp {monthSalary.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
