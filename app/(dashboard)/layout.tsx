"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { id } from "date-fns/locale/id"
import { Bell, LogOut, Clock, LogIn } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AppSidebar from "@/components/layout/sidebar"
import MobileNav from "@/components/layout/mobile-nav"
import { Toaster } from "sonner"
import { authClient, signOut } from "@/lib/auth-client"
import { getAvatarUrl } from "@/lib/utils"
import type { Role, User } from "@/types"

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <span>{format(time, "HH:mm")}</span>
}

function TimeSimulationBar() {
  const [simActive, setSimActive] = useState(false)
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="w-full shrink-0" style={{ backgroundColor: "#1e3a8a" }}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-white/70" />
          <span className="text-sm font-medium text-white">Simulasi Waktu:</span>
        </div>
        <button
          type="button"
          onClick={() => setSimActive(!simActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            simActive ? "bg-blue-400" : "bg-white/30"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              simActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        {simActive ? (
          <span className="text-xs font-semibold text-red-300">ON (Simulasi)</span>
        ) : (
          <span className="text-xs font-semibold text-green-300">OFF (Waktu Asli)</span>
        )}
      </div>
      <div className="px-4 pb-2 flex items-center gap-2">
        <Clock className="size-3 text-white/60" />
        <p className="text-xs text-white/80 font-mono">
          Jam Sistem: {format(time, "EEEE, dd MMMM yyyy", { locale: id })} -{" "}
          {format(time, "HH:mm:ss")}
        </p>
      </div>
    </div>
  )
}

const adminPageTitles: Record<string, string> = {
  dashboard: "DASHBOARD",
  tasks: "KELOLA TUGAS",
  employees: "DATA TEKNISI",
  rewards: "HADIAH & KLAIM",
  reports: "LOG & LAPORAN",
  settings: "PENGATURAN SISTEM",
  attendance: "ABSENSI",
  admins: "MANAJEMEN ADMIN",
  roles: "KELOLA ROLES",
  logs: "LOG SISTEM",
}

function getPageTitle(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean)
  const lastSegment = parts[parts.length - 1] || "dashboard"
  return adminPageTitles[lastSegment] || "DASHBOARD"
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (!mounted || isPending) return <LoadingScreen />
  if (!session) return null

  const user: User = {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    phone: (session.user as any).phone || "",
    role: ((session.user as any).role || "employee") as Role,
    avatar: session.user.image || null,
    department: (session.user as any).department || "",
    position: (session.user as any).position || "",
    status: "active" as const,
    joinDate: session.user.createdAt instanceof Date
      ? session.user.createdAt.toISOString()
      : String(session.user.createdAt),
    salary: 0,
    address: "",
    nik: (session.user as any).nik || "",
    npwp: "",
    bankName: "",
    bankAccount: "",
    rewardPoints: 0,
  }

  const role = user.role as Role
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const isEmployee = role === "employee"
  const pageTitle = getPageTitle(pathname)

  // ─── EMPLOYEE LAYOUT ───────────────────────────────────────────────────────
  if (isEmployee) {
    return (
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* Employee header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-white border-b px-4 shrink-0 shadow-sm">
            <Avatar size="lg">
              <AvatarImage src={user.avatar || getAvatarUrl(user.name)} alt={user.name} />
              <AvatarFallback className="bg-blue-100 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 leading-tight">
                Halo, {user.name.split(" ")[0].toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                <Clock className="size-3" />
                Jam Admin: <LiveClock />
              </span>
              <button
                onClick={handleSignOut}
                className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                <LogIn className="size-4 rotate-180" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20">
            {children}
          </main>

          <MobileNav role={role} />
        </div>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    )
  }

  // ─── ADMIN / SUPER ADMIN LAYOUT ────────────────────────────────────────────
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar role={role} user={user} />

        <div className="flex flex-col flex-1 min-h-screen w-0">
          {/* Admin header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white px-4 shrink-0 shadow-sm">
            <SidebarTrigger className="shrink-0 text-primary" />
            <span className="flex-1 font-bold text-primary tracking-wide text-base">
              {pageTitle}
            </span>
            <Button variant="ghost" size="icon" className="size-9 relative shrink-0">
              <Bell className="size-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 size-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-red-500 text-white border-0">
                3
              </Badge>
            </Button>
            <Avatar size="sm">
              <AvatarImage src={user.avatar || getAvatarUrl(user.name)} alt={user.name} />
              <AvatarFallback className="bg-primary text-white font-bold text-xs">{initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
            </Button>
          </header>

          <TimeSimulationBar />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4">
            {children}
          </main>
        </div>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}
