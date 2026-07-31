"use client"

import { useState } from "react"
import { Save, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { companySetting } from "@/data/mock"

export default function CompanySettingsPage() {
  const [formData, setFormData] = useState({
    name: companySetting.name,
    address: companySetting.address,
    phone: companySetting.phone,
    email: companySetting.email,
    logo: companySetting.logo,
    gpsRadius: companySetting.gpsRadius,
    workingHoursStart: companySetting.workingHours.start,
    workingHoursEnd: companySetting.workingHours.end,
    lateTolerance: companySetting.lateTolerance,
  })

  function handleSave() {
    alert("Pengaturan berhasil disimpan!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pengaturan Perusahaan
          </h1>
          <p className="text-muted-foreground">
            Konfigurasi informasi dan pengaturan sistem perusahaan
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="size-4" />
          Simpan Perubahan
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Informasi Perusahaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Perusahaan</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat</label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telepon</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo Perusahaan</label>
                <div className="flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-xl border border-dashed bg-muted/50">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Logo"
                        className="size-12 object-contain"
                      />
                    ) : (
                      <Upload className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="size-4" />
                    Unggah Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Radius GPS (meter)
                </label>
                <Input
                  type="number"
                  value={formData.gpsRadius}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gpsRadius: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Jarak maksimum dari lokasi kantor untuk absensi GPS
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Jam Mulai Kerja
                  </label>
                  <Input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHoursStart: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Jam Selesai Kerja
                  </label>
                  <Input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHoursEnd: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Toleransi Keterlambatan (menit)
                </label>
                <Input
                  type="number"
                  value={formData.lateTolerance}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lateTolerance: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Batas toleransi keterlambatan sebelum status berubah menjadi
                  terlambat
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
