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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

function AndarLogo() {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 shadow-sm">
          <span className="text-white font-extrabold text-lg">M</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-extrabold text-red-600 tracking-tight">ANDAR.NET</span>
          <span className="text-[9px] text-gray-500 tracking-wider uppercase mt-0.5 font-semibold">
            PT. ANDAR KARYA GEMILANG
          </span>
        </div>
      </div>
    </div>
  )
}

function AppSidebar({ role }: AppSidebarProps) {
  const menus = getMenusByRole(role)

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-3 py-3 border-b border-gray-100">
        <AndarLogo />
      </SidebarHeader>
      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuContent menus={menus} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-gray-500 text-center font-medium">Operasional Sistem Stabil</p>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
