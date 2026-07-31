"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ClipboardList,
  Trophy,
  Fingerprint,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

const demoAccounts = [
  { label: "Super Admin", email: "ahmad.pratama@mitrasolusindo.co.id", password: "password123" },
  { label: "Admin", email: "siti.nurhaliza@mitrasolusindo.co.id", password: "password123" },
  { label: "Employee", email: "budi.santoso@mitrasolusindo.co.id", password: "password123" },
]

function getRedirectPath(role: string): string {
  switch (role) {
    case "super_admin":
      return "/super-admin/dashboard"
    case "admin":
      return "/admin/dashboard"
    default:
      return "/employee/dashboard"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async (signInEmail: string, signInPassword: string) => {
    setLoading(true)
    setError("")

    const { data, error: signInError } = await authClient.signIn.email({
      email: signInEmail,
      password: signInPassword,
    })

    if (signInError) {
      setError(signInError.message || "Email atau password salah")
      setLoading(false)
      return
    }

    const session = await authClient.getSession()
    const role = (session.data?.user as any)?.role || "user"
    router.push(getRedirectPath(role))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSignIn(email, password)
  }

  const handleDemoLogin = (demo: (typeof demoAccounts)[number]) => {
    setEmail(demo.email)
    setPassword(demo.password)
    handleSignIn(demo.email, demo.password)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 max-w-md text-white space-y-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Fingerprint className="size-7" />
              </div>
              <span className="text-3xl font-bold tracking-tight">AbsenPro</span>
            </div>
            <p className="text-blue-100 text-lg">
              Sistem Manajemen Absensi & Tugas Lapangan
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Absensi GPS</h3>
                <p className="text-blue-100/80 text-sm">
                  Lacak kehadiran karyawan secara real-time dengan verifikasi lokasi GPS
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Manajemen Tugas</h3>
                <p className="text-blue-100/80 text-sm">
                  Distribusi dan pantau tugas lapangan karyawan dengan mudah dan efisien
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 mt-0.5">
                <Trophy className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Reward System</h3>
                <p className="text-blue-100/80 text-sm">
                  Berikan penghargaan otomatis berdasarkan pencapaian dan performa karyawan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Fingerprint className="size-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AbsenPro</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Masuk ke Akun Anda</h1>
            <p className="text-muted-foreground text-sm">
              Selamat datang! Silakan masukkan kredensial Anda.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Demo Quick Login
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((demo) => (
                <Button
                  key={demo.email}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(demo)}
                  disabled={loading}
                  className="text-xs"
                >
                  {demo.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
