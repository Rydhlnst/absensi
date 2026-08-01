"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
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
import { authClient } from "@/lib/auth-client"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }

    setLoading(true)

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message || "Gagal mendaftar. Silakan coba lagi.")
      setLoading(false)
      return
    }

    const session = await authClient.getSession()
    const role = (session.data?.user as any)?.role || "employee"
    if (role === "super_admin") {
      router.push("/super-admin/dashboard")
    } else if (role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/employee/dashboard")
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Daftar Akun Baru</h1>
            <p className="text-muted-foreground text-sm">
              Buat akun untuk mulai menggunakan sistem.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="phone">No. Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+6281234567890"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
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
                "Daftar"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
