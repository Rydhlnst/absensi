"use client"

import { useEffect, useState } from "react"
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
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import type { User as UserType } from "@/types"

interface HeaderProps {
  user: UserType
}

export default function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = format(currentTime, "EEEE, d MMMM yyyy", { locale: id })
  const formattedTime = format(currentTime, "HH:mm:ss")

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 transition-[width,height]">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari..."
          className="pl-9 h-9 bg-muted/50"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-medium">{formattedDate}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{mounted ? formattedTime : ""}</span>
        </div>

        <Separator orientation="vertical" className="hidden md:block mr-1 h-4" />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          {mounted && theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="size-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] rounded-full"
              >
                5
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              <Badge variant="secondary" className="text-[10px]">5 baru</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="max-h-80 overflow-y-auto">
              <DropdownMenuItem>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium">Tugas Baru Ditugaskan</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">Anda ditugaskan untuk pemasangan Router WiFi</span>
                  <span className="text-[10px] text-muted-foreground">2 jam lalu</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium">Tugas Urgent</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">Perbaikan AC central membutuhkan penanganan segera</span>
                  <span className="text-[10px] text-muted-foreground">3 jam lalu</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium">Poin Reward Bertambah</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">Anda mendapat 65 poin untuk pengecekan firewall</span>
                  <span className="text-[10px] text-muted-foreground">1 hari lalu</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium">Reminder Tugas</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">Tugas maintenance genset akan jatuh tempo besok</span>
                  <span className="text-[10px] text-muted-foreground">1 hari lalu</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-sm font-medium">Sistem Update</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">Sistem akan mengalami pemeliharaan pada 25 Juli 2026</span>
                  <span className="text-[10px] text-muted-foreground">2 hari lalu</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-primary">
              Lihat semua notifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar size="sm">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground leading-none mt-1">{user.position}</span>
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
