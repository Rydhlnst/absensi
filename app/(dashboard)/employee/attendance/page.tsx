"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  MapPin,
  LogOut,
  Clock,
  Camera,
  AlertTriangle,
  CheckCircle,
  Building2,
  Timer,
  Calendar,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { companySetting } from "@/data/mock"

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}j ${mins}m`
}

export default function AttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [workingMinutes, setWorkingMinutes] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (isCheckedIn && checkInTime) {
        const diff = Math.floor(
          (Date.now() - checkInTime.getTime()) / 60000
        )
        setWorkingMinutes(diff)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isCheckedIn, checkInTime])

  const handleCheckIn = useCallback(() => {
    const now = new Date()
    setCheckInTime(now)
    setIsCheckedIn(true)
    setWorkingMinutes(0)
  }, [])

  const handleCheckOut = useCallback(() => {
    setIsCheckedIn(false)
    setCheckInTime(null)
    setWorkingMinutes(0)
  }, [])

  const mockLocation = {
    latitude: companySetting.latitude,
    longitude: companySetting.longitude,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
        <p className="text-muted-foreground">
          {format(currentTime, "EEEE, dd MMMM yyyy", { locale: id })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Absensi Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex size-14 items-center justify-center rounded-full ${
                isCheckedIn
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCheckedIn ? (
                <CheckCircle className="size-7" />
              ) : (
                <Clock className="size-7" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-xl font-bold">
                {isCheckedIn ? "Sudah Check In" : "Belum Check In"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                Jadwal
              </div>
              <p className="mt-1 text-lg font-semibold">
                {companySetting.workingHours.start} -{" "}
                {companySetting.workingHours.end}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                Lokasi
              </div>
              <p className="mt-1 text-lg font-semibold">
                {companySetting.name}
              </p>
            </div>
          </div>

          {isCheckedIn && checkInTime && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Clock className="size-4" />
                  Jam Check In
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {format(checkInTime, "HH:mm:ss")}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Timer className="size-4" />
                  Durasi Kerja
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {formatDuration(workingMinutes)}
                </p>
              </div>
            </div>
          )}

          {isCheckedIn ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      Apakah Anda yakin ingin check out?
                    </p>
                    <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                      Durasi kerja Anda saat ini:{" "}
                      {formatDuration(workingMinutes)}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                variant="destructive"
                className="h-14 text-base font-semibold"
                onClick={handleCheckOut}
              >
                <LogOut className="size-5" />
                Check Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  Koordinat GPS
                </div>
                <p className="mt-1 font-mono text-sm">
                  {mockLocation.latitude.toFixed(4)},{" "}
                  {mockLocation.longitude.toFixed(4)}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8">
                <Camera className="size-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Ambil selfie untuk verifikasi
                </p>
              </div>

              <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  Pastikan Anda berada di lokasi kerja sebelum melakukan check
                  in. GPS radius: {companySetting.gpsRadius}m
                </p>
              </div>

              <Button
                size="lg"
                className="h-14 text-base font-semibold"
                onClick={handleCheckIn}
              >
                <MapPin className="size-5" />
                Check In
              </Button>
            </div>
          )}

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Keterlambatan ditoleransi{" "}
              <span className="font-semibold text-foreground">
                {companySetting.lateTolerance} menit
              </span>{" "}
              setelah jam masuk
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Jadwal Kerja</span>
              <Badge variant="secondary">
                {companySetting.workingHours.start} -{" "}
                {companySetting.workingHours.end}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Toleransi Keterlambatan</span>
              <Badge variant="secondary">
                {companySetting.lateTolerance} menit
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lokasi Absensi</span>
              <Badge variant="secondary">Kantor Pusat</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Radius GPS</span>
              <Badge variant="secondary">{companySetting.gpsRadius}m</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
