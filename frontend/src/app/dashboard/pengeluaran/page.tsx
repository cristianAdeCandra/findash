import { createServerSupabase } from '@/lib/supabase'
import { fmt } from '@/lib/utils'
import { Pengeluaran } from '@/types'
import PengeluaranClient from './PengeluaranClient'

export default async function PengeluaranPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('pengeluaran')
    .select('*')
    .eq('user_id', user.id)
    .order('tanggal', { ascending: false })

  const list: Pengeluaran[] = data ?? []
  const total = list.reduce((s, x) => s + x.jumlah, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Pengeluaran</h1>
        <p className="text-white/40 text-sm mt-0.5">Total semua waktu: {fmt(total)}</p>
      </div>
      <PengeluaranClient initialData={list} />
    </div>
  )
}
