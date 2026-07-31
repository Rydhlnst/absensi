"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  Trophy,
  UserCog,
  Users,
  Settings,
  FileText,
} from "lucide-react"

import type { Role } from "@/types"

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const employeeMenus: MenuItem[] = [
  { title: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { title: "Absensi", href: "/employee/attendance", icon: CalendarCheck },
  { title: "Tugas", href: "/employee/tasks", icon: ClipboardList },
  { title: "Reward", href: "/employee/rewards", icon: Trophy },
  { title: "Profil", href: "/employee/profile", icon: UserCog },
]

const adminMenus: MenuItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", href: "/admin/employees", icon: Users },
  { title: "Absensi", href: "/admin/attendance", icon: CalendarCheck },
  { title: "Tugas", href: "/admin/tasks", icon: ClipboardList },
  { title: "Lainnya", href: "/admin/settings", icon: Settings },
]

const superAdminMenus: MenuItem[] = [
  { title: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", href: "/super-admin/admins", icon: Users },
  { title: "Tugas", href: "/super-admin/tasks", icon: ClipboardList },
  { title: "Laporan", href: "/super-admin/logs", icon: FileText },
  { title: "Lainnya", href: "/super-admin/settings", icon: Settings },
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

interface MobileNavProps {
  role: Role
}

function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname()
  const menus = getMenusByRole(role)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 h-16 border-t bg-background/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
      <div className="flex h-full items-center justify-around rounded-t-xl pb-1">
        {menus.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] leading-tight">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav
