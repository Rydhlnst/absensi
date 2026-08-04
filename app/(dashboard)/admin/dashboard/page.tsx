"use client"

import { useState, useEffect } from "react"

import { MapPin, BookOpen, HardHat, UserX, Wallet, Layers } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  return `Rp ${amount.toLocaleString("id-ID")}`
}

interface Stats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  pendingTasks: number
  completedTasks: number
  totalTasks: number
  onlineEmployees: number
  monthlySalary: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<Stats>("/api/stats")
        if (!cancelled) setStats(data)
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : "Gagal memuat statistik"
        if (!cancelled) toast.error(errMsg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const statCards = stats ? [
    {
      key: "activeTasks",
      label: "Tugas Aktif",
      value: stats.pendingTasks,
      icon: BookOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-foreground",
    },
    {
      key: "working",
      label: "Sedang Bekerja",
      value: stats.onlineEmployees,
      icon: HardHat,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-foreground",
    },
    {
      key: "notAbsent",
      label: "Belum Absen",
      value: stats.absentToday,
      icon: UserX,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-600",
    },
    {
      key: "totalSalary",
      label: "Total Gaji Berjalan",
      value: stats.monthlySalary,
      icon: Wallet,
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      valueColor: "text-foreground",
      isCurrency: true,
    },
  ] : []

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border">
              <div>
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="size-14 rounded-2xl bg-muted animate-pulse" />
            </div>
          ))
        ) : (
          statCards.map((card) => {
            const displayValue = card.isCurrency
              ? formatCurrency(card.value as number)
              : String(card.value)

            return (
              <div
                key={card.key}
                className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border"
              >
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className={`text-3xl font-extrabold mt-1 ${card.valueColor}`}>{displayValue}</p>
                </div>
                <div className={`flex size-14 items-center justify-center rounded-2xl ${card.iconBg}`}>
                  <card.icon className={`size-7 ${card.iconColor}`} />
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Pemantauan Lokasi Real-time</span>
          </div>
          <button className="flex size-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted/50">
            <Layers className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div
          className="relative w-full"
          style={{
            height: "320px",
            background: "linear-gradient(135deg, #d4e9d0 0%, #c5dfb8 30%, #a9d0e8 60%, #b5d4eb 100%)",
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 320"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 80 Q50 60 100 75 Q150 90 200 70 Q250 50 300 65 Q350 80 400 70 L400 200 Q350 220 300 210 Q250 200 200 215 Q150 230 100 215 Q50 200 0 210 Z" fill="#c8e0a8" opacity="0.7" />
            <path d="M0 240 Q80 230 160 245 Q240 260 320 240 Q360 230 400 235 L400 320 L0 320 Z" fill="#a8c890" opacity="0.6" />
            <path d="M0 150 Q100 145 200 155 Q300 165 400 150" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.7" />
            <path d="M120 0 L130 100 L140 200 L150 320" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M280 0 L290 80 L285 160 L295 240 L290 320" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M0 280 Q100 270 200 280 Q300 290 400 280 L400 320 L0 320 Z" fill="#7faed4" opacity="0.6" />
            <ellipse cx="100" cy="220" rx="60" ry="40" fill="#a8c890" opacity="0.5" />
            <ellipse cx="320" cy="200" rx="80" ry="50" fill="#c8e0a8" opacity="0.5" />
            <text x="320" y="60" fontSize="10" fill="#5a8a4a" fontWeight="600" opacity="0.7">Bewota</text>
            <text x="60" y="180" fontSize="9" fill="#5a8a4a" fontWeight="600" opacity="0.6">Sibolga</text>
          </svg>

          <div className="absolute top-3 right-3 flex flex-col rounded-lg overflow-hidden shadow-md border border-border bg-card">
            <button className="size-8 flex items-center justify-center hover:bg-muted/50 text-foreground font-bold border-b border-border">+</button>
            <button className="size-8 flex items-center justify-center hover:bg-muted/50 text-foreground font-bold">−</button>
          </div>

          <div className="absolute" style={{ left: "30%", top: "55%" }}>
            <MapPin className="size-10 text-red-600 fill-red-600 drop-shadow-lg" />
          </div>

          <div className="absolute bottom-1 right-1 text-[9px] text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded">
            © OpenStreetMap
          </div>
        </div>
      </div>
    </div>
  )
}
