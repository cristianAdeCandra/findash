import { createServerSupabase } from '@/lib/supabase'
import { Investasi } from '@/types'
import { fmtShort, calcPL } from '@/lib/utils'
import InvestasiClient from './InvestasiClient'

export default async function InvestasiPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('investasi').select('*').eq('user_id', user.id)
    .order('tanggal', { ascending: false })

  const list: Investasi[] = data ?? []
  const totalModal = list.reduce((s,x)=>s+x.modal,0)
  const totalNilai = list.reduce((s,x)=>s+calcPL(x).nilai_sekarang,0)
  const totalPL    = totalNilai - totalModal

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Investasi</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Modal: {fmtShort(totalModal)} · Nilai: {fmtShort(totalNilai)} ·{' '}
          <span className={totalPL>=0?'text-fin-green':'text-fin-red'}>
            P/L: {totalPL>=0?'+':''}{fmtShort(totalPL)}
          </span>
        </p>
      </div>
      <InvestasiClient initialData={list} />
    </div>
  )
}
