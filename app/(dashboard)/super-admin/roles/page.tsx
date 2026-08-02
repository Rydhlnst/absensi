"use client"

import {
  Shield,
  ShieldCheck,
  Users,
  Check,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const allPermissions = [
  "Kelola Karyawan",
  "Kelola Tugas",
  "Kelola Absensi",
  "Kelola Laporan",
  "Kelola Pengaturan",
  "Kelola Reward",
  "Kelola Admin",
  "System Logs",
]

const roles = [
  {
    name: "Super Admin",
    description: "Akses penuh ke seluruh fitur sistem",
    icon: ShieldCheck,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    permissions: allPermissions,
  },
  {
    name: "Admin",
    description: "Mengelola karyawan, tugas, dan laporan",
    icon: Shield,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    permissions: [
      "Kelola Karyawan",
      "Kelola Tugas",
      "Kelola Absensi",
      "Kelola Laporan",
      "Kelola Pengaturan",
      "Kelola Reward",
    ],
  },
  {
    name: "Employee",
    description: "Melihat tugas, melakukan absensi, dan melihat reward",
    icon: Users,
    color:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    permissions: ["Kelola Tugas", "Kelola Absensi", "Kelola Reward"],
  },
]

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Manajemen Role & Hak Akses
        </h1>
        <p className="text-muted-foreground">
          Kelola role dan hak akses untuk setiap pengguna sistem
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <div key={role.name}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${role.color}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Hak Akses
                    </p>
                    <div className="space-y-2">
                      {allPermissions.map((permission) => {
                        const hasPermission = role.permissions.includes(
                          permission
                        )
                        return (
                          <div
                            key={permission}
                            className="flex items-center gap-2"
                          >
                            {hasPermission ? (
                              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <Check className="size-3 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <X className="size-3 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                            <span
                              className={`text-sm ${
                                hasPermission
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {permission}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary">
                      {role.permissions.length} / {allPermissions.length} izin
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
