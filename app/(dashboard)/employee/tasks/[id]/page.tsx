"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Phone, MessageCircle, MapPin, Camera, PlayCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types"

const categoryColor: Record<TaskCategory, string> = {
  installation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  billing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  repair: "bg-red-500/10 text-red-600 border-red-500/20",
  inspection: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
}

const priorityColor: Record<TaskPriority, string> = {
  low: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",
}

const statusColor: Record<TaskStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  on_hold: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const categoryLabel: Record<TaskCategory, string> = {
  installation: "Instalasi",
  maintenance: "Maintenance",
  billing: "Billing",
  repair: "Perbaikan",
  inspection: "Inspeksi",
}

const priorityLabel: Record<TaskPriority, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Urgent",
}

const statusLabel: Record<TaskStatus, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  on_hold: "Ditunda",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const [noteText, setNoteText] = useState("")
  const [task, setTask] = useState<Task | null>(null)
  const [taskTimeline, setTaskTimeline] = useState<Array<{
    id: string
    status: TaskStatus
    description: string | null
    timestamp: string
    employeeName: string | null
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const list = await apiClient.get<Task[]>("/api/tasks")
        if (!cancelled) {
          const found = list.find((t) => t.id === taskId) || null
          setTask(found)
        }
        const events = await apiClient.get<Array<{
          id: string
          status: TaskStatus
          description: string | null
          timestamp: string
          employeeName: string | null
        }>>("/api/timeline-events", { taskId })
        if (!cancelled) {
          const sorted = events.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          setTaskTimeline(sorted)
        }
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Gagal memuat data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (taskId) load()
    return () => {
      cancelled = true
    }
  }, [taskId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Tugas tidak ditemukan</p>
        <Button asChild variant="outline">
          <Link href="/employee/tasks">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Link
        href="/employee/tasks"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Daftar Tugas
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={categoryColor[task.category]}>
              {categoryLabel[task.category]}
            </Badge>
            <Badge variant="outline" className={priorityColor[task.priority]}>
              {priorityLabel[task.priority]}
            </Badge>
            <Badge variant="outline" className={statusColor[task.status]}>
              {statusLabel[task.status]}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{task.rewardPoints}</span>
            <span className="text-sm text-muted-foreground">Poin Reward</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">Informasi Pelanggan</h3>
            <p className="text-sm font-medium">{task.customerName}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{task.customerPhone}</span>
              <a
                href={`https://wa.me/${task.customerPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center size-7 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
              >
                <MessageCircle className="size-3.5" />
              </a>
              <a
                href={`tel:${task.customerPhone}`}
                className="inline-flex items-center justify-center size-7 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
              >
                <Phone className="size-3.5" />
              </a>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">Lokasi</h3>
            <p className="text-sm">{task.address}</p>
            {task.addressDetail && (
              <p className="text-sm text-muted-foreground">{task.addressDetail}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="size-3.5 text-muted-foreground" />
              <a
                href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Buka di Google Maps
              </a>
              <span className="text-xs text-muted-foreground">
                ({task.latitude.toFixed(4)}, {task.longitude.toFixed(4)})
              </span>
            </div>
            <div className="mt-2 h-32 rounded-xl bg-muted flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border">
              <div className="flex flex-col items-center gap-1">
                <MapPin className="size-5" />
                <span>Peta Lokasi</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
            <p className="text-sm">{task.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Dibuat</span>
              <span>{formatDate(task.createdAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Tanggal Kerja</span>
              <span>{formatDate(task.workingDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {taskTimeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
          ) : (
            <div className="relative flex flex-col gap-0">
              {taskTimeline.map((event, idx) => (
                <div key={event.id} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-2.5 rounded-full mt-1.5 ${
                        idx === taskTimeline.length - 1
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                    {idx < taskTimeline.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 pb-6">
                    <Badge variant="outline" className={`w-fit ${statusColor[event.status]}`}>
                      {statusLabel[event.status]}
                    </Badge>
                    <p className="text-sm">{event.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{event.employeeName}</span>
                      <span>·</span>
                      <span>{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {task.attachments ? (() => {
        let atts: string[] = []
        const attStr = task.attachments as unknown as string
        try { atts = JSON.parse(attStr) } catch { atts = attStr ? [attStr] : [] }
        return atts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lampiran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {atts.map((file, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {file}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null
      })() : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catatan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(() => {
            let notes: string[] = []
            const notesStr = (task.notes as unknown as string) || "[]"
            try { notes = JSON.parse(notesStr) } catch { notes = notesStr ? [notesStr] : [] }
            return notes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {notes.map((note, idx) => (
                  <div key={idx} className="rounded-xl bg-muted px-3 py-2 text-sm">
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada catatan</p>
            )
          })()}
          <Textarea
            placeholder="Tambahkan catatan..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-20"
          />
          <Button
            size="sm"
            className="w-full sm:w-auto"
            disabled={!noteText.trim()}
            onClick={async () => {
              if (!noteText.trim()) return
              try {
                let notes: string[] = []
                const notesStr = (task.notes as unknown as string) || "[]"
                try { notes = JSON.parse(notesStr) } catch { notes = notesStr ? [notesStr] : [] }
                notes.push(noteText.trim())
                await apiClient.put("/api/tasks", {
                  id: task.id,
                  notes: JSON.stringify(notes),
                })
                setTask({ ...task, notes: JSON.stringify(notes) as unknown as string[] })
                setNoteText("")
                toast.success("Catatan ditambahkan")
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : "Gagal menambah catatan")
              }
            }}
          >
            Kirim Catatan
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 pt-2">
        {task.status === "pending" && (
          <Button
            className="w-full"
            size="lg"
            onClick={async () => {
              try {
                await apiClient.put("/api/tasks", {
                  id: task.id,
                  status: "in_progress",
                  startedAt: new Date().toISOString(),
                })
                toast.success("Tugas dimulai")
                setTask({ ...task, status: "in_progress" })
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : "Gagal memulai tugas")
              }
            }}
          >
            <PlayCircle className="size-4" />
            Mulai Tugas
          </Button>
        )}
        {task.status === "in_progress" && (
          <>
            <Button className="w-full" size="lg" variant="outline">
              <Camera className="size-4" />
              Upload Bukti
            </Button>
            <Button
              className="w-full"
              size="lg"
              onClick={async () => {
                try {
                  await apiClient.put("/api/tasks", {
                    id: task.id,
                    status: "completed",
                    completedAt: new Date().toISOString(),
                  })
                  toast.success(`Tugas selesai! +${task.rewardPoints} poin`)
                  setTask({ ...task, status: "completed" })
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Gagal menyelesaikan tugas")
                }
              }}
            >
              <CheckCircle2 className="size-4" />
              Selesaikan Tugas
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
