"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  CalendarOff,
  Check,
  X,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api"
import { AdminTableSkeleton } from "@/components/skeletons"
import EmptyState from "@/components/empty-state"
import { toast } from "sonner"

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string | null
  type: string
  startDate: string
  endDate: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

const ITEMS_PER_PAGE = 10

const leaveTypeColors: Record<string, string> = {
  "Cuti Tahunan": "bg-blue-100 text-blue-700",
  "Izin Sakit": "bg-red-100 text-red-700",
  "Izin Pribadi": "bg-purple-100 text-purple-700",
  "Cuti Melahirkan": "bg-pink-100 text-pink-700",
  "Cuti Menikah": "bg-emerald-100 text-emerald-700",
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-700">Disetujui</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>
    default:
      return <Badge className="bg-yellow-100 text-yellow-700">Menunggu</Badge>
  }
}

function getDays(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
}

export default function LeaveApprovalsPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [page, setPage] = useState(1)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectingLeave, setRejectingLeave] = useState<LeaveRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<LeaveRequest[]>("/api/leaves")
      setLeaves(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memuat data cuti")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<LeaveRequest[]>("/api/leaves")
        if (!cancelled) setLeaves(data)
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat data cuti")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredLeaves = useMemo(() => {
    let result = leaves
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.employeeName?.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter)
    }
    return result
  }, [leaves, search, statusFilter])

  const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE)
  const paginatedLeaves = filteredLeaves.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const pendingCount = leaves.filter((l) => l.status === "pending").length

  const handleApprove = async (leaveId: string) => {
    setProcessing(true)
    try {
      await apiClient.put("/api/leaves", {
        id: leaveId,
        status: "approved",
        approvedBy: "admin",
      })
      toast.success("Cuti disetujui")
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyetujui cuti")
    } finally {
      setProcessing(false)
    }
  }

  const openRejectDialog = (leave: LeaveRequest) => {
    setRejectingLeave(leave)
    setRejectReason("")
    setRejectDialog(true)
  }

  const handleReject = async () => {
    if (!rejectingLeave) return
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }
    setProcessing(true)
    try {
      await apiClient.put("/api/leaves", {
        id: rejectingLeave.id,
        status: "rejected",
        rejectionReason: rejectReason.trim(),
      })
      toast.success("Cuti ditolak")
      setRejectDialog(false)
      setRejectingLeave(null)
      fetchData()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menolak cuti")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <AdminTableSkeleton rows={5} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approval Cuti</h1>
        <p className="text-muted-foreground">
          Kelola pengajuan cuti karyawan
          {pendingCount > 0 && (
            <span className="ml-2 text-warning font-semibold">({pendingCount} menunggu)</span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, jenis cuti..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedLeaves.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="Tidak ada pengajuan cuti"
              description="Belum ada cuti yang perlu diapproval"
            />
          ) : (
            <div className="space-y-3">
              {paginatedLeaves.map((lr) => {
                const days = getDays(lr.startDate, lr.endDate)
                const typeColor = leaveTypeColors[lr.type] || "bg-muted text-muted-foreground"
                return (
                  <div
                    key={lr.id}
                    className="rounded-xl border border-border p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <CalendarOff className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold truncate">{lr.employeeName || "Tidak diketahui"}</p>
                          {getStatusBadge(lr.status)}
                        </div>
                        <Badge variant="outline" className={typeColor}>{lr.type}</Badge>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(lr.startDate), "dd MMM", { locale: id })}
                            {" — "}
                            {format(new Date(lr.endDate), "dd MMM yyyy", { locale: id })}
                          </span>
                          <span className="font-semibold">{days} hari</span>
                        </div>
                      </div>
                    </div>

                    {lr.reason && (
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Alasan:</p>
                        <p className="text-sm text-foreground">{lr.reason}</p>
                      </div>
                    )}

                    {lr.status === "rejected" && lr.rejectionReason && (
                      <div className="rounded-lg bg-red-50 px-3 py-2">
                        <p className="text-xs text-red-600 mb-0.5">Alasan Ditolak:</p>
                        <p className="text-sm text-red-700">{lr.rejectionReason}</p>
                      </div>
                    )}

                    {lr.status === "approved" && lr.approvedAt && (
                      <p className="text-xs text-muted-foreground">
                        Disetujui pada {format(new Date(lr.approvedAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </p>
                    )}

                    {lr.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApprove(lr.id)}
                          disabled={processing}
                        >
                          <Check className="size-4" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => openRejectDialog(lr)}
                          disabled={processing}
                        >
                          <X className="size-4" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
            <DialogDescription>
              {rejectingLeave?.employeeName} — {rejectingLeave?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Alasan Penolakan <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)} disabled={processing}>Batal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              Tolak Cuti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
