"use client"

import { useState, useMemo } from "react"
import { employees, rewards } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import type { RewardType } from "@/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

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

  const currentUserId = session?.user?.id || ""
  const currentEmployee = employees.find((e) => e.id === currentUserId) || employees[2]

  const leaderboard = useMemo(() => {
    return [...employees]
      .filter((e) => e.role === "employee")
      .sort((a, b) => b.rewardPoints - a.rewardPoints)
  }, [])

  const myRewards = useMemo(() => {
    return rewards
      .filter((r) => r.employeeId === currentEmployee.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [currentEmployee.id])

  const myRank = leaderboard.findIndex((e) => e.id === currentEmployee.id) + 1

  return (
    <div className="p-4 space-y-4">
      {/* Blue banner */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: "#1e3a8a" }}>
        <div>
          <p className="text-sm text-white/70">Total Poin Anda</p>
          <p className="text-3xl font-bold text-white mt-1">{currentEmployee.rewardPoints} Poin</p>
        </div>
        <div className="text-4xl opacity-50">🏆</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
            activeTab === "leaderboard"
              ? "border-primary text-primary bg-primary/5"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Papan Peringkat
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
            activeTab === "history"
              ? "border-primary text-primary bg-primary/5"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Riwayat Poin
        </button>
      </div>

      {activeTab === "leaderboard" ? (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Papan Peringkat Teknisi</h2>
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            {leaderboard.map((emp, idx) => {
              const rank = idx + 1
              const isMe = emp.id === currentEmployee.id
              const isFirst = rank === 1

              return (
                <div
                  key={emp.id}
                  className={`flex items-center gap-3 p-4 border-b border-gray-50 last:border-0 ${
                    isMe ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-8 text-center shrink-0">
                    {isFirst ? (
                      <span className="text-xl">🏆</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">#{rank}</span>
                    )}
                  </div>
                  <Avatar size="default">
                    <AvatarImage src={emp.avatar || getAvatarUrl(emp.name)} alt={emp.name} />
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
            })}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Riwayat Poin Saya</h2>
          {myRewards.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-400 text-sm shadow-sm border border-gray-100">
              Belum ada riwayat poin
            </div>
          ) : (
            <div className="space-y-2">
              {myRewards.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.description}</p>
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
  )
}
