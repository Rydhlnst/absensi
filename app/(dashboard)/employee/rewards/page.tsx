"use client"

import { useState, useMemo, useEffect } from "react"
import { Trophy } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { RewardType } from "@/types"

interface Employee {
  id: string
  name: string
  image?: string | null
  rewardPoints: number
  position?: string
  role: string
}

interface RewardEntry {
  id: string
  employeeId: string
  points: number
  type: RewardType
  description: string | null
  createdAt: string
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

const rewardTypeLabel: Record<RewardType, string> = {
  earned: "+",
  redeemed: "-",
  expired: "-",
  adjusted: "±",
}

const rewardTypeColor: Record<RewardType, string> = {
  earned: "text-green-600",
  redeemed: "text-red-500",
  expired: "text-gray-400",
  adjusted: "text-amber-600",
}

export default function EmployeeRewardsPage() {
  const { data: session } = authClient.useSession()
  const [activeTab, setActiveTab] = useState<"leaderboard" | "history">("leaderboard")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [myRewards, setMyRewards] = useState<RewardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const currentUserId = session?.user?.id || ""

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [emp, rewards] = await Promise.all([
          apiClient.get<Employee[]>("/api/employees", { role: "employee" }),
          currentUserId
            ? apiClient.get<RewardEntry[]>("/api/rewards", { employeeId: currentUserId })
            : Promise.resolve([] as RewardEntry[]),
        ])
        if (!cancelled) {
          setEmployees(emp)
          setMyRewards(rewards)
        }
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentUserId])

  const leaderboard = useMemo(() => {
    return [...employees]
      .filter((e) => e.role === "employee")
      .sort((a, b) => b.rewardPoints - a.rewardPoints)
  }, [employees])

  const currentEmployee = employees.find((e) => e.id === currentUserId)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-4 space-y-4">
        <div className="rounded-2xl p-5 flex items-center justify-between shadow-sm" style={{ backgroundColor: "#1e3a8a" }}>
          <div>
            <p className="text-sm text-white/80">Total Poin Anda</p>
            <p className="text-3xl font-bold text-white mt-1">
              {currentEmployee?.rewardPoints || 0} Poin
            </p>
          </div>
          <Trophy className="size-14 text-white/30" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
              activeTab === "leaderboard"
                ? "border-2 border-primary text-primary bg-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500"
            }`}
          >
            Papan Peringkat
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
              activeTab === "history"
                ? "border-2 border-primary text-primary bg-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500"
            }`}
          >
            Riwayat Poin
          </button>
        </div>

        {activeTab === "leaderboard" ? (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Papan Peringkat Teknisi</h2>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Belum ada data teknisi</div>
              ) : (
                leaderboard.map((emp, idx) => {
                  const rank = idx + 1
                  const isMe = emp.id === currentUserId
                  const isFirst = rank === 1

                  return (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-3 p-3.5 border-b border-gray-100 last:border-0 ${
                        isMe ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="w-10 text-center shrink-0 flex items-center justify-center">
                        {isFirst ? (
                          <Trophy className="size-6 text-yellow-500" />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">#{rank}</span>
                        )}
                      </div>
                      <Avatar size="default">
                        <AvatarImage src={emp.image || getAvatarUrl(emp.name)} alt={emp.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isMe ? "text-primary" : "text-gray-900"}`}>
                          {emp.name.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{emp.position || "Teknisi"}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${isMe ? "text-primary" : "text-gray-700"}`}>
                        {emp.rewardPoints} Poin
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Riwayat Poin Saya</h2>
            {myRewards.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-200">
                Belum ada riwayat poin
              </div>
            ) : (
              <div className="space-y-2">
                {myRewards.map((r) => (
                  <div key={r.id} className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.description || "Transaksi poin"}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(r.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </p>
                    </div>
                    <span className={`text-base font-bold shrink-0 ${rewardTypeColor[r.type]}`}>
                      {rewardTypeLabel[r.type]}{r.points} Poin
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
