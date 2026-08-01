"use client"

import { useState } from "react"
import { toast } from "sonner"

const timeOptions = ["06.00", "07.00", "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00", "17.00", "18.00", "19.00", "20.00"]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function AdminSettingsPage() {
  const [checkInTime, setCheckInTime] = useState("08.00")
  const [breakStart, setBreakStart] = useState("12.00")
  const [breakEnd, setBreakEnd] = useState("13.00")
  const [checkOutTime, setCheckOutTime] = useState("17.00")
  const [toleranceIn, setToleranceIn] = useState("30")
  const [toleranceBreak, setToleranceBreak] = useState("30")
  const [deviceBinding, setDeviceBinding] = useState(true)
  const [taskSalaryFreeze, setTaskSalaryFreeze] = useState(true)
  const [poinPemasangan, setPoinPemasangan] = useState("100")
  const [poinGangguan, setPoinGangguan] = useState("50")
  const [poinTagihan, setPoinTagihan] = useState("20")
  const [poinBuatTugas, setPoinBuatTugas] = useState("10")

  const handleSave = () => {
    toast.success("Pengaturan berhasil disimpan!")
  }

  return (
    <div className="space-y-4">
      {/* Schedule card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jadwal Jam Masuk</label>
          <select
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mulai Istirahat</label>
          <select
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Selesai Istirahat</label>
          <select
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jadwal Selesai Pulang</label>
          <select
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Toleransi Keterlambatan Jam Masuk (Menit)
          </label>
          <input
            type="number"
            value={toleranceIn}
            onChange={(e) => setToleranceIn(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Toleransi Keterlambatan Selesai Istirahat (Menit)
          </label>
          <input
            type="number"
            value={toleranceBreak}
            onChange={(e) => setToleranceBreak(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Security section */}
      <div>
        <h2 className="text-sm font-bold text-primary mb-2">Keamanan Absensi &amp; Kontrol Gaji</h2>
        <div className="space-y-3">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 uppercase">
                Pengikatan Perangkat (Device Binding)
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Jika aktif, akun karyawan akan otomatis diikat ke perangkat HP pertama yang digunakan untuk absensi.
                Karyawan tidak bisa absen menggunakan perangkat HP lain kecuali di-reset oleh Admin.
              </p>
            </div>
            <Toggle checked={deviceBinding} onChange={setDeviceBinding} />
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 uppercase">
                Pembekuan Gaji Berbasis Tugas (Task Salary Freeze)
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Jika aktif, jam kerja &amp; gaji karyawan otomatis dibekukan (paused) jika masih ada tugas namun
                karyawan berada di geofence kantor. Jika dimatikan, jam kerja &amp; gaji berjalan normal tanpa dibekukan.
              </p>
            </div>
            <Toggle checked={taskSalaryFreeze} onChange={setTaskSalaryFreeze} />
          </div>
        </div>
      </div>

      {/* Points per category */}
      <div>
        <h2 className="text-sm font-bold text-primary mb-2">Poin Hadiah Per Kategori Tugas</h2>
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Poin Pemasangan</label>
            <input
              type="number"
              value={poinPemasangan}
              onChange={(e) => setPoinPemasangan(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Poin Gangguan</label>
            <input
              type="number"
              value={poinGangguan}
              onChange={(e) => setPoinGangguan(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Poin Tagihan</label>
            <input
              type="number"
              value={poinTagihan}
              onChange={(e) => setPoinTagihan(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Poin Membuat Tugas (Karyawan)
            </label>
            <input
              type="number"
              value={poinBuatTugas}
              onChange={(e) => setPoinBuatTugas(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-sm hover:bg-primary/90"
      >
        Simpan Pengaturan
      </button>
    </div>
  )
}
