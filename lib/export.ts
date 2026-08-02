import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

interface ExportColumn {
  header: string
  dataKey: string
  width?: number
  align?: "left" | "center" | "right"
}

interface ExportSummary {
  label: string
  value: string
}

interface ExportOptions {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  rows: Record<string, unknown>[]
  filename: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  summary?: ExportSummary[]
  orientation?: "portrait" | "landscape"
}

const BRAND_BLUE: [number, number, number] = [30, 58, 138]
const LIGHT_BLUE: [number, number, number] = [235, 241, 250]
const DARK_GRAY: [number, number, number] = [60, 60, 60]
const MID_GRAY: [number, number, number] = [120, 120, 120]
const LIGHT_GRAY: [number, number, number] = [245, 247, 250]
const BORDER_GRAY: [number, number, number] = [210, 210, 210]

function formatTanggal(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function drawHeader(
  doc: jsPDF,
  companyName: string,
  companyAddress: string | undefined,
  companyPhone: string | undefined,
  pageWidth: number
): number {
  const margin = 14

  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, pageWidth, 38, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(companyName, margin, 16)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  let infoY = 24
  if (companyAddress) {
    doc.text(companyAddress, margin, infoY)
    infoY += 5
  }
  if (companyPhone) {
    doc.text(`Telp: ${companyPhone}`, margin, infoY)
  }

  doc.setFontSize(7)
  doc.text(`Dicetak: ${formatTanggal(new Date())}`, pageWidth - margin, 16, {
    align: "right",
  })

  return 46
}

function drawSummaryBox(
  doc: jsPDF,
  summary: ExportSummary[],
  startY: number,
  pageWidth: number,
  margin: number
): number {
  if (summary.length === 0) return startY

  const boxWidth = pageWidth - margin * 2
  const colWidth = boxWidth / summary.length
  const boxHeight = 22

  doc.setFillColor(...LIGHT_BLUE)
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, startY, boxWidth, boxHeight, 2, 2, "FD")

  summary.forEach((item, i) => {
    const x = margin + i * colWidth + colWidth / 2

    doc.setTextColor(...MID_GRAY)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text(item.label.toUpperCase(), x, startY + 7, { align: "center" })

    doc.setTextColor(...DARK_GRAY)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(item.value, x, startY + 16, { align: "center" })
  })

  return startY + boxHeight + 8
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
  const footerY = pageHeight - 12

  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

  doc.setTextColor(...MID_GRAY)
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")

  doc.text("ANDAR.NET - Sistem Manajemen Absensi & Tugas Lapangan", margin, footerY)

  const pageCount = doc.getNumberOfPages()
  const currentPage = doc.getCurrentPageInfo().pageNumber
  doc.text(`Halaman ${currentPage} dari ${pageCount}`, pageWidth - margin, footerY, {
    align: "right",
  })
}

export function generatePDF(options: ExportOptions): void {
  const {
    title,
    subtitle,
    columns,
    rows,
    filename,
    companyName = "ANDAR.NET",
    companyAddress,
    companyPhone,
    summary,
    orientation = "landscape",
  } = options

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14

  const headerEndY = drawHeader(doc, companyName, companyAddress, companyPhone, pageWidth)

  doc.setTextColor(...DARK_GRAY)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(title, margin, headerEndY + 2)

  let currentY = headerEndY + 10

  if (subtitle) {
    doc.setTextColor(...MID_GRAY)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(subtitle, margin, currentY)
    currentY += 6
  }

  if (summary && summary.length > 0) {
    currentY = drawSummaryBox(doc, summary, currentY, pageWidth, margin)
  }

  const head = [columns.map((col) => col.header)]
  const body = rows.map((row) =>
    columns.map((col) => {
      const val = row[col.dataKey]
      return val !== undefined && col !== null ? String(val) : "-"
    })
  )

  const columnStyles: Record<string, object> = {}
  columns.forEach((col, i) => {
    columnStyles[i] = {
      halign: col.align || "left",
      ...(col.width ? { cellWidth: col.width } : {}),
    }
  })

  autoTable(doc, {
    head,
    body,
    startY: currentY,
    margin: { left: margin, right: margin, top: currentY, bottom: 18 },
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8,
      halign: "left",
      valign: "middle",
      cellPadding: 3.5,
      textColor: DARK_GRAY,
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
    },
    styles: {
      lineWidth: 0.1,
      lineColor: BORDER_GRAY,
      overflow: "linebreak",
    },
    columnStyles,
  })

  drawFooter(doc, pageWidth, pageHeight, margin)

  doc.save(`${filename}.pdf`)
}

export function generateExcel(options: ExportOptions): void {
  const { title, columns, rows, filename, subtitle, summary } = options

  const wb = XLSX.utils.book_new()

  const headerRow = columns.map((col) => col.header)
  const dataRows = rows.map((row) =>
    columns.map((col) => {
      const val = row[col.dataKey]
      return val !== undefined && val !== null ? val : ""
    })
  )

  const wsData: unknown[][] = [
    [title],
    subtitle ? [subtitle] : [],
    [`Dicetak: ${formatTanggal(new Date())}`],
    [],
  ]

  if (summary && summary.length > 0) {
    wsData.push(summary.map((s) => s.label))
    wsData.push(summary.map((s) => s.value))
    wsData.push([])
  }

  wsData.push(headerRow)
  wsData.push(...dataRows)

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws["!cols"] = columns.map((col) => ({
    wch: col.width || 20,
  }))

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws, "Laporan")

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
