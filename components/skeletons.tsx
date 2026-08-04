"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-4">
        {/* Refresh button skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* Attendance card skeleton */}
        <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted p-3">
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="rounded-xl bg-muted p-3">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          <div className="border-t border-border/50 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>

        {/* Month summary skeleton */}
        <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
      {/* Header skeleton */}
      <div className="px-4 py-3 flex items-center justify-center gap-3 bg-background border-b border-border">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Creator skeleton */}
      <div className="px-4 py-1.5 text-center border-b border-border/50">
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>

      {/* Body skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-6 w-24 rounded-lg shrink-0" />
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="size-4 rounded shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="size-4 rounded shrink-0" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function AttendanceHistorySkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>

      {/* Filter skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>

      {/* Summary skeleton */}
      <div className="rounded-2xl bg-primary p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 bg-white/20" />
          <Skeleton className="h-5 w-20 rounded-full bg-white/20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-3 w-24 bg-white/20 mb-2" />
            <Skeleton className="h-7 w-28 bg-white/30" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 bg-white/20 mb-2" />
            <Skeleton className="h-7 w-20 bg-white/30" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-3 w-16 mx-auto bg-white/20 mb-1" />
              <Skeleton className="h-6 w-8 mx-auto bg-white/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Log list skeleton */}
      <div>
        <Skeleton className="h-4 w-36 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card shadow-sm border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-2 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="text-center">
                    <Skeleton className="h-3 w-10 mx-auto mb-1" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RewardsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-4">
        {/* Poin banner skeleton */}
        <div className="rounded-2xl bg-primary p-5 flex items-center justify-between shadow-sm">
          <div>
            <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
            <Skeleton className="h-8 w-32 bg-white/30" />
          </div>
          <Skeleton className="size-14 rounded-xl bg-white/10" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-xl" />
        </div>

        {/* Leaderboard skeleton */}
        <div>
          <Skeleton className="h-5 w-40 mb-3" />
          <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 border-b border-border/50 last:border-0">
                <Skeleton className="w-10 h-6" />
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AttendancePageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Status card skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>

        <Skeleton className="h-24 w-full rounded-2xl" />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background p-3">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="rounded-xl bg-background p-3">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* History skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4">
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-background p-3 flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-14 mb-1 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Profile card skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Form skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <Skeleton className="h-5 w-32 mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeaveSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Form skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* History skeleton */}
      <div className="rounded-2xl bg-card shadow-sm border border-border p-4">
        <Skeleton className="h-5 w-36 mb-3" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="size-14 rounded-2xl" />
        </div>
      ))}

      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="p-4 pb-2 flex items-center gap-2">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="w-full h-72" />
      </div>
    </div>
  )
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl bg-card shadow-sm border border-border p-4">
      <Skeleton className="h-5 w-36 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeavePageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-8 w-56 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="rounded-2xl bg-card shadow-sm border border-border p-4 space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      <div className="rounded-2xl bg-card shadow-sm border border-border p-4">
        <Skeleton className="h-5 w-40 mb-3" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-36 mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
