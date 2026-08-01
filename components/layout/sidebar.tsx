"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  History,
  Clock,
  Trophy,
  UserCog,
  Users,
  FileText,
  Settings,
  Shield,
  ShieldCheck,
  Building2,
  ScrollText,
} from "lucide-react"

import type { Role, User } from "@/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getAvatarUrl } from "@/lib/utils"

interface AppSidebarProps {
  role: Role
  user: User
}

interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

function getMenusByRole(role: Role): MenuItem[] {
  switch (role) {
    case "super_admin":
      return [
        { title: "Dashboard", url: "/super-admin/dashboard", icon: LayoutDashboard },
        { title: "Karyawan", url: "/super-admin/admins", icon: Users },
        { title: "Roles", url: "/super-admin/roles", icon: ShieldCheck },
        { title: "Absensi", url: "/super-admin/attendance", icon: CalendarCheck },
        { title: "Tugas", url: "/super-admin/tasks", icon: ClipboardList },
        { title: "Laporan", url: "/super-admin/reports", icon: FileText },
        { title: "Log Sistem", url: "/super-admin/logs", icon: ScrollText },
        { title: "Pengaturan", url: "/super-admin/settings", icon: Settings },
      ]
    case "admin":
      return [
        { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Karyawan", url: "/admin/employees", icon: Users },
        { title: "Absensi", url: "/admin/attendance", icon: CalendarCheck },
        { title: "Tugas", url: "/admin/tasks", icon: ClipboardList },
        { title: "Laporan", url: "/admin/reports", icon: FileText },
        { title: "Pengaturan", url: "/admin/settings", icon: Settings },
      ]
    case "employee":
      return [
        { title: "Dashboard", url: "/employee/dashboard", icon: LayoutDashboard },
        { title: "Absensi", url: "/employee/attendance", icon: CalendarCheck },
        { title: "Tugas", url: "/employee/tasks", icon: ClipboardList },
        { title: "Riwayat Tugas", url: "/employee/task-history", icon: History },
        { title: "Riwayat Absensi", url: "/employee/attendance-history", icon: Clock },
        { title: "Reward", url: "/employee/rewards", icon: Trophy },
        { title: "Profil", url: "/employee/profile", icon: UserCog },
      ]
    default:
      return [
        { title: "Dashboard", url: "/employee/dashboard", icon: LayoutDashboard },
      ]
  }
}

function getRoleBadgeVariant(role: Role) {
  switch (role) {
    case "super_admin":
      return "destructive" as const
    case "admin":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

function getRoleLabel(role: Role) {
  switch (role) {
    case "super_admin":
      return "Super Admin"
    case "admin":
      return "Admin"
    default:
      return "Karyawan"
  }
}

function SidebarMenuContent({ menus }: { menus: MenuItem[] }) {
  const pathname = usePathname()
  return (
    <SidebarMenu>
      {menus.map((item) => {
        const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} size="default">
              <Link href={item.url}>
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function AppSidebar({ role, user }: AppSidebarProps) {
  const menus = getMenusByRole(role)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold leading-tight">Absensi</span>
            <span className="truncate text-xs text-muted-foreground">Field Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuContent menus={menus} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar size="lg">
            <AvatarImage src={user.avatar || getAvatarUrl(user.name)} alt={user.name} />
            <AvatarFallback>
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <Badge variant={getRoleBadgeVariant(user.role)} className="mt-0.5 w-fit">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
