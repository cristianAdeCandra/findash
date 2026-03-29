'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Target, Tabungan, Warna } from '@/types'
import { fmt } from '@/lib/utils'

const WARNAS: { value: Warna; label: string; cls: string }[] = [
  { value:'green',  label:'Hijau',  cls:'bg-fin-green'  },
  { value:'blue',   label:'Biru',   cls:'bg-fin-blue'   },
  { value:'amber',  label:'Kuning', cls:'bg-fin-amber'  },
  { value:'purple', label:'Ungu',   cls:'bg-fin-purple' },
  { value:'red',    label:'Merah',  cls:'bg-fin-red'    },
]

const FILL_CLS: Record<Warna,string> = {
  green:'bg-fin-green', blue:'bg-fin-blue', amber:'bg-fin-amber', purple:'bg-fin-purple', red:'bg-fin-red'
}

interface Props {
  initialTarget:  Target | null
  initialTabungan: Tabungan[]
  bulan: string
  penBulan: number
  invBulan: number
}

export default function TargetClient({ initialTarget, initialTabungan, bulan, penBulan, invBulan }: Props) {
  const [target, setTarget]   = useState<Target | null>(initialTarget)
  const [tabList, setTabList] = useState(initialTabungan)
  const [tForm, setTForm]     = useState({
    pendapatan:  String(initialTarget?.pendapatan  ?? ''),
    batas_keluar: String(initialTarget?.batas_keluar ?? ''),
    target_invest: String(initialTarget?.target_invest ?? ''),
    target_tabung: String(initialTarget?.target_tabung ?? ''),
  })
  const [saving, setSaving]       = useState(false)
  const [editTab, setEditTab]     = useState<Tabungan | null>(null)
  const [showAddTab, setShowAdd]  = useState(false)
  const [newTab, setNewTab]       = useState({ nama:'', deskripsi:'', target:'', terkumpul:'', warna:'green' as Warna })

  async function saveTarget() {
    setSaving(true)
    try {
      const res = await fetch('/api/targets', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          bulan,
          pendapatan:    Number(tForm.pendapatan)   || 0,
          batas_keluar:  Number(tForm.batas_keluar) || 0,
          target_invest: Number(tForm.target_invest)|| 0,
          target_tabung: Number(tForm.target_tabung)|| 0,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated: Target = await res.json()
      setTarget(updated)
      toast.success('Target disimpan')
    } catch(e:unknown){ toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  async function addTabungan(e: React.FormEvent) {
    e.preventDefault()
    if (!newTab.nama||!newTab.target) { toast.error('Isi nama dan target'); return }
    try {
      const res = await fetch('/api/tabungan', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...newTab, target: Number(newTab.target), terkumpul: Number(newTab.terkumpul)||0 }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const item: Tabungan = await res.json()
      setTabList(p=>[...p, item])
      setNewTab({ nama:'', deskripsi:'', target:'', terkumpul:'', warna:'green' })
      setShowAdd(false); toast.success('Target tabungan ditambahkan')
    } catch(e:unknown){ toast.error((e as Error).message) }
  }

  async function saveEditTab(e: React.FormEvent) {
    e.preventDefault()
    if (!editTab) return
    try {
      const res = await fetch(`/api/tabungan/${editTab.id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(editTab),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated: Tabungan = await res.json()
      setTabList(p=>p.map(x=>x.id===updated.id?updated:x))
      setEditTab(null); toast.success('Perubahan disimpan')
    } catch(e:unknown){ toast.error((e as Error).message) }
  }

  async function deleteTabungan(id: string) {
    if (!confirm('Hapus target tabungan ini?')) return
    try {
      const res = await fetch(`/api/tabungan/${id}`, { method:'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setTabList(p=>p.filter(x=>x.id!==id)); toast.success('Target dihapus')
    } catch(e:unknown){ toast.error((e as Error).message) }
  }

  const pen  = penBulan
  const inv  = invBulan
  const batas = target?.batas_keluar ?? 0
  const tInv  = target?.target_invest ?? 0
  const pend  = target?.pendapatan ?? 0

  function ProgBar({ label, val, max, color, note }: { label:string; val:number; max:number; color:Warna; note?:string }) {
    const pct = max > 0 ? Math.min(100, Math.round(val/max*100)) : 0
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium">{label}</span>
          <span className="font-mono text-xs text-white/40">{fmt(val)} / {fmt(max)}</span>
        </div>
        <div className="prog-track">
          <div className={`prog-fill ${FILL_CLS[color]}`} style={{width:`${pct}%`}}/>
        </div>
        {note && <div className="text-xs mt-1 text-fin-amber">{note}</div>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Target form */}
      <div className="card p-6">
        <div className="text-sm font-semibold mb-4">⚙️ Atur Target Bulanan</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            ['Pendapatan (Rp)','pendapatan'],
            ['Batas Pengeluaran (Rp)','batas_keluar'],
            ['Target Investasi (Rp)','target_invest'],
            ['Target Tabungan (Rp)','target_tabung'],
          ] as [string,keyof typeof tForm][]).map(([label,key])=>(
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</label>
              <input type="number" className="fin-input" min="0"
                value={tForm[key]} onChange={e=>setTForm(f=>({...f,[key]:e.target.value}))} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={saveTarget} className="btn-primary" disabled={saving}>
            {saving?<span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/>:<Save size={14}/>}
            Simpan Target
          </button>
        </div>
      </div>

      {/* Progress */}
      {target && (
        <div className="card p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Progress Bulan Ini</div>
          <ProgBar label="Pengeluaran vs Anggaran" val={pen} max={batas} color={pen>batas&&batas>0?'red':'green'}
            note={batas>0&&pen/batas>=0.8&&pen<batas?`⚠️ ${Math.round(pen/batas*100)}% terpakai`:undefined} />
          <ProgBar label="Investasi vs Target" val={inv} max={tInv} color="blue" />
          <ProgBar label="Saldo vs Pendapatan" val={Math.max(0,pend-pen)} max={pend} color="purple" />
        </div>
      )}

      {/* Tabungan jangka panjang */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">🏦 Target Tabungan Jangka Panjang</div>
          <button onClick={()=>setShowAdd(s=>!s)} className="btn-secondary text-xs px-3 py-1.5">
            <Plus size={13}/> Tambah
          </button>
        </div>

        {showAdd && (
          <form onSubmit={addTabungan} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 p-4 bg-bg-4 rounded-xl border border-white/[0.07]">
            {[
              ['Nama Target','text','nama',newTab.nama,'Dana Darurat'],
              ['Jumlah Target (Rp)','number','target',newTab.target,'30000000'],
              ['Sudah Terkumpul (Rp)','number','terkumpul',newTab.terkumpul,'0'],
            ].map(([label,type,key,val,ph])=>(
              <div key={key as string} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</label>
                <input type={type as string} className="fin-input" placeholder={ph as string} value={val as string}
                  onChange={e=>setNewTab(f=>({...f,[key as string]:e.target.value}))} required={key==='nama'||key==='target'} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Deskripsi</label>
              <input type="text" className="fin-input" placeholder="opsional" value={newTab.deskripsi} onChange={e=>setNewTab(f=>({...f,deskripsi:e.target.value}))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Warna</label>
              <select className="fin-select" value={newTab.warna} onChange={e=>setNewTab(f=>({...f,warna:e.target.value as Warna}))}>
                {WARNAS.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-3 flex gap-2">
              <button type="submit" className="btn-primary text-sm"><Plus size={13}/> Tambah</button>
              <button type="button" onClick={()=>setShowAdd(false)} className="btn-secondary text-sm">Batal</button>
            </div>
          </form>
        )}

        {tabList.length === 0 && <div className="text-white/20 text-sm text-center py-6">Belum ada target tabungan</div>}

        <div className="flex flex-col gap-5">
          {tabList.map(t => {
            const pct = t.target > 0 ? Math.min(100, Math.round(t.terkumpul / t.target * 100)) : 0
            const sisa = Math.max(0, t.target - t.terkumpul)
            return editTab?.id === t.id ? (
              <form key={t.id} onSubmit={saveEditTab} className="p-4 bg-bg-4 rounded-xl border border-white/[0.07] grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Nama</label>
                  <input type="text" className="fin-input" value={editTab.nama} onChange={e=>setEditTab(v=>v?{...v,nama:e.target.value}:v)} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Target (Rp)</label>
                  <input type="number" className="fin-input" value={editTab.target} onChange={e=>setEditTab(v=>v?{...v,target:Number(e.target.value)}:v)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Terkumpul (Rp)</label>
                  <input type="number" className="fin-input" value={editTab.terkumpul} onChange={e=>setEditTab(v=>v?{...v,terkumpul:Number(e.target.value)}:v)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Deskripsi</label>
                  <input type="text" className="fin-input" value={editTab.deskripsi??''} onChange={e=>setEditTab(v=>v?{...v,deskripsi:e.target.value}:v)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Warna</label>
                  <select className="fin-select" value={editTab.warna} onChange={e=>setEditTab(v=>v?{...v,warna:e.target.value as Warna}:v)}>
                    {WARNAS.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-3 flex gap-2 mt-1">
                  <button type="submit" className="btn-primary text-sm"><Check size={13}/> Simpan</button>
                  <button type="button" onClick={()=>setEditTab(null)} className="btn-secondary text-sm"><X size={13}/> Batal</button>
                </div>
              </form>
            ) : (
              <div key={t.id}>
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <span className="text-sm font-semibold">{t.nama}</span>
                    {t.deskripsi && <div className="text-xs text-white/30 mt-0.5">{t.deskripsi}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white/40">{fmt(t.terkumpul)} / {fmt(t.target)} · {pct}%</span>
                    <button onClick={()=>setEditTab(t)} className="btn-edit"><Pencil size={11}/></button>
                    <button onClick={()=>deleteTabungan(t.id)} className="btn-danger"><Trash2 size={11}/></button>
                  </div>
                </div>
                <div className="prog-track">
                  <div className={`prog-fill ${FILL_CLS[t.warna]}`} style={{width:`${pct}%`}}/>
                </div>
                <div className="text-xs text-white/30 mt-1">
                  {sisa > 0 ? `Kurang: ${fmt(sisa)}` : '🎉 Target tercapai!'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
