'use client'
import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  totalPengeluaran: number
  batasKeluar:      number
  targetInvestasi:  number
  totalInvestasi:   number
}

export default function BudgetNotification({ totalPengeluaran, batasKeluar, targetInvestasi, totalInvestasi }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const rasio = batasKeluar > 0 ? totalPengeluaran / batasKeluar : 0
  const isOver   = rasio >= 1
  const isNear   = rasio >= 0.8 && !isOver
  const invDone  = targetInvestasi > 0 && totalInvestasi >= targetInvestasi

  if (!isOver && !isNear) return null

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm
                     ${isOver ? 'notif-danger' : 'notif-warn'}`}>
      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {isOver
          ? `🚨 Anggaran pengeluaran HABIS! Sudah Rp ${Math.round(totalPengeluaran).toLocaleString('id-ID')} dari Rp ${Math.round(batasKeluar).toLocaleString('id-ID')}`
          : `⚠️ Anggaran hampir habis! ${Math.round(rasio * 100)}% terpakai — sisa Rp ${Math.round(batasKeluar - totalPengeluaran).toLocaleString('id-ID')}`}
        {invDone && ' · ✅ Target investasi bulan ini tercapai!'}
      </div>
      <button onClick={() => setDismissed(true)} className="text-current opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
