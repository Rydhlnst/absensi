"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Clock,
  CheckCircle,
  Building2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import { AttendancePageSkeleton } from "@/components/skeletons"
import { toast } from "sonner"
import type { AttendanceStatus } from "@/types"

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  workingDuration: number
  isLate?: boolean
  lateMinutes?: number
  checkInLocation?: string | null
}

interface CompanySetting {
  id: string
  name?: string | null
  latitude?: number | null
  longitude?: number | null
  workingStart?: string
  workingEnd?: string
  lateTolerance?: number | null
  gpsRadius?: number | null
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}j ${mins}m`
}

export default function AttendancePage() {
  const { data: session } = authClient.useSession()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [settings, setSettings] = useState<CompanySetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [workingMinutes, setWorkingMinutes] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const currentUserId = session?.user?.id || ""
  const todayStr = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchData = useCallback(async () => {
    if (!currentUserId) return
    try {
      setLoading(true)
      const [att, set] = await Promise.all([
        apiClient.get<AttendanceRecord[]>("/api/attendance", { employeeId: currentUserId }),
        apiClient.get<CompanySetting>("/api/settings"),
      ])
      setRecords(att)
      setSettings(set)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memuat data"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [att, set] = await Promise.all([
          apiClient.get<AttendanceRecord[]>("/api/attendance", { employeeId: currentUserId }),
          apiClient.get<CompanySetting>("/api/settings"),
        ])
        if (!cancelled) {
          setRecords(att)
          setSettings(set)
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Gagal memuat data"
        if (!cancelled) toast.error(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [currentUserId])

  const todayRecord = records.find((r) => r.date === todayStr)

  const isCheckedIn = !!todayRecord?.checkIn
  const isCheckedOut = !!todayRecord?.checkOut
  const checkInTime = todayRecord?.checkIn ? new Date(todayRecord.checkIn) : null
  const checkInTimeMs = checkInTime?.getTime() ?? 0

  useEffect(() => {
    if (isCheckedIn && !isCheckedOut && checkInTimeMs) {
      const updateMinutes = () => {
        const diff = Math.floor((Date.now() - checkInTimeMs) / 60000)
        setWorkingMinutes(diff)
      }
      updateMinutes()
    }
  }, [isCheckedIn, isCheckedOut, checkInTimeMs, currentTime])

  const handleCheckIn = async () => {
    if (!currentUserId) return
    setSubmitting(true)
    try {
      await apiClient.post("/api/attendance", {
        employeeId: currentUserId,
        date: todayStr,
        checkIn: new Date().toISOString(),
        checkInLocation: settings?.latitude && settings?.longitude
          ? JSON.stringify({ latitude: settings.latitude, longitude: settings.longitude })
          : null,
        status: "present",
        isLate: false,
        lateMinutes: 0,
      })
      toast.success("Check in berhasil!")
      await fetchData()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal check in"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckOut = async () => {
    if (!todayRecord) return
    setSubmitting(true)
    try {
      await apiClient.put("/api/attendance", {
        id: todayRecord.id,
        checkOut: new Date().toISOString(),
      })
      toast.success("Check out berhasil!")
      await fetchData()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal check out"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !records.length) {
    return <AttendancePageSkeleton />
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
        <p className="text-muted-foreground">
          {format(currentTime, "EEEE, dd MMMM yyyy", { locale: id })}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex size-14 items-center justify-center rounded-full ${
                isCheckedIn
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCheckedIn ? <CheckCircle className="size-7" /> : <Clock className="size-7" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status Hari Ini</p>
              <p className="text-lg font-bold">
                {isCheckedOut
                  ? "Sudah Pulang"
                  : isCheckedIn
                    ? "Sedang Bekerja"
                    : "Belum Absen"}
              </p>
            </div>
          </div>

          {isCheckedIn && (
            <div className="rounded-2xl bg-blue-50 p-4 text-center">
              <p className="text-xs text-blue-700 uppercase tracking-wider font-bold">
                Durasi Kerja
              </p>
              <p className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
                {formatDuration(workingMinutes)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-muted-foreground">Jam Masuk</p>
              <p className="text-base font-bold text-gray-900">
                {checkInTime ? format(checkInTime, "HH:mm") : "--:--"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-muted-foreground">Jam Pulang</p>
              <p className="text-base font-bold text-gray-900">
                {todayRecord?.checkOut
                  ? format(new Date(todayRecord.checkOut), "HH:mm")
                  : "--:--"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!isCheckedIn && (
              <Button
                size="lg"
                className="w-full h-12"
                onClick={handleCheckIn}
                disabled={submitting}
              >
                <CheckCircle className="size-4" />
                {submitting ? "Memproses..." : "Check In Sekarang"}
              </Button>
            )}
            {isCheckedIn && !isCheckedOut && (
              <Button
                size="lg"
                variant="destructive"
                className="w-full h-12"
                onClick={handleCheckOut}
                disabled={submitting}
              >
                <Clock className="size-4" />
                {submitting ? "Memproses..." : "Check Out Sekarang"}
              </Button>
            )}
            {isCheckedOut && (
              <div className="rounded-xl bg-gray-100 py-3 text-center text-sm text-gray-500">
                Anda sudah check out hari ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {settings && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <p className="text-sm font-semibold">Pengaturan Kantor</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Jam Masuk</p>
                <p className="font-bold">{settings.workingStart || "08:00"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jam Pulang</p>
                <p className="font-bold">{settings.workingEnd || "17:00"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Toleransi</p>
                <p className="font-bold">{settings.lateTolerance || 15} menit</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Radius GPS</p>
                <p className="font-bold">{settings.gpsRadius || 100} meter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-3">Riwayat 7 Hari Terakhir</h3>
          <div className="space-y-2">
            {records.slice(0, 7).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {format(new Date(r.date), "EEE, dd MMM", { locale: id })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.checkIn
                      ? format(new Date(r.checkIn), "HH:mm")
                      : "--:--"}{" "}
                    - {r.checkOut ? format(new Date(r.checkOut), "HH:mm") : "--:--"}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      r.status === "present"
                        ? "bg-green-100 text-green-700"
                        : r.status === "late"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }
                  >
                    {r.status === "present" ? "Hadir" : r.status === "late" ? "Telat" : r.status}
                  </Badge>
                  <p className="text-xs mt-1 font-mono">{formatDuration(r.workingDuration || 0)}</p>
                </div>
              </div>
            ))}
            {records.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada riwayat
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
