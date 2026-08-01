"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Trophy,
  Gift,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Medal,
  ChevronRight,
  Package,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { employees, rewards, rewardItems } from "@/data/mock"
import { authClient } from "@/lib/auth-client"
import type { RewardType } from "@/types"

const rewardTypeConfig: Record<RewardType, { label: string; className: string }> = {
  earned: {
    label: "Diperoleh",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  redeemed: {
    label: "Ditukar",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  adjusted: {
    label: "Penyesuaian",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
}

const categoryColors: Record<string, string> = {
  pulsa: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  voucher: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  merchandise: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const categoryIcons: Record<string, string> = {
  pulsa: "bg-blue-500",
  voucher: "bg-purple-500",
  merchandise: "bg-amber-500",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function EmployeeRewardsPage() {
  const { data: session } = authClient.useSession()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const CURRENT_EMPLOYEE_ID = session?.user?.id || ""
  const employee = employees.find((e) => e.id === CURRENT_EMPLOYEE_ID)!

  const myRewards = useMemo(
    () =>
      rewards
        .filter((r) => r.employeeId === CURRENT_EMPLOYEE_ID)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    []
  )

  const earnedThisMonth = useMemo(() => {
    const now = new Date()
    const monthStr = format(now, "yyyy-MM")
    return myRewards
      .filter((r) => r.type === "earned" && format(new Date(r.createdAt), "yyyy-MM") === monthStr)
      .reduce((sum, r) => sum + r.points, 0)
  }, [myRewards])

  const redeemedThisMonth = useMemo(() => {
    const now = new Date()
    const monthStr = format(now, "yyyy-MM")
    return myRewards
      .filter((r) => r.type === "redeemed" && format(new Date(r.createdAt), "yyyy-MM") === monthStr)
      .reduce((sum, r) => sum + r.points, 0)
  }, [myRewards])

  const expiredPoints = useMemo(
    () => myRewards.filter((r) => r.type === "expired").reduce((sum, r) => sum + r.points, 0),
    [myRewards]
  )

  const leaderboard = useMemo(() => {
    return [...employees]
      .sort((a, b) => b.rewardPoints - a.rewardPoints)
      .slice(0, 10)
  }, [])

  const currentRank = useMemo(() => {
    const sorted = [...employees].sort((a, b) => b.rewardPoints - a.rewardPoints)
    return sorted.findIndex((e) => e.id === CURRENT_EMPLOYEE_ID) + 1
  }, [])

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return rewardItems.filter((i) => i.isActive)
    return rewardItems.filter((i) => i.isActive && i.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reward</h1>
        <p className="text-muted-foreground">Kumpulkan poin dan tukarkan dengan hadiah menarik</p>
      </div>

      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <CardContent className="relative z-10 flex items-center gap-5 py-2">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Trophy className="size-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-100">Total Poin Reward</p>
            <p className="text-4xl font-bold">{employee.rewardPoints} Poin</p>
            <p className="mt-1 text-sm text-blue-100">
              Selamat! Anda berada di peringkat {currentRank} dari {employees.length} karyawan
            </p>
          </div>
        </CardContent>
        <div className="absolute -right-8 -bottom-8 size-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/5" />
      </Card>

      <Tabs defaultValue="my-points">
        <TabsList>
          <TabsTrigger value="my-points">Poin Saya</TabsTrigger>
          <TabsTrigger value="history">Riwayat Poin</TabsTrigger>
          <TabsTrigger value="redeem">Tukar Hadiah</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="my-points" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <TrendingUp className="size-5" />
                </div>
                <p className="text-xs text-muted-foreground">Diperoleh Bulan Ini</p>
                <p className="text-xl font-bold text-emerald-600">+{earnedThisMonth}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <TrendingDown className="size-5" />
                </div>
                <p className="text-xs text-muted-foreground">Ditukar Bulan Ini</p>
                <p className="text-xl font-bold text-blue-600">-{redeemedThisMonth}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <Clock className="size-5" />
                </div>
                <p className="text-xs text-muted-foreground">Kedaluwarsa</p>
                <p className="text-xl font-bold text-red-600">{expiredPoints}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {myRewards.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Gift className="size-8" />
                  <p>Belum ada transaksi reward</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRewards.slice(0, 5).map((reward) => (
                    <div key={reward.id} className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                          reward.type === "earned"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {reward.type === "earned" ? (
                          <Star className="size-4" />
                        ) : (
                          <Gift className="size-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{reward.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reward.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          reward.type === "earned" ? "text-emerald-600" : "text-blue-600"
                        }`}
                      >
                        {reward.type === "earned" ? "+" : "-"}
                        {reward.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {myRewards.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                  <Clock className="size-8" />
                  <p>Belum ada riwayat poin</p>
                </div>
              ) : (
                <div className="divide-y">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground">
                    <span>Deskripsi</span>
                    <span>Tanggal</span>
                    <span className="text-right">Poin</span>
                  </div>
                  {myRewards.map((reward) => {
                    const config = rewardTypeConfig[reward.type]
                    return (
                      <div
                        key={reward.id}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{reward.description}</p>
                          <Badge className={`mt-1 ${config.className}`}>{config.label}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(reward.createdAt), "dd MMM yyyy", { locale: id })}
                        </span>
                        <span
                          className={`text-sm font-bold whitespace-nowrap ${
                            reward.type === "earned" ? "text-emerald-600" : "text-blue-600"
                          }`}
                        >
                          {reward.type === "earned" ? "+" : "-"}
                          {reward.points}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redeem" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={selectedCategory === "all" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("all")}
            >
              Semua
            </Badge>
            <Badge
              variant={selectedCategory === "pulsa" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("pulsa")}
            >
              Pulsa
            </Badge>
            <Badge
              variant={selectedCategory === "voucher" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("voucher")}
            >
              Voucher
            </Badge>
            <Badge
              variant={selectedCategory === "merchandise" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("merchandise")}
            >
              Merchandise
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const canRedeem = employee.rewardPoints >= item.pointsCost && item.stock > 0
              return (
                <Card key={item.id}>
                  <CardContent className="flex flex-col gap-3">
                    <div
                      className={`flex h-32 items-center justify-center rounded-xl ${categoryIcons[item.category] || "bg-gray-500"} text-white`}
                    >
                      {item.category === "pulsa" ? (
                        <TrendingUp className="size-10" />
                      ) : item.category === "voucher" ? (
                        <Gift className="size-10" />
                      ) : (
                        <Package className="size-10" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge className={categoryColors[item.category] || "bg-gray-100 text-gray-700"}>
                          {item.category}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="size-4 text-amber-500" />
                        <span className="font-bold">{item.pointsCost} poin</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Stok: {item.stock}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!canRedeem}
                      className="w-full"
                    >
                      {canRedeem ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Tukar
                        </>
                      ) : (
                        "Poin Tidak Cukup"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {leaderboard.map((emp, index) => {
                  const isCurrentUser = emp.id === CURRENT_EMPLOYEE_ID
                  const rank = index + 1
                  return (
                    <div
                      key={emp.id}
                      className={`flex items-center gap-4 px-6 py-4 ${
                        isCurrentUser
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : index < leaderboard.length - 1
                            ? "border-b"
                            : ""
                      }`}
                    >
                      <div className="w-8 text-center">
                        {rank <= 3 ? (
                          <div
                            className={`mx-auto flex size-8 items-center justify-center rounded-full ${
                              rank === 1
                                ? "bg-amber-400 text-white"
                                : rank === 2
                                  ? "bg-gray-300 text-gray-700"
                                  : "bg-amber-600 text-white"
                            }`}
                          >
                            {rank === 1 ? (
                              <Trophy className="size-4" />
                            ) : (
                              <Medal className="size-4" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{rank}</span>
                        )}
                      </div>
                      <Avatar>
                        <AvatarFallback>{getInitials(emp.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCurrentUser ? "text-blue-600 dark:text-blue-400" : ""}`}>
                          {emp.name}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="ml-2">
                              Anda
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.department} · {emp.position}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-amber-500" />
                        <span className="font-bold">{emp.rewardPoints}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
