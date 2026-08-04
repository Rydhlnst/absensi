"use client"

import { useState } from "react"
import { FileText, Table } from "lucide-react"
import { generatePDF, generateExcel, formatCurrency } from "@/lib/export"

const sampleData = [
  { no: 1, nama: "Budi Santoso", tanggal: "01 Jul 2026", masuk: "07:45", pulang: "17:05", durasi: "9j 20m", status: "Hadir", gaji: "Rp 204.545" },
  { no: 2, nama: "Dewi Anggraini", tanggal: "01 Jul 2026", masuk: "08:10", pulang: "17:00", durasi: "8j 50m", status: "Terlambat", gaji: "Rp 200.000" },
  { no: 3, nama: "Eko Prasetyo", tanggal: "01 Jul 2026", masuk: "07:30", pulang: "17:15", durasi: "9j 45m", status: "Hadir", gaji: "Rp 209.091" },
  { no: 4, nama: "Gilang Ramadhan", tanggal: "01 Jul 2026", masuk: "07:50", pulang: "17:10", durasi: "9j 20m", status: "Hadir", gaji: "Rp 204.545" },
  { no: 5, nama: "Fitri Handayani", tanggal: "01 Jul 2026", masuk: "-", pulang: "-", durasi: "-", status: "Tidak Hadir", gaji: "Rp 0" },
]

const columns = [
  { header: "No", dataKey: "no", width: 10, align: "center" as const },
  { header: "Nama Karyawan", dataKey: "nama", width: 45 },
  { header: "Tanggal", dataKey: "tanggal", width: 28, align: "center" as const },
  { header: "Masuk", dataKey: "masuk", width: 16, align: "center" as const },
  { header: "Pulang", dataKey: "pulang", width: 16, align: "center" as const },
  { header: "Durasi", dataKey: "durasi", width: 18, align: "center" as const },
  { header: "Status", dataKey: "status", width: 22, align: "center" as const },
  { header: "Gaji", dataKey: "gaji", width: 28, align: "right" as const },
]

export default function TestExportPage() {
  const [lastAction, setLastAction] = useState("")

  const handlePDF = () => {
    generatePDF({
      title: "Laporan Absensi Karyawan",
      subtitle: "Filter: Bulanan - Juli 2026",
      companyName: "ANDAR.NET",
      companyAddress: "Jl. TB Simatupang No. 88, Lt. 5, Jakarta Selatan",
      companyPhone: "+622129529666",
      filename: "test-laporan-absensi",
      summary: [
        { label: "Total Gaji", value: formatCurrency(818181) },
        { label: "Total Waktu", value: "37j 20m" },
        { label: "Jumlah Log", value: "5 Data" },
      ],
      columns,
      rows: sampleData,
    })
    setLastAction(`PDF diunduh pada ${new Date().toLocaleTimeString("id-ID")}`)
  }

  const handleExcel = () => {
    generateExcel({
      title: "Laporan Absensi Karyawan",
      subtitle: "Filter: Bulanan - Juli 2026",
      filename: "test-laporan-absensi",
      summary: [
        { label: "Total Gaji", value: formatCurrency(818181) },
        { label: "Total Waktu", value: "37j 20m" },
        { label: "Jumlah Log", value: "5 Data" },
      ],
      columns: [
        { header: "No", dataKey: "no", width: 5 },
        { header: "Nama Karyawan", dataKey: "nama", width: 25 },
        { header: "Tanggal", dataKey: "tanggal", width: 15 },
        { header: "Jam Masuk", dataKey: "masuk", width: 12 },
        { header: "Jam Pulang", dataKey: "pulang", width: 12 },
        { header: "Durasi (menit)", dataKey: "durasi", width: 15 },
        { header: "Status", dataKey: "status", width: 15 },
        { header: "Gaji (Rp)", dataKey: "gaji", width: 18 },
      ],
      rows: sampleData,
    })
    setLastAction(`Excel diunduh pada ${new Date().toLocaleTimeString("id-ID")}`)
  }

  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Test Export PDF & Excel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Halaman ini untuk menguji apakah fungsi export PDF dan Excel berjalan dengan baik.
          </p>
        </div>

        <div className="rounded-2xl bg-card shadow-sm border border-border p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Preview Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((col) => (
                    <th
                      key={col.dataKey}
                      className={`py-2 px-3 font-semibold text-muted-foreground ${
                        col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.no} className="border-b border-border/50">
                    <td className="py-2 px-3 text-center">{row.no}</td>
                    <td className="py-2 px-3 font-medium">{row.nama}</td>
                    <td className="py-2 px-3 text-center">{row.tanggal}</td>
                    <td className="py-2 px-3 text-center">{row.masuk}</td>
                    <td className="py-2 px-3 text-center">{row.pulang}</td>
                    <td className="py-2 px-3 text-center">{row.durasi}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.status === "Hadir" ? "bg-green-100 text-green-700" :
                        row.status === "Terlambat" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{row.gaji}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handlePDF}
            className="flex items-center justify-center gap-3 rounded-2xl bg-card border border-border p-6 shadow-sm hover:bg-muted/50 transition-colors"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-100">
              <FileText className="size-6 text-red-600" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold text-foreground">Download PDF</p>
              <p className="text-xs text-muted-foreground">Laporan dalam format PDF</p>
            </div>
          </button>

          <button
            onClick={handleExcel}
            className="flex items-center justify-center gap-3 rounded-2xl bg-card border border-border p-6 shadow-sm hover:bg-muted/50 transition-colors"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-100">
              <Table className="size-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold text-foreground">Download Excel</p>
              <p className="text-xs text-muted-foreground">Laporan dalam format XLSX</p>
            </div>
          </button>
        </div>

        {lastAction && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-sm font-semibold text-green-700">{lastAction}</p>
          </div>
        )}

        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 space-y-2">
          <h3 className="text-sm font-bold text-blue-900">Fitur yang diuji:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Header perusahaan (ANDAR.NET) dengan background biru</li>
            <li>• Box ringkasan (Total Gaji, Total Waktu, Jumlah Log)</li>
            <li>• Tabel dengan header biru, alternating row colors</li>
            <li>• Footer dengan nomor halaman</li>
            <li>• Format mata uang Rupiah</li>
            <li>• Excel dengan auto-width kolom dan merge header</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
