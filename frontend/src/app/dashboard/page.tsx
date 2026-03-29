import { createServerSupabase } from '@/lib/supabase'
import { fmtShort, curPrefix, getLast6Months, calcPL } from '@/lib/utils'
import { Pengeluaran, Investasi, Target } from '@/types'
import DashboardCharts from '@/components/charts/DashboardCharts'
import StatCard from '@/components/ui/StatCard'
import BudgetNotification from '@/components/ui/BudgetNotification'

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const cp = curPrefix()

  // Parallel fetch
  const [penRes, invRes, tgtRes] = await Promise.all([
    supabase.from('pengeluaran').select('*').eq('user_id', user.id).order('tanggal', { ascending: false }),
    supabase.from('investasi').select('*').eq('user_id', user.id).order('tanggal', { ascending: false }),
    supabase.from('targets').select('*').eq('user_id', user.id).eq('bulan', cp).maybeSingle(),
  ])

  const allPengeluaran: Pengeluaran[] = penRes.data ?? []
  const allInvestasi:   Investasi[]   = invRes.data ?? []
  const target:         Target | null = tgtRes.data

  // Month stats
  const penBulanIni = allPengeluaran.filter(x => x.tanggal.startsWith(cp))
  const invBulanIni = allInvestasi.filter(x => x.tanggal.startsWith(cp))
  const totalPengeluaran = penBulanIni.reduce((s, x) => s + x.jumlah, 0)
  const totalInvestasi   = invBulanIni.reduce((s, x) => s + x.modal,  0)
  const saldoBersih      = (target?.pendapatan ?? 0) - totalPengeluaran
  const anggaranTersisa  = (target?.batas_keluar ?? 0) - totalPengeluaran

  // Portfolio P/L
  const totalPortofolio = allInvestasi.reduce((s, x) => s + calcPL(x).nilai_sekarang, 0)
  const totalModal      = allInvestasi.reduce((s, x) => s + x.modal, 0)
  const totalPL         = totalPortofolio - totalModal

  // 6-month chart data
  const months  = getLast6Months()
  const penData = months.map(m => allPengeluaran.filter(x => x.tanggal.startsWith(m.prefix)).reduce((s,x)=>s+x.jumlah,0))
  const invData = months.map(m => allInvestasi.filter(x => x.tanggal.startsWith(m.prefix)).reduce((s,x)=>s+x.modal,0))

  // Pie: kategori pengeluaran bulan ini
  const kats = ['Makanan & Minuman','Transportasi','Belanja','Kesehatan','Hiburan','Tagihan & Utilitas','Pendidikan','Lainnya']
  const katData = kats.map(k => penBulanIni.filter(x=>x.kategori===k).reduce((s,x)=>s+x.jumlah,0))

  // Pie: investasi by jenis
  const jenisArr = ['Saham','Reksa Dana','Obligasi','Emas','Kripto','Deposito','Properti','Lainnya']
  const jenisData = jenisArr.map(j => allInvestasi.filter(x=>x.jenis===j).reduce((s,x)=>s+x.modal,0))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Ringkasan Keuangan</h1>
        <p className="text-white/40 text-sm mt-0.5">bulan ini</p>
      </div>

      {/* Budget notification */}
      <BudgetNotification
        totalPengeluaran={totalPengeluaran}
        batasKeluar={target?.batas_keluar ?? 0}
        targetInvestasi={target?.target_invest ?? 0}
        totalInvestasi={totalInvestasi}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Saldo Bersih"       value={fmtShort(Math.max(0, saldoBersih))}   color="green"  sub="pendapatan − pengeluaran" />
        <StatCard label="Pengeluaran"         value={fmtShort(totalPengeluaran)}            color="red"    sub="bulan ini" />
        <StatCard label="Investasi"           value={fmtShort(totalInvestasi)}              color="blue"   sub="modal masuk bulan ini" />
        <StatCard label="Anggaran Tersisa"    value={fmtShort(Math.max(0,anggaranTersisa))} color="amber"  sub="dari batas pengeluaran" />
        <StatCard label="Nilai Portofolio"    value={fmtShort(totalPortofolio)}             color="purple" sub="semua investasi saat ini" />
        <StatCard label="Profit / Loss"       value={(totalPL>=0?'+':'')+fmtShort(totalPL)} color={totalPL>=0?'green':'red'} sub="nilai vs modal" />
      </div>

      {/* Charts */}
      <DashboardCharts
        months={months.map(m => m.label)}
        penData={penData}
        invData={invData}
        kats={kats}
        katData={katData}
        jenisArr={jenisArr}
        jenisData={jenisData}
      />
    </div>
  )
}
