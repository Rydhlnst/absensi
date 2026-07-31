"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import AppSidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import MobileNav from "@/components/layout/mobile-nav"
import { Toaster } from "sonner"
import { authClient } from "@/lib/auth-client"
import type { Role, User } from "@/types"

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (!mounted || isPending) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  const user: User = {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    phone: (session.user as any).phone || "",
    role: ((session.user as any).role || "employee") as Role,
    avatar: session.user.image || null,
    department: (session.user as any).department || "",
    position: (session.user as any).position || "",
    status: "active" as const,
    joinDate: session.user.createdAt instanceof Date ? session.user.createdAt.toISOString() : String(session.user.createdAt),
    salary: 0,
    address: "",
    nik: (session.user as any).nik || "",
    npwp: "",
    bankName: "",
    bankAccount: "",
    rewardPoints: 0,
  }

  const role = user.role as Role

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar role={role} user={user} />
        <div className="flex-1 flex flex-col w-full min-h-screen overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-auto p-3 pb-20 sm:p-4 sm:pb-4 md:p-6 md:pb-6">
            {children}
          </main>
        </div>
        <MobileNav role={role} />
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}
