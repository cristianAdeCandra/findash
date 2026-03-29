'use client'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const PIE_COLORS = ['#f59e0b','#38bdf8','#a78bfa','#22d3a5','#ff5f7e','#818cf8','#34d399','#6c63ff']

interface Props {
  months: string[]; penData: number[]; invData: number[]
  kats: string[]; katData: number[]
  jenisArr: string[]; jenisData: number[]
}

export default function DashboardCharts({ months, penData, invData, kats, katData, jenisArr, jenisData }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Bar chart */}
      <div className="card p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
          Pengeluaran vs Investasi — 6 Bulan Terakhir
        </div>
        <div className="flex gap-4 mb-3">
          {[['#ff5f7e','Pengeluaran'],['#38bdf8','Investasi']].map(([c,l])=>(
            <span key={l} className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="w-2.5 h-2.5 rounded-sm" style={{background:c}}/>
              {l}
            </span>
          ))}
        </div>
        <div className="relative h-52">
          <Bar data={{
            labels: months,
            datasets: [
              { label:'Pengeluaran', data: penData, backgroundColor:'rgba(255,95,126,0.8)',  borderRadius:6, borderSkipped:false },
              { label:'Investasi',   data: invData, backgroundColor:'rgba(56,189,248,0.8)',  borderRadius:6, borderSkipped:false },
            ],
          }} options={{
            responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ display:false } },
            scales:{
              x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#9090a8', font:{ size:11 } } },
              y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#9090a8', font:{ size:11 },
                callback:(v) => {
                  const n = Number(v)
                  if(n>=1e6) return 'Rp'+(n/1e6).toFixed(0)+'jt'
                  if(n>=1e3) return 'Rp'+(n/1e3).toFixed(0)+'rb'
                  return 'Rp'+n
                }
              }},
            },
          }} />
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title:'Kategori Pengeluaran (Bulan Ini)', labels:kats,    data:katData  },
          { title:'Portofolio Investasi (Modal)',      labels:jenisArr, data:jenisData },
        ].map(({ title, labels, data }) => {
          const filtered = labels.map((l,i)=>({ l, d:data[i] })).filter(x=>x.d>0)
          return (
            <div key={title} className="card p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">{title}</div>
              {filtered.length === 0
                ? <div className="text-center text-white/20 text-sm py-8">Belum ada data</div>
                : <div className="relative h-40">
                    <Doughnut data={{
                      labels: filtered.map(x=>x.l),
                      datasets:[{ data:filtered.map(x=>x.d), backgroundColor:PIE_COLORS.slice(0,filtered.length), borderWidth:0, hoverOffset:6 }],
                    }} options={{
                      responsive:true, maintainAspectRatio:false, cutout:'65%',
                      plugins:{
                        legend:{ display:false },
                        tooltip:{ callbacks:{ label:(ctx)=>ctx.label+': Rp '+Math.round(Number(ctx.raw)).toLocaleString('id-ID') } },
                      },
                    }} />
                  </div>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}
