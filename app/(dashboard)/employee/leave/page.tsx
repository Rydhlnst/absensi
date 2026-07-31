"use client"

import { useState } from "react"
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
import Link from "next/link"

const leaveHistory = [
  { id: 1, type: "Cuti Tahunan", start: "2026-08-10", end: "2026-08-12", reason: "Keluarga sedang sakit", status: "pending" },
  { id: 2, type: "Izin Sakit", start: "2026-07-15", end: "2026-07-15", reason: "Demam dan flu", status: "approved" },
  { id: 3, type: "Cuti Tahunan", start: "2026-06-20", end: "2026-06-21", reason: "Acara keluarga", status: "approved" },
  { id: 4, type: "Izin Pribadi", start: "2026-05-05", end: "2026-05-05", reason: "Urusan bank", status: "rejected" },
]

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
  const [showForm, setShowForm] = useState(false)
  const [leaveType, setLeaveType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Pengajuan cuti berhasil dikirim!")
    setShowForm(false)
    setLeaveType("")
    setStartDate("")
    setEndDate("")
    setReason("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employee/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengajuan Cuti</h1>
          <p className="text-muted-foreground">Ajukan cuti atau izin</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CalendarOff className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sisa Cuti</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <CalendarOff className="size-4 mr-2" />
          Ajukan Cuti Baru
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Form Pengajuan Cuti</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis Cuti</Label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih jenis cuti</option>
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alasan</Label>
                <Textarea
                  placeholder="Jelaskan alasan pengajuan cuti..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Send className="size-4 mr-2" />
                  Kirim Pengajuan
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveHistory.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{leave.type}</span>
                    {getStatusBadge(leave.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(leave.start), "dd MMM yyyy", { locale: id })} - {format(new Date(leave.end), "dd MMM yyyy", { locale: id })}
                  </p>
                  <p className="text-sm text-muted-foreground">{leave.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
