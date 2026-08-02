"use client"

import { useState, useEffect } from "react"
import { Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

interface CompanySettings {
  id: string
  name: string | null
  address: string | null
  phone: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  lateTolerance: number | null
  gpsRadius: number | null
  workingStart: string | null
  workingEnd: string | null
}

export default function CompanySettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    gpsRadius: "100",
    workingStart: "08:00",
    workingEnd: "17:00",
    lateTolerance: "15",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await apiClient.get<CompanySettings>("/api/settings")
        if (!cancelled && data) {
          setFormData({
            name: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            gpsRadius: String(data.gpsRadius || 100),
            workingStart: (data.workingStart || "08:00").slice(0, 5),
            workingEnd: (data.workingEnd || "17:00").slice(0, 5),
            lateTolerance: String(data.lateTolerance || 15),
          })
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e : null
        if (!cancelled) toast.error(err?.message || "Gagal memuat pengaturan")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.put("/api/settings", {
        id: "default",
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        gpsRadius: parseInt(formData.gpsRadius) || 100,
        workingStart: formData.workingStart,
        workingEnd: formData.workingEnd,
        lateTolerance: parseInt(formData.lateTolerance) || 15,
      })
      toast.success("Pengaturan berhasil disimpan!")
    } catch (e: unknown) {
      const err = e instanceof Error ? e : null
      toast.error(err?.message || "Gagal menyimpan")
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Perusahaan</h1>
          <p className="text-muted-foreground">
            Konfigurasi informasi dan pengaturan sistem perusahaan
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan Perubahan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Informasi Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Perusahaan</Label>
              <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Pengaturan Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jam Masuk</Label>
                <Input type="time" value={formData.workingStart} onChange={(e) => setFormData((p) => ({ ...p, workingStart: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Jam Pulang</Label>
                <Input type="time" value={formData.workingEnd} onChange={(e) => setFormData((p) => ({ ...p, workingEnd: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Toleransi Keterlambatan (Menit)</Label>
              <Input type="number" value={formData.lateTolerance} onChange={(e) => setFormData((p) => ({ ...p, lateTolerance: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Radius GPS (Meter)</Label>
              <Input type="number" value={formData.gpsRadius} onChange={(e) => setFormData((p) => ({ ...p, gpsRadius: e.target.value }))} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
