"use client"

import { useState, useMemo } from "react"
import { Plus, Search } from "lucide-react"
import { employees, rewards, rewardItems } from "@/data/mock"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import type { RewardType } from "@/types"

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

const typeLabel: Record<RewardType, string> = {
  earned: "Diperoleh",
  redeemed: "Ditukar",
  expired: "Kedaluwarsa",
  adjusted: "Penyesuaian",
}

export default function AdminRewardsPage() {
  const [claimSearch, setClaimSearch] = useState("")
  const [selectedEmpId, setSelectedEmpId] = useState("")

  const claimedRewards = useMemo(() => {
    return rewards
      .filter((r) => r.type === "redeemed")
      .filter((r) => {
        if (!claimSearch) return true
        const emp = employees.find((e) => e.id === r.employeeId)
        return emp?.name.toLowerCase().includes(claimSearch.toLowerCase())
      })
  }, [claimSearch])

  const empRewardHistory = useMemo(() => {
    if (!selectedEmpId) return []
    return rewards
      .filter((r) => r.employeeId === selectedEmpId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [selectedEmpId])

  const selectedEmp = employees.find((e) => e.id === selectedEmpId)

  return (
    <div className="space-y-4">
      {/* Riwayat Klaim */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📋</span>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Riwayat Klaim &amp; Pencairan</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Kode Klaim / Nama Karyawan..."
              value={claimSearch}
              onChange={(e) => setClaimSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {claimedRewards.length === 0 ? (
          <div>
            <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
              {["KARYAWAN", "HADIAH", "POIN", "NOMINAL"].map((h) => (
                <span key={h} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            <div className="p-8 text-center text-sm text-gray-400">
              Tidak ada klaim hadiah yang ditemukan
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
              {["KARYAWAN", "HADIAH", "POIN", "NOMINAL"].map((h) => (
                <span key={h} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-gray-50">
              {claimedRewards.map((r) => {
                const emp = employees.find((e) => e.id === r.employeeId)
                return (
                  <div key={r.id} className="grid grid-cols-4 gap-2 px-4 py-3 items-center">
                    <span className="text-xs font-semibold text-gray-900 truncate">{emp?.name || "-"}</span>
                    <span className="text-xs text-gray-600 truncate">{r.description}</span>
                    <span className="text-xs font-bold text-red-500">-{r.points}</span>
                    <span className="text-xs font-bold text-gray-700">Rp {(r.points * 1000).toLocaleString("id-ID")}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Kelola Parameter Hadiah */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">🎯</span>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Kelola Parameter Hadiah</h2>
            </div>
          </div>
          <button
            onClick={() => toast.info("Form tambah hadiah akan tersedia")}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 shrink-0"
          >
            <Plus className="size-4" />
            Tambah Hadiah
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Ubah nominal uang tunai dan poin minimal untuk katalog hadiah karyawan di bawah ini.
        </p>

        {rewardItems.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Belum ada hadiah tersedia
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {rewardItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.pointsCost} poin</p>
                </div>
                <button className="text-xs font-medium text-primary hover:underline">Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Poin Per Karyawan */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📈</span>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Riwayat Poin Per Karyawan</h2>
        </div>
        <select
          value={selectedEmpId}
          onChange={(e) => setSelectedEmpId(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
        >
          <option value="">-- Pilih Karyawan --</option>
          {employees.filter((e) => e.role === "employee").map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {selectedEmpId && (
          <div>
            {selectedEmp && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Avatar size="default">
                  <AvatarImage src={selectedEmp.avatar || getAvatarUrl(selectedEmp.name)} alt={selectedEmp.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(selectedEmp.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-gray-900">{selectedEmp.name}</p>
                  <p className="text-xs text-gray-500">Total Poin: <span className="font-bold text-primary">{selectedEmp.rewardPoints} Poin</span></p>
                </div>
              </div>
            )}

            {empRewardHistory.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">Belum ada riwayat poin</div>
            ) : (
              <div className="space-y-2">
                {empRewardHistory.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.description}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(r.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                        {" · "}{typeLabel[r.type]}
                      </p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${
                      r.type === "earned" || r.type === "adjusted" ? "text-green-600" : "text-red-500"
                    }`}>
                      {r.type === "earned" ? "+" : "-"}{r.points}
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
