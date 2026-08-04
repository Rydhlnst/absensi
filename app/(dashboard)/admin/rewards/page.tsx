"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Plus, Search, TrendingUp, ListChecks, Gift, Trash2, Pencil, Loader2, Upload } from "lucide-react"
import EmptyState from "@/components/empty-state"
import { apiClient } from "@/lib/api"
import { uploadToR2 } from "@/lib/upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getAvatarUrl } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import type { RewardType } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

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
  image: string | null
  category: string | null
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

interface RewardForm {
  name: string
  description: string
  pointsCost: string
  stock: string
  category: string
  image: string | null
  isActive: boolean
}

const emptyForm: RewardForm = {
  name: "",
  description: "",
  pointsCost: "",
  stock: "",
  category: "",
  image: null,
  isActive: true,
}

export default function AdminRewardsPage() {
  const [claimSearch, setClaimSearch] = useState("")
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [rewards, setRewards] = useState<RewardEntry[]>([])
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RewardItem | null>(null)
  const [form, setForm] = useState<RewardForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

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
    return () => { cancelled = true }
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

  const openCreateForm = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEditForm = (item: RewardItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description || "",
      pointsCost: String(item.pointsCost),
      stock: String(item.stock),
      category: item.category || "",
      image: item.image || null,
      isActive: item.isActive,
    })
    setFormOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const url = await uploadToR2(file, "reward-items")
      setForm((prev) => ({ ...prev, image: url }))
      toast.success("Gambar berhasil diupload")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal upload gambar")
    } finally {
      setImageUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nama hadiah wajib diisi"); return }
    if (!form.pointsCost || Number(form.pointsCost) <= 0) { toast.error("Poin harus lebih dari 0"); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        pointsCost: Number(form.pointsCost),
        stock: Number(form.stock) || 0,
        category: form.category.trim() || null,
        image: form.image,
        isActive: form.isActive,
      }

      if (editingItem) {
        const updated = await apiClient.put<RewardItem>("/api/reward-items", {
          id: editingItem.id,
          ...payload,
        })
        setRewardItems((prev) => prev.map((i) => i.id === editingItem.id ? updated : i))
        toast.success("Hadiah berhasil diperbarui")
      } else {
        const created = await apiClient.post<RewardItem>("/api/reward-items", payload)
        setRewardItems((prev) => [created, ...prev])
        toast.success("Hadiah berhasil ditambahkan")
      }
      setFormOpen(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan hadiah")
    } finally {
      setSaving(false)
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
      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-primary" />
            <h2 className="text-sm font-extrabold text-primary uppercase tracking-wide">Riwayat Klaim &amp; Pencairan</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari Kode Klaim / Nama Karyawan..."
              value={claimSearch}
              onChange={(e) => setClaimSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="border-t border-border">
          <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-border/50 bg-muted/50">
            {["KARYAWAN", "HADIAH", "POIN", "NOMINAL"].map((h) => (
              <span key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {claimedRewards.length === 0 ? (
            <EmptyState icon={Gift} title="Tidak ada klaim hadiah" description="Belum ada klaim hadiah yang ditemukan" />
          ) : (
            <div className="divide-y divide-gray-50">
              {claimedRewards.map((r) => {
                const emp = employees.find((e) => e.id === r.employeeId)
                return (
                  <div key={r.id} className="grid grid-cols-4 gap-2 px-4 py-3 items-center">
                    <span className="text-xs font-semibold text-foreground truncate">{emp?.name || "-"}</span>
                    <span className="text-xs text-muted-foreground truncate">{r.description}</span>
                    <span className="text-xs font-bold text-red-500">-{r.points}</span>
                    <span className="text-xs font-bold text-foreground">Rp {(r.points * 1000).toLocaleString("id-ID")}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gift className="size-5 text-primary" />
            <h2 className="text-sm font-extrabold text-primary uppercase tracking-wide">Kelola Parameter Hadiah</h2>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 shrink-0"
          >
            <Plus className="size-4" />
            Tambah Hadiah
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ubah nominal uang tunai dan poin minimal untuk katalog hadiah karyawan di bawah ini.
        </p>

        {rewardItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada hadiah tersedia
          </div>
        ) : (
          <div className="space-y-2">
            {rewardItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/50 px-4 py-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Gift className="size-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.pointsCost} poin · Stok: {item.stock}</p>
                  {!item.isActive && (
                    <span className="text-[10px] font-bold text-red-500 uppercase">Nonaktif</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(item)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded"
                  >
                    <Pencil className="size-3.5" />
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

      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          <h2 className="text-sm font-extrabold text-primary uppercase tracking-wide">Riwayat Poin Per Karyawan</h2>
        </div>
        <select
          value={selectedEmpId}
          onChange={(e) => setSelectedEmpId(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  <p className="text-sm font-bold text-foreground">{selectedEmp.name}</p>
                  <p className="text-xs text-muted-foreground">Total Poin: <span className="font-bold text-primary">{selectedEmp.rewardPoints} Poin</span></p>
                </div>
              </div>
            )}

            {empRewardHistory.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Belum ada riwayat poin</div>
            ) : (
              <div className="space-y-2">
                {empRewardHistory.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.description}</p>
                      <p className="text-xs text-muted-foreground">
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Hadiah" : "Tambah Hadiah Baru"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Perbarui informasi hadiah" : "Isi data hadiah baru untuk katalog karyawan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Hadiah <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Contoh: Voucher Makan Siang"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi singkat hadiah..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-16"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Poin <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={form.pointsCost}
                  onChange={(e) => setForm({ ...form, pointsCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input
                placeholder="Contoh: Makanan, Elektronik"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gambar</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {form.image ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="Preview" className="h-20 rounded-xl object-cover" />
                  <button
                    onClick={() => setForm({ ...form, image: null })}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  {imageUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {imageUploading ? "Mengupload..." : "Pilih Gambar"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Hadiah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
