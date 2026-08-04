"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarOff, ArrowLeft, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { LeavePageSkeleton } from "@/components/skeletons"
import { toast } from "sonner"
import Link from "next/link"

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName?: string
  type: string
  startDate: string
  endDate: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const leaveTypes = [
  "Cuti Tahunan",
  "Izin Sakit",
  "Izin Pribadi",
  "Cuti Melahirkan",
  "Cuti Menikah",
]

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

export default function LeavePage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [showForm, setShowForm] = useState(false)
  const [leaveType, setLeaveType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const currentUserId = session?.user?.id || ""

  useEffect(() => {
    if (sessionPending) return
    if (!currentUserId) { setLoading(false); return }
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<LeaveRequest[]>("/api/leaves", {
          employeeId: currentUserId,
        })
        if (!cancelled) setLeaves(data)
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
  }, [currentUserId, sessionPending])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      toast.error("Sesi tidak valid")
      return
    }
    if (!leaveType || !startDate || !endDate) {
      toast.error("Mohon lengkapi semua field")
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post("/api/leaves", {
        employeeId: currentUserId,
        type: leaveType,
        startDate,
        endDate,
        reason: reason || null,
      })
      toast.success("Pengajuan cuti berhasil dikirim!")
      setShowForm(false)
      setLeaveType("")
      setStartDate("")
      setEndDate("")
      setReason("")
      const data = await apiClient.get<LeaveRequest[]>("/api/leaves", {
        employeeId: currentUserId,
      })
      setLeaves(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim pengajuan")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LeavePageSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/employee/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarOff className="size-6" />
            Pengajuan Cuti / Izin
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajukan cuti atau izin ketidakhadiran
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Send className="size-4" />
            Buat Pengajuan
          </Button>
        )}
      </div>

      <Separator />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Form Pengajuan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Jenis Pengajuan</Label>
                <select
                  id="leaveType"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                >
                  <option value="">-- Pilih jenis --</option>
                  {leaveTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Dari</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Sampai</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Alasan</Label>
                <Textarea
                  id="reason"
                  placeholder="Jelaskan alasan pengajuan cuti/izin..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Belum ada pengajuan cuti
            </p>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-xl border border-border p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{leave.type}</p>
                      {getStatusBadge(leave.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(leave.startDate), "dd MMM yyyy", { locale: id })}
                      {" → "}
                      {format(new Date(leave.endDate), "dd MMM yyyy", { locale: id })}
                    </p>
                    {leave.reason && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">&quot;{leave.reason}&quot;</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Diajukan: {format(new Date(leave.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {leave.status === "approved" ? (
                      <CheckCircle className="size-5 text-green-600" />
                    ) : leave.status === "rejected" ? (
                      <XCircle className="size-5 text-red-600" />
                    ) : (
                      <Clock className="size-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
