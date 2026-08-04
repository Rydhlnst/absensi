"use client"

import { useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { id } from "date-fns/locale/id"
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  CheckCheck,
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api"
import type { User as UserType } from "@/types"

interface Notification {
  id: string
  title: string
  message: string | null
  type: string | null
  isRead: boolean
  createdAt: string
  link: string | null
}

interface HeaderProps {
  user: UserType
}

export default function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifLoading, setNotifLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true)
      const data = await apiClient.get<Notification[]>("/api/notifications", {
        userId: user.id,
      })
      setNotifications(data)
    } catch {
      // silent
    } finally {
      setNotifLoading(false)
    }
  }, [user.id])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (notifId: string) => {
    try {
      await apiClient.put("/api/notifications", { id: notifId, isRead: true })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      )
    } catch {
      // silent
    }
  }

  const markAllRead = async () => {
    try {
      await apiClient.put("/api/notifications", {
        markAllRead: true,
        userId: user.id,
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      // silent
    }
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setMounted(true))
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    fetchNotifications()
    const notifTimer = setInterval(fetchNotifications, 30000)
    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(timer)
      clearInterval(notifTimer)
    }
  }, [fetchNotifications])

  const formattedDate = format(currentTime, "EEEE, d MMMM yyyy", { locale: id })
  const formattedTime = format(currentTime, "HH:mm:ss")

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 gap-2">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="h-4 shrink-0" />

      <div className="relative flex-1 min-w-0 max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Cari..."
          className="h-9 w-full rounded-md border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <div className="hidden lg:flex items-center gap-2 mr-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{formattedDate}</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-mono font-medium tabular-nums whitespace-nowrap">{mounted ? formattedTime : "--:--:--"}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu onOpenChange={(open) => { if (open) fetchNotifications() }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-9">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center text-[9px] rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">{unreadCount} baru</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="max-h-80 overflow-y-auto">
              {notifLoading && notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Memuat...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Belum ada notifikasi</div>
              ) : (
                notifications.slice(0, 20).map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-sm font-medium">{notif.title}</span>
                      {notif.message && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{notif.message}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(notif.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
            {unreadCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-xs text-primary cursor-pointer" onClick={markAllRead}>
                  <CheckCheck className="size-3.5 mr-1" />
                  Tandai semua sudah dibaca
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-9 px-2">
              <Avatar size="sm">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground leading-none mt-1">{user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : user.position}</span>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
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
              <User className="size-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
