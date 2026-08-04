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
  BarChart2,
  Home,
  DollarSign,
  CalendarOff,
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
        { title: "Gaji", url: "/super-admin/salaries", icon: DollarSign },
        { title: "Laporan", url: "/super-admin/reports", icon: FileText },
        { title: "Log Sistem", url: "/super-admin/logs", icon: ScrollText },
        { title: "Pengaturan", url: "/super-admin/settings", icon: Settings },
      ]
    case "admin":
      return [
        { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Monitoring Absensi", url: "/admin/attendance", icon: CalendarCheck },
        { title: "Kelola Tugas", url: "/admin/tasks", icon: ClipboardList },
        { title: "Data Teknisi", url: "/admin/employees", icon: Users },
        { title: "Gaji", url: "/admin/salaries", icon: DollarSign },
        { title: "Hadiah & Klaim", url: "/admin/rewards", icon: Gift },
        { title: "Approval Cuti", url: "/admin/leave-approvals", icon: CalendarOff },
        { title: "Log & Laporan", url: "/admin/reports", icon: History },
        { title: "Pengaturan Sistem", url: "/admin/settings", icon: Settings },
      ]
    case "employee":
      return [
        { title: "Beranda", url: "/employee/dashboard", icon: Home },
        { title: "Tugas", url: "/employee/tasks", icon: ClipboardList },
        { title: "Absensi", url: "/employee/attendance", icon: CalendarCheck },
        { title: "Riwayat", url: "/employee/attendance-history", icon: BarChart2 },
        { title: "Cuti", url: "/employee/leave", icon: CalendarOff },
        { title: "Riwayat Tugas", url: "/employee/task-history", icon: History },
        { title: "Hadiah", url: "/employee/rewards", icon: Gift },
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
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
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
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand shadow-sm">
          <span className="text-brand-foreground font-extrabold text-lg">M</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-extrabold text-brand tracking-tight">ANDAR.NET</span>
          <span className="text-muted-foreground mt-0.5 text-[9px] font-semibold tracking-wider uppercase">
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
    <Sidebar collapsible="offcanvas" className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border px-3 py-3">
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
        <p className="text-muted-foreground text-center text-xs font-medium">Operasional Sistem Stabil</p>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
