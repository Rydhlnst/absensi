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
  SidebarProvider,
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

interface AppSidebarProps {
  role: Role
  user: User
}

interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

const employeeMenus: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Absensi", url: "/attendance", icon: CalendarCheck },
  { title: "Tugas", url: "/tasks", icon: ClipboardList },
  { title: "Riwayat Tugas", url: "/task-history", icon: History },
  { title: "Riwayat Absensi", url: "/attendance-history", icon: Clock },
  { title: "Reward", url: "/rewards", icon: Trophy },
  { title: "Profil", url: "/profile", icon: UserCog },
]

const adminMenus: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", url: "/employees", icon: Users },
  { title: "Absensi", url: "/attendance", icon: CalendarCheck },
  { title: "Tugas", url: "/tasks", icon: ClipboardList },
  { title: "Laporan", url: "/reports", icon: FileText },
  { title: "Pengaturan", url: "/settings", icon: Settings },
]

const superAdminMenus: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", url: "/employees", icon: Users },
  { title: "Admin", url: "/admins", icon: Shield },
  { title: "Roles", url: "/roles", icon: ShieldCheck },
  { title: "Absensi", url: "/attendance", icon: CalendarCheck },
  { title: "Tugas", url: "/tasks", icon: ClipboardList },
  { title: "Laporan", url: "/reports", icon: FileText },
  { title: "Pengaturan Perusahaan", url: "/company-settings", icon: Building2 },
  { title: "Log Sistem", url: "/system-logs", icon: ScrollText },
]

function getMenusByRole(role: Role): MenuItem[] {
  switch (role) {
    case "super_admin":
      return superAdminMenus
    case "admin":
      return adminMenus
    case "employee":
      return employeeMenus
    default:
      return employeeMenus
  }
}

function getRoleBadgeVariant(role: Role) {
  switch (role) {
    case "super_admin":
      return "destructive" as const
    case "admin":
      return "secondary" as const
    case "employee":
      return "outline" as const
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
    case "employee":
      return "Karyawan"
    default:
      return role
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
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              size="default"
            >
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

function SidebarHeaderContent({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Building2 className="size-4" />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold leading-tight">
            Absensi App
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Field Management
          </span>
        </div>
      )}
    </div>
  )
}

function SidebarFooterContent({
  user,
  collapsed,
}: {
  user: User
  collapsed: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <Avatar size={collapsed ? "default" : "lg"}>
        <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
        <AvatarFallback>
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex min-w-0 flex-col overflow-hidden">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <Badge variant={getRoleBadgeVariant(user.role)} className="mt-0.5 w-fit">
            {getRoleLabel(user.role)}
          </Badge>
        </div>
      )}
    </div>
  )
}

function AppSidebar({ role, user }: AppSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const menus = getMenusByRole(role)

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-1">
            <SidebarHeaderContent collapsed={collapsed} />
            <div className="ml-auto shrink-0">
              <SidebarTrigger />
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
          <SidebarFooterContent user={user} collapsed={collapsed} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}

export default AppSidebar
