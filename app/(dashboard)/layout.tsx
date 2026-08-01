"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { id } from "date-fns/locale/id"
import { Search, Bell, Sun, Moon, LogOut, ChevronDown } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AppSidebar from "@/components/layout/sidebar"
import MobileNav from "@/components/layout/mobile-nav"
import { Toaster } from "sonner"
import { authClient, signOut } from "@/lib/auth-client"
import { getAvatarUrl } from "@/lib/utils"
import type { Role, User } from "@/types"

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
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

  return (
    <span className="text-sm text-muted-foreground hidden md:inline">
      {format(time, "EEEE, dd MMMM yyyy • HH:mm:ss", { locale: id })}
    </span>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { data: session, isPending } = authClient.useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (!mounted || isPending) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

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
    joinDate: session.user.createdAt instanceof Date ? session.user.createdAt.toISOString() : String(session.user.createdAt),
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

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar role={role} user={user} />

        <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-4">
            <SidebarTrigger />

            <div className="hidden md:flex flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari..."
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div className="flex-1" />

            <LiveClock />

            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="size-9 relative">
              <Bell className="size-4" />
              <Badge className="absolute -top-1 -right-1 size-4 p-0 text-[10px] flex items-center justify-center rounded-full">3</Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 h-9">
                  <Avatar size="sm">
                    <AvatarImage src={user.avatar || getAvatarUrl(user.name)} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-sm font-medium leading-none">{user.name}</span>
                    <span className="text-xs text-muted-foreground leading-none mt-0.5">{role.replace("_", " ")}</span>
                  </div>
                  <ChevronDown className="size-3 text-muted-foreground hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/${role === "super_admin" ? "super-admin" : role}/profile`)}>
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 overflow-x-hidden p-3 pb-20 sm:p-4 sm:pb-4 md:p-6 md:pb-6">
            {children}
          </main>
        </div>

        <MobileNav role={role} />
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}
