import { createServerSupabase } from '@/lib/supabase'
import { Target, Tabungan } from '@/types'
import { curPrefix } from '@/lib/utils'
import TargetClient from './TargetClient'

export default async function TargetPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const cp = curPrefix()
  const [tgtRes, tabRes, penRes, invRes] = await Promise.all([
    supabase.from('targets').select('*').eq('user_id', user.id).eq('bulan', cp).maybeSingle(),
    supabase.from('tabungan').select('*').eq('user_id', user.id).order('urutan'),
    supabase.from('pengeluaran').select('jumlah,tanggal').eq('user_id', user.id),
    supabase.from('investasi').select('modal,tanggal').eq('user_id', user.id),
  ])

  const penBulan = (penRes.data ?? []).filter(x=>x.tanggal.startsWith(cp)).reduce((s:number,x:{ jumlah:number })=>s+x.jumlah,0)
  const invBulan = (invRes.data ?? []).filter(x=>x.tanggal.startsWith(cp)).reduce((s:number,x:{ modal:number })=>s+x.modal,0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Target & Anggaran</h1>
        <p className="text-white/40 text-sm mt-0.5">Bulan {cp}</p>
      </div>
      <TargetClient
        initialTarget={tgtRes.data as Target | null}
        initialTabungan={(tabRes.data ?? []) as Tabungan[]}
        bulan={cp}
        penBulan={penBulan}
        invBulan={invBulan}
      />
    </div>
  )
}
