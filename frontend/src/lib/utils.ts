// ============================================================
// lib/utils.ts — Formatting & calculation helpers
// ============================================================

export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'Rp 0'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export function fmtShort(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'Rp 0'
  const abs  = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e12) return sign + 'Rp ' + (abs / 1e12).toFixed(1) + 'T'
  if (abs >= 1e9)  return sign + 'Rp ' + (abs / 1e9).toFixed(1)  + 'M'
  if (abs >= 1e6)  return sign + 'Rp ' + (abs / 1e6).toFixed(1)  + 'jt'
  if (abs >= 1e3)  return sign + 'Rp ' + (abs / 1e3).toFixed(0)  + 'rb'
  return sign + 'Rp ' + Math.round(abs).toLocaleString('id-ID')
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  return sign + n.toFixed(2) + '%'
}

export function curPrefix(): string {
  const now = new Date()
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
}

export function todayStr(): string {
  const d = new Date()
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0')
}

export const MONTHS_FULL = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

export function getLast6Months(): Array<{ prefix: string; label: string }> {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      prefix: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
      label: MONTHS_SHORT[d.getMonth()],
    }
  })
}

export function calcPL(item: {
  modal: number
  harga_beli?: number | null
  harga_sekarang?: number | null
  qty?: number | null
}) {
  if (item.harga_sekarang && item.harga_beli && item.qty) {
    const nilai_sekarang = item.harga_sekarang * item.qty
    const modal          = item.harga_beli     * item.qty
    const pl             = nilai_sekarang - modal
    const pl_pct         = modal > 0 ? (pl / modal) * 100 : 0
    return { nilai_sekarang, pl, pl_pct }
  }
  return { nilai_sekarang: item.modal, pl: null, pl_pct: null }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const KAT_COLOR: Record<string, string> = {
  'Makanan & Minuman': 'badge-amber',
  'Transportasi':      'badge-blue',
  'Belanja':           'badge-purple',
  'Kesehatan':         'badge-green',
  'Hiburan':           'badge-red',
  'Tagihan & Utilitas':'badge-purple',
  'Pendidikan':        'badge-blue',
  'Lainnya':           'badge-green',
}

export const INV_COLOR: Record<string, string> = {
  'Saham':      'badge-blue',
  'Reksa Dana': 'badge-green',
  'Obligasi':   'badge-amber',
  'Emas':       'badge-amber',
  'Kripto':     'badge-red',
  'Deposito':   'badge-purple',
  'Properti':   'badge-blue',
  'Lainnya':    'badge-green',
}
