"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, Search, TrendingUp, ListChecks, Gift, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import type { RewardType } from "@/types"

interface Employee {
  id: string
  name: string
  image: string | null
  rewardPoints: number
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

interface RewardItem {
  id: string
  name: string
  description: string | null
  pointsCost: number
  stock: number
  isActive: boolean
}

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
  const [employees, setEmployees] = useState<Employee[]>([])
  const [rewards, setRewards] = useState<RewardEntry[]>([])
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [emps, rwd, items] = await Promise.all([
          apiClient.get<Employee[]>("/api/employees"),
          apiClient.get<RewardEntry[]>("/api/rewards"),
          apiClient.get<RewardItem[]>("/api/reward-items"),
        ])
        if (!cancelled) {
          setEmployees(emps)
          setRewards(rwd)
          setRewardItems(items)
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
  }, [])

  const claimedRewards = useMemo(() => {
    return rewards
      .filter((r) => r.type === "redeemed")
      .filter((r) => {
        if (!claimSearch) return true
        const emp = employees.find((e) => e.id === r.employeeId)
        return emp?.name.toLowerCase().includes(claimSearch.toLowerCase())
      })
  }, [rewards, employees, claimSearch])

  const empRewardHistory = useMemo(() => {
    if (!selectedEmpId) return []
    return rewards
      .filter((r) => r.employeeId === selectedEmpId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [rewards, selectedEmpId])

  const selectedEmp = employees.find((e) => e.id === selectedEmpId)

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Hapus hadiah "${name}"?`)) return
    try {
      await apiClient.delete(`/api/reward-items?id=${id}`)
      toast.success("Hadiah berhasil dihapus")
      setRewardItems((prev) => prev.filter((i) => i.id !== id))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus hadiah")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-primary" />
            <h2 className="text-sm font-extrabold text-primary uppercase tracking-wide">Riwayat Klaim &amp; Pencairan</h2>
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

        <div className="border-t border-gray-200">
          <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
            {["KARYAWAN", "HADIAH", "POIN", "NOMINAL"].map((h) => (
              <span key={h} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {claimedRewards.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Tidak ada klaim hadiah yang ditemukan
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gift className="size-5 text-primary" />
            <h2 className="text-sm font-extrabold text-primary uppercase tracking-wide">Kelola Parameter Hadiah</h2>
          </div>
          <button
            onClick={() => toast.info("Form tambah hadiah akan tersedia")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 shrink-0"
          >
            <Plus className="size-4" />
            Tambah Hadiah
          </button>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Ubah nominal uang tunai dan poin minimal untuk katalog hadiah karyawan di bawah ini.
        </p>

        {rewardItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Belum ada hadiah tersedia
          </div>
        ) : (
          <div className="space-y-2">
            {rewardItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.pointsCost} poin · Stok: {item.stock}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toast.info(`Edit ${item.name}`)}
                    className="text-xs font-medium text-primary hover:underline px-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          <h2 className="text-sm font-extrabold text-primary uppercase tracking-wide">Riwayat Poin Per Karyawan</h2>
        </div>
        <select
          value={selectedEmpId}
          onChange={(e) => setSelectedEmpId(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">-- Pilih Karyawan --</option>
          {employees.filter((e) => e.role === "employee").map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {selectedEmpId && (
          <div>
            {selectedEmp && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Avatar size="default">
                  <AvatarImage src={selectedEmp.image || getAvatarUrl(selectedEmp.name)} alt={selectedEmp.name} />
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
