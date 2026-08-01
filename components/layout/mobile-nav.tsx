"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, BarChart2, Gift } from "lucide-react"
import type { Role } from "@/types"

const employeeMenus = [
  { title: "Beranda", href: "/employee/dashboard", icon: Home },
  { title: "Tugas", href: "/employee/tasks", icon: ClipboardList },
  { title: "Riwayat", href: "/employee/attendance-history", icon: BarChart2 },
  { title: "Hadiah", href: "/employee/rewards", icon: Gift },
]

interface MobileNavProps {
  role: Role
}

function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname()

  // Admin uses sidebar drawer, no bottom nav
  if (role !== "employee") return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg"
      style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid h-full grid-cols-4">
        {employeeMenus.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <item.icon
                className={`h-6 w-6 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs leading-none transition-colors ${
                  isActive ? "font-semibold text-primary" : "text-gray-400"
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
