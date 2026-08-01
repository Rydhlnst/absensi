"use client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import { MapPin } from "lucide-react"
import { employees, tasks, attendance } from "@/data/mock"

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  return `Rp ${amount.toLocaleString("id-ID")}`
}

const statCards = [
  {
    key: "activeTasks",
    label: "Tugas Aktif",
    icon: "🗂️",
    bg: "bg-blue-50",
    valueColor: "text-gray-900",
  },
  {
    key: "working",
    label: "Sedang Bekerja",
    icon: "👷",
    bg: "bg-green-50",
    valueColor: "text-green-600",
  },
  {
    key: "notAbsent",
    label: "Belum Absen",
    icon: "🚫",
    bg: "bg-red-50",
    valueColor: "text-red-600",
  },
  {
    key: "totalSalary",
    label: "Total Gaji Berjalan",
    icon: "💸",
    bg: "bg-amber-50",
    valueColor: "text-green-600",
    isCurrency: true,
  },
]

export default function AdminDashboardPage() {
  const now = new Date()
  const todayStr = format(now, "yyyy-MM-dd")

  const activeEmployees = employees.filter((e) => e.status === "active")
  const todayAttendance = attendance.filter((a) => a.date === todayStr)
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present" || a.status === "late"
  )
  const notAbsentYet = activeEmployees.filter(
    (emp) => !todayAttendance.some((a) => a.employeeId === emp.id && (a.status === "present" || a.status === "late"))
  ).length

  const activeTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  ).length
  const working = presentToday.filter(
    (a) => a.checkIn && !a.checkOut
  ).length

  // Simplified daily running salary
  const totalSalary = presentToday.reduce((sum, a) => {
    const emp = employees.find((e) => e.id === a.employeeId)
    if (!emp) return sum
    if (a.workingDuration > 0 && emp.salary > 0) {
      return sum + Math.round((a.workingDuration / 60) * (emp.salary / 22 / 8))
    }
    return sum
  }, 0)

  const stats: Record<string, number | string> = {
    activeTasks,
    working,
    notAbsent: notAbsentYet,
    totalSalary,
  }

  const fieldEmployees = [
    { name: "Budi S.", color: "bg-blue-500", left: "15%", top: "25%" },
    { name: "Eko P.", color: "bg-green-500", left: "35%", top: "40%" },
    { name: "Gilang R.", color: "bg-orange-500", left: "55%", top: "20%" },
    { name: "Indra K.", color: "bg-purple-500", left: "70%", top: "50%" },
    { name: "Lukman H.", color: "bg-red-500", left: "25%", top: "65%" },
    { name: "Joko W.", color: "bg-yellow-500", left: "60%", top: "70%" },
    { name: "Putri A.", color: "bg-teal-500", left: "80%", top: "30%" },
  ]

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="space-y-3">
        {statCards.map((card) => {
          const rawValue = stats[card.key]
          const displayValue = card.isCurrency
            ? formatCurrency(rawValue as number)
            : String(rawValue)

          return (
            <div
              key={card.key}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
            >
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                <p className={`text-3xl font-bold ${card.valueColor}`}>{displayValue}</p>
              </div>
              <div className={`flex size-14 items-center justify-center rounded-2xl ${card.bg} text-2xl`}>
                {card.icon}
              </div>
            </div>
          )
        })}
      </div>

      {/* Map */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 p-4 pb-2">
          <div className="size-3 rounded-full bg-gray-300 animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">Pemantauan Lokasi Real-time</span>
        </div>
        <div
          className="relative w-full"
          style={{
            height: "280px",
            background: "linear-gradient(135deg, #e8f4f8 0%, #d4e9f0 30%, #c8e0ea 60%, #d6e8d0 100%)",
          }}
        >
          {/* Simple map background shapes */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            viewBox="0 0 400 280"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 200 Q50 180 100 190 Q150 200 200 185 Q250 170 300 180 Q350 190 400 175 L400 280 L0 280 Z" fill="#a8d8b0" />
            <path d="M50 100 Q80 90 120 95 Q160 100 200 90 Q240 80 280 88 Q320 96 360 85 Q380 80 400 82 L400 120 Q380 118 360 122 Q320 130 280 122 Q240 114 200 120 Q160 126 120 120 Q80 114 50 120 Z" fill="#c8e8d8" />
            <rect x="150" y="60" width="60" height="40" rx="4" fill="#b8ccd8" opacity="0.5" />
            <rect x="280" y="80" width="45" height="30" rx="4" fill="#b8ccd8" opacity="0.4" />
          </svg>

          {/* Location pins */}
          {fieldEmployees.map((emp, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: emp.left, top: emp.top, transform: "translate(-50%, -100%)" }}
            >
              <div className={`flex size-8 items-center justify-center rounded-full ${emp.color} shadow-md ring-2 ring-white`}>
                <MapPin className="size-4 text-white" />
              </div>
              <div className="mt-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm whitespace-nowrap">
                {emp.name}
              </div>
            </div>
          ))}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/70 to-transparent p-3">
            <p className="text-xs text-gray-500">
              {fieldEmployees.length} karyawan aktif di lapangan • Update: baru saja
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
