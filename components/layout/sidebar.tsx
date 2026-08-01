"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Gift,
  History,
  Settings,
  ShieldCheck,
  ScrollText,
  CalendarCheck,
  FileText,
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
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
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
        { title: "Kelola Tugas", url: "/admin/tasks", icon: ClipboardList },
        { title: "Data Teknisi", url: "/admin/employees", icon: Users },
        { title: "Hadiah & Klaim", url: "/admin/rewards", icon: Gift },
        { title: "Log & Laporan", url: "/admin/reports", icon: History },
        { title: "Pengaturan Sistem", url: "/admin/settings", icon: Settings },
      ]
    default:
      return []
  }
}

function SidebarMenuContent({ menus }: { menus: MenuItem[] }) {
  const pathname = usePathname()
  return (
    <SidebarMenu className="gap-1 px-2">
      {menus.map((item) => {
        const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
        return (
          <SidebarMenuItem key={item.url}>
            <Link
              href={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="size-5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function AppSidebar({ role, user }: AppSidebarProps) {
  const menus = getMenusByRole(role)

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-4 py-4">
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-primary tracking-tight">ABSENSI</span>
          <span className="text-xs text-gray-400 tracking-widest uppercase">Field Management</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuContent menus={menus} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-gray-400 text-center">Operasional Sistem Stabil</p>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
