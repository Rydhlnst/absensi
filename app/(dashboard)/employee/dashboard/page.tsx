"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { RefreshCw, Home, ClipboardList, Clock, Gift } from "lucide-react"
import { toast } from "sonner"
import { employees, attendance } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

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
  return <span>{format(time, "HH:mm:ss")}</span>
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 11) return "pagi"
  if (hour >= 11 && hour < 15) return "siang"
  if (hour >= 15 && hour < 18) return "sore"
  return "malam"
}

const navItems = [
  { label: "Beranda", icon: Home, href: "/employee/dashboard" },
  { label: "Tugas", icon: ClipboardList, href: "/employee/tasks" },
  { label: "Riwayat", icon: Clock, href: "/employee/history" },
  { label: "Hadiah", icon: Gift, href: "/employee/rewards" },
]

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
    not_checked_in: { label: "BELUM ABSEN", className: "bg-red-500 text-white" },
    checked_in: { label: "SUDAH MASUK", className: "bg-green-500 text-white" },
    checked_out: { label: "SUDAH PULANG", className: "bg-blue-500 text-white" },
  }[attendanceStatus]

  const dailySalary = Math.round(employee.salary / 22)

  const checkInDisplay = checkInTime ? format(checkInTime, "HH:mm") : "-"
  const checkOutDisplay = isAlreadyCheckedOut
    ? format(new Date(checkInTime!.getTime() + workingMinutes * 60000), "HH:mm")
    : "-"

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              Selamat {getGreeting()}, {employee.name}!
            </p>
            <p className="text-xs text-gray-500">
              Jam Sistem Admin: <LiveClock />
            </p>
          </div>
          <button
            onClick={() => toast.success("Jam berhasil disinkronisasi!")}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
          >
            <RefreshCw className="size-3" />
            SIMULASI SINKRON
          </button>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Kehadiran Hari Ini</span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Jam Masuk</span>
              <span className="text-sm font-semibold text-gray-900">{checkInDisplay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Jam Pulang</span>
              <span className="text-sm font-semibold text-gray-900">{checkOutDisplay}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Hari Ini</span>
              <div className="text-right">
                <p className="text-sm font-bold text-primary font-mono">
                  {formatDurationHMS(workingMinutes)}
                </p>
                <p className="text-xs text-gray-400">
                  Rp {isAlreadyCheckedIn ? dailySalary.toLocaleString("id-ID") : "0"}
                </p>
              </div>
            </div>
          </div>

          {!isAlreadyCheckedIn && (
            <button
              onClick={handleCheckIn}
              className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Check In
            </button>
          )}
          {isAlreadyCheckedIn && !isAlreadyCheckedOut && (
            <button
              onClick={handleCheckOut}
              className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600"
            >
              Check Out
            </button>
          )}
          {isAlreadyCheckedOut && (
            <div className="w-full rounded-xl bg-gray-100 py-3 text-center text-sm font-medium text-gray-500">
              Anda sudah check out hari ini
            </div>
          )}
        </div>

        {/* Bulan Ini */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Hari Kerja</p>
            <p className="text-xl font-bold text-primary">{monthPresent}</p>
            <p className="text-[10px] text-gray-400">Hari</p>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Total Gaji</p>
            <p className="text-lg font-bold text-primary">Rp</p>
            <p className="text-xs font-bold text-primary">{monthSalary.toLocaleString("id-ID")}</p>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Total Waktu</p>
            <p className="text-xl font-bold text-primary">{Math.floor(monthWorkingMinutes / 60)}</p>
            <p className="text-[10px] text-gray-400">Jam</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/employee/dashboard"
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-0.5"
              >
                <item.icon className={`size-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
