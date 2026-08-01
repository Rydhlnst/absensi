"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, Send, Fingerprint } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const handleResend = () => {
    setIsSubmitted(false)
    setEmail("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Fingerprint className="size-5 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Absensi</span>
        </div>

        <Card>
          <CardContent>
            {!isSubmitted ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    Kembali ke login
                  </Link>
                  <h1 className="text-xl font-bold tracking-tight mt-3">
                    Lupa Password
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Masukkan email Anda untuk mereset password
                  </p>
                </div>

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
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-10" disabled={!email}>
                    <Send className="size-4" />
                    Kirim Link Reset
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-primary hover:underline"
                  >
                    Kembali ke Halaman Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight">
                    Email Terkirim!
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Silakan cek email Anda untuk instruksi reset password
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={handleResend}
                  >
                    Kirim Ulang Email
                  </Button>
                  <Button asChild className="w-full h-10">
                    <Link href="/login">Kembali ke Login</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
