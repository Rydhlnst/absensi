"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { id } from "date-fns/locale/id"
import { Bell, LogOut, Clock, RotateCw, User as UserIcon, Settings } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AppSidebar from "@/components/layout/sidebar"
import MobileNav from "@/components/layout/mobile-nav"
import { Toaster } from "sonner"
import { authClient, signOut } from "@/lib/auth-client"
import { getAvatarUrl } from "@/lib/utils"
import type { Role, User } from "@/types"

interface SessionUserExtended {
  id: string
  name: string
  email: string
  image?: string | null
  phone?: string
  role?: Role
  department?: string
  position?: string
  nik?: string
  createdAt?: Date | string
}

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
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
    <div className="w-full shrink-0 bg-primary">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary-foreground/70" />
          <span className="text-sm font-medium text-primary-foreground">Simulasi Waktu:</span>
        </div>
        <button
          type="button"
          onClick={() => setSimActive(!simActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            simActive ? "bg-primary" : "bg-primary-foreground/30"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              simActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        {simActive ? (
          <span className="text-xs font-semibold text-warning">ON (Simulasi)</span>
        ) : (
          <span className="text-xs font-semibold text-success">OFF (Waktu Asli)</span>
        )}
      </div>
      <div className="flex items-center gap-2 px-4 pb-2">
        <Clock className="size-3 text-primary-foreground/60" />
        <p className="font-mono text-xs text-primary-foreground/80">
          Jam Sistem: {format(time, "EEEE, dd MMMM yyyy", { locale: id })} -{" "}
          {format(time, "HH:mm:ss")}
        </p>
      </div>
    </div>
  )
}

const employeePageTitles: Record<string, string> = {
  dashboard: "BERANDA",
  tasks: "TUGAS",
  "attendance-history": "RIWAYAT",
  rewards: "HADIAH",
  attendance: "ABSENSI",
  leave: "CUTI",
  profile: "PROFIL",
  "task-history": "RIWAYAT TUGAS",
}

const adminPageTitles: Record<string, string> = {
  dashboard: "DASHBOARD",
  attendance: "MONITORING ABSENSI",
  tasks: "KELOLA TUGAS",
  employees: "DATA TEKNISI",
  rewards: "HADIAH & KLAIM",
  reports: "LOG & LAPORAN",
  settings: "PENGATURAN SISTEM",
  admins: "MANAJEMEN ADMIN",
  roles: "KELOLA ROLES",
  logs: "LOG SISTEM",
}

function getPageTitle(pathname: string, role: Role): string {
  const parts = pathname.split("/").filter(Boolean)
  const lastSegment = parts[parts.length - 1] || "dashboard"
  if (role === "employee") {
    return employeePageTitles[lastSegment] || "BERANDA"
  }
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

  useEffect(() => {
    if (!mounted) {
      const id = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(id)
    }
  }, [mounted])

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (!mounted || isPending) return <LoadingScreen />
  if (!session) return null

  const sessionUser = session.user as SessionUserExtended

  const user: User = {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    phone: sessionUser.phone || "",
    role: (sessionUser.role || "employee") as Role,
    avatar: session.user.image || null,
    department: sessionUser.department || "",
    position: sessionUser.position || "",
    status: "active" as const,
    joinDate: session.user.createdAt instanceof Date
      ? session.user.createdAt.toISOString()
      : String(session.user.createdAt),
    salary: 0,
    address: "",
    nik: sessionUser.nik || "",
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

  const pageTitle = getPageTitle(pathname, role)
  const roleName = role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : user.position

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar role={role} user={user} />

        <div className="flex flex-col flex-1 min-h-screen w-0">
          {/* ─── HEADER ─────────────────────────────────────────────── */}
          <header className="sticky top-0 z-30 flex h-[62px] sm:h-[68px] items-center gap-3 border-b bg-card px-4 shrink-0 shadow-sm">
            {/* Mobile: employee greeting / desktop: sidebar trigger + page title */}
            <div className="flex items-center gap-3 min-w-0 md:flex-1">
              {/* SidebarTrigger — desktop only */}
              <SidebarTrigger className="hidden md:flex shrink-0 text-primary" />

              {/* Mobile: greeting with avatar */}
              <div className="flex items-center gap-3 min-w-0 flex-1 md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar size="lg">
                        <AvatarImage src={user.avatar || getAvatarUrl(user.name)} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-sm text-foreground leading-tight">
                          Halo, {user.name.split(" ")[0].toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                      <LogOut className="size-4" />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop: page title */}
              <span className="hidden md:block flex-1 font-bold text-primary tracking-wide text-base">
                {pageTitle}
              </span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile: refresh + clock */}
              <span className="flex md:hidden items-center gap-1 rounded-full bg-warning/30 px-3 py-1 text-xs font-semibold text-warning-foreground border border-warning/30">
                <Clock className="size-3" />
                <LiveClock />
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground md:hidden"
                onClick={() => window.location.reload()}
              >
                <RotateCw className="size-4" />
              </Button>

              {/* Desktop: bell + avatar dropdown */}
              <Button variant="ghost" size="icon" className="size-9 relative shrink-0 hidden md:flex">
                <Bell className="size-5 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 size-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground border-0">
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-9 px-2">
                    <Avatar size="sm">
                      <AvatarImage src={user.avatar || getAvatarUrl(user.name)} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">{user.name}</span>
                      <span className="text-xs text-muted-foreground leading-none mt-1">{roleName}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="size-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="size-4" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* ─── TIME SIMULATION (admin/super-admin only) ─────────── */}
          {role !== "employee" && <TimeSimulationBar />}

          {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
            <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>

        {/* ─── MOBILE BOTTOM NAV (hidden on md+) ────────────────── */}
        <div className="md:hidden">
          <MobileNav role={role} />
        </div>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}
