"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Lock, Home, ClipboardList, Clock, Gift } from "lucide-react"
import { toast } from "sonner"
import { employees, attendance } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

const navItems = [
  { label: "Beranda", icon: Home, href: "/employee/dashboard" },
  { label: "Tugas", icon: ClipboardList, href: "/employee/tasks" },
  { label: "Riwayat", icon: Clock, href: "/employee/attendance-history" },
  { label: "Hadiah", icon: Gift, href: "/employee/rewards" },
]

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

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 11) return "pagi"
  if (hour >= 11 && hour < 15) return "siang"
  if (hour >= 15 && hour < 18) return "sore"
  return "malam"
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
  const currentMonthLabel = `BULAN INI (${format(now, "MMMM yyyy", { locale: id }).toUpperCase()})`

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
  const checkInDisplay = checkInTime ? format(checkInTime, "HH:mm") : "-"
  const checkOutDisplay = isAlreadyCheckedOut
    ? format(new Date(checkInTime!.getTime() + workingMinutes * 60000), "HH:mm")
    : "-"

  const toleranceExceeded = now.getHours() >= 9

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-4 space-y-4">
        {/* Kehadiran Hari Ini */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900 capitalize">kehadiran hari ini</span>
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Durasi Kerja Hari Ini</p>
              <p className="mt-1 font-mono text-lg font-bold text-blue-600">
                {formatDurationHMS(workingMinutes)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Gaji Hari Ini</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                Rp {isAlreadyCheckedIn ? dailySalary.toLocaleString("id-ID") : "0"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Jam Masuk</span>
              <span className="font-semibold text-gray-900">{checkInDisplay}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Jam Pulang</span>
              <span className="font-semibold text-gray-900">{checkOutDisplay}</span>
            </div>
          </div>
        </div>

        {/* Bulan Ini */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">{currentMonthLabel}</p>

          <div className="rounded-2xl border border-gray-200 p-4 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kehadiran</p>
            <p className="text-2xl font-bold text-green-600">{monthPresent} Hari</p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Durasi Kerja</p>
            <p className="text-2xl font-bold text-blue-600">{formatDurationLong(monthWorkingMinutes)}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gaji</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {monthSalary.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Quick action button */}
        {!isAlreadyCheckedIn && !toleranceExceeded && (
          <button
            onClick={handleCheckIn}
            className="w-full rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 shadow-sm"
          >
            Check In Sekarang
          </button>
        )}
        {isAlreadyCheckedIn && !isAlreadyCheckedOut && (
          <button
            onClick={handleCheckOut}
            className="w-full rounded-2xl bg-red-500 py-3.5 text-sm font-bold text-white hover:bg-red-600 shadow-sm"
          >
            Check Out Sekarang
          </button>
        )}
        {isAlreadyCheckedOut && (
          <div className="w-full rounded-2xl bg-gray-100 py-3.5 text-center text-sm font-medium text-gray-500">
            Anda sudah check out hari ini
          </div>
        )}

        {/* Absen ditutup */}
        {toleranceExceeded && !isAlreadyCheckedIn && (
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
              <Lock className="size-4 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-blue-900">Absen Masuk Ditutup (Melewati Toleransi)</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 shadow-lg">
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
