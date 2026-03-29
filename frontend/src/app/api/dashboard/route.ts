// GET /api/dashboard — returns aggregated stats for current month
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { curPrefix, calcPL } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cp = curPrefix()

  const [penRes, invRes, tgtRes] = await Promise.all([
    supabase.from('pengeluaran').select('jumlah,tanggal,kategori').eq('user_id', user.id),
    supabase.from('investasi').select('modal,tanggal,jenis,harga_beli,harga_sekarang,qty').eq('user_id', user.id),
    supabase.from('targets').select('*').eq('user_id', user.id).eq('bulan', cp).maybeSingle(),
  ])

  const penAll = penRes.data ?? []
  const invAll = invRes.data ?? []
  const target = tgtRes.data

  const penBulan = penAll.filter(x => x.tanggal.startsWith(cp))
  const invBulan = invAll.filter(x => x.tanggal.startsWith(cp))

  const totalPengeluaran = penBulan.reduce((s: number, x: { jumlah: number }) => s + x.jumlah, 0)
  const totalInvestasi   = invBulan.reduce((s: number, x: { modal: number }) => s + x.modal, 0)
  const totalModal       = invAll.reduce((s: number, x: { modal: number }) => s + x.modal, 0)
  const totalPortofolio  = invAll.reduce((s: number, x: { modal: number; harga_beli?: number | null; harga_sekarang?: number | null; qty?: number | null }) => {
    const { nilai_sekarang } = calcPL(x as Parameters<typeof calcPL>[0])
    return s + nilai_sekarang
  }, 0)

  return NextResponse.json({
    total_pengeluaran_bulan: totalPengeluaran,
    total_investasi_bulan:   totalInvestasi,
    saldo_bersih:            (target?.pendapatan ?? 0) - totalPengeluaran,
    anggaran_tersisa:        (target?.batas_keluar ?? 0) - totalPengeluaran,
    total_portofolio:        totalPortofolio,
    total_pl:                totalPortofolio - totalModal,
    target,
  })
}
