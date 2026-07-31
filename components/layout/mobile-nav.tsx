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
  { title: "Beranda", href: "/employee/dashboard", icon: LayoutDashboard },
  { title: "Absen", href: "/employee/attendance", icon: CalendarCheck },
  { title: "Tugas", href: "/employee/tasks", icon: ClipboardList },
  { title: "Reward", href: "/employee/rewards", icon: Trophy },
  { title: "Profil", href: "/employee/profile", icon: UserCog },
]

const adminMenus: MenuItem[] = [
  { title: "Beranda", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", href: "/admin/employees", icon: Users },
  { title: "Absen", href: "/admin/attendance", icon: CalendarCheck },
  { title: "Tugas", href: "/admin/tasks", icon: ClipboardList },
  { title: "Lainnya", href: "/admin/settings", icon: Settings },
]

const superAdminMenus: MenuItem[] = [
  { title: "Beranda", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", href: "/super-admin/admins", icon: Users },
  { title: "Tugas", href: "/super-admin/tasks", icon: ClipboardList },
  { title: "Laporan", href: "/super-admin/reports", icon: FileText },
  { title: "Lainnya", href: "/super-admin/settings", icon: Settings },
]

function getMenusByRole(role: Role): MenuItem[] {
  switch (role) {
    case "super_admin":
      return superAdminMenus
    case "admin":
      return adminMenus
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden"
      style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid h-full grid-cols-5">
        {menus.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <item.icon
                className={`h-6 w-6 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs leading-none transition-colors ${
                  isActive
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav
