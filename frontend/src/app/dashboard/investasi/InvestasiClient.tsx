'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, RefreshCw, X, Check, TrendingUp, TrendingDown } from 'lucide-react'
import { Investasi, Jenis } from '@/types'
import { fmt, fmtShort, fmtPct, MONTHS_FULL, INV_COLOR, todayStr, calcPL } from '@/lib/utils'

const JENISARR: Jenis[] = ['Saham','Reksa Dana','Obligasi','Emas','Kripto','Deposito','Properti','Lainnya']
const EMPTY_FORM = {
  tanggal: todayStr(), jenis: 'Saham' as Jenis, nama: '', kode_ticker: '',
  platform: '', modal: '', harga_beli: '', qty: '', catatan: '',
}

interface Props { initialData: Investasi[] }

export default function InvestasiClient({ initialData }: Props) {
  const [list, setList]         = useState(initialData)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [editing, setEditing]   = useState<Investasi | null>(null)
  const [refreshing, setRef]    = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [fBulan, setFBulan]     = useState('')
  const [fJenis, setFJenis]     = useState('')
  const [showForm, setShowForm] = useState(false)

  const months = useMemo(() => [...new Set(list.map(x=>x.tanggal.slice(0,7)))].sort().reverse(), [list])
  const filtered = useMemo(() => list.filter(x => {
    if (fBulan && !x.tanggal.startsWith(fBulan)) return false
    if (fJenis && x.jenis !== fJenis) return false
    return true
  }), [list, fBulan, fJenis])

  const totalModal = filtered.reduce((s,x)=>s+x.modal,0)
  const totalNilai = filtered.reduce((s,x)=>s+calcPL(x).nilai_sekarang,0)
  const totalPL    = totalNilai - totalModal

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.modal || Number(form.modal)<=0) { toast.error('Modal tidak valid'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/investasi', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          ...form, modal: Number(form.modal),
          harga_beli: form.harga_beli ? Number(form.harga_beli) : null,
          qty: form.qty ? Number(form.qty) : null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const newItem: Investasi = await res.json()
      setList(prev=>[newItem,...prev].sort((a,b)=>b.tanggal.localeCompare(a.tanggal)))
      setForm(EMPTY_FORM); setShowForm(false)
      toast.success('Investasi berhasil disimpan')
    } catch(e:unknown){ toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/investasi/${editing.id}`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(editing),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated: Investasi = await res.json()
      setList(prev=>prev.map(x=>x.id===updated.id?updated:x))
      setEditing(null); toast.success('Perubahan disimpan')
    } catch(e:unknown){ toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data investasi ini?')) return
    try {
      const res = await fetch(`/api/investasi/${id}`, { method:'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setList(prev=>prev.filter(x=>x.id!==id)); toast.success('Data dihapus')
    } catch(e:unknown){ toast.error((e as Error).message) }
  }

  async function refreshPrice(id: string) {
    setRef(id)
    try {
      const res = await fetch(`/api/investasi/${id}`, { method:'PATCH' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Gagal ambil harga')
        return
      }
      const updated: Investasi = await res.json()
      setList(prev=>prev.map(x=>x.id===updated.id?updated:x))
      toast.success('Harga berhasil diperbarui!')
    } catch(e:unknown){ toast.error((e as Error).message) }
    finally { setRef(null) }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-fin-amber/8 border border-fin-amber/20 rounded-xl p-4 text-sm text-fin-amber">
        <span className="flex-shrink-0 mt-0.5">💡</span>
        <span>Isi <strong>Kode Ticker</strong> (contoh: BBCA, BTC, ETH) lalu klik tombol <strong>↻ Refresh Harga</strong> untuk mengambil harga pasar real-time otomatis.</span>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card"><div className="stat-label">Total Modal</div><div className="stat-value text-fin-blue">{fmtShort(totalModal)}</div></div>
        <div className="stat-card"><div className="stat-label">Nilai Sekarang</div><div className="stat-value text-accent-2">{fmtShort(totalNilai)}</div></div>
        <div className="stat-card">
          <div className="stat-label">Profit / Loss</div>
          <div className={`stat-value ${totalPL>=0?'text-fin-green':'text-fin-red'}`}>
            {(totalPL>=0?'+':'')+fmtShort(totalPL)}
          </div>
        </div>
      </div>

      {/* Add form toggle */}
      <button onClick={()=>setShowForm(s=>!s)} className="btn-primary w-fit">
        <Plus size={14}/> {showForm ? 'Tutup Form' : 'Tambah Investasi'}
      </button>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Tanggal','date','tanggal',form.tanggal],
              ['Nama Aset','text','nama',form.nama,'contoh: BRI, Bitcoin'],
              ['Kode Ticker','text','kode_ticker',form.kode_ticker,'contoh: BBRI, BTC'],
              ['Platform','text','platform',form.platform,'Bibit, Stockbit'],
              ['Total Modal (Rp)','number','modal',form.modal,'1000000'],
              ['Harga Beli / Unit','number','harga_beli',form.harga_beli,'contoh: 5000'],
              ['Jumlah Unit/Lot','number','qty',form.qty,'contoh: 10'],
            ].map(([label,type,key,val,ph=''])=>(
              <div key={key as string} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</label>
                <input type={type as string} className="fin-input" placeholder={ph as string} value={val as string}
                  onChange={e=>setForm(f=>({...f,[key as string]:e.target.value}))} required={key==='modal'||key==='nama'} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Jenis</label>
              <select className="fin-select" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value as Jenis}))}>
                {JENISARR.map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-4 mt-1">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving&&<span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/>}
                <Plus size={14}/> Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.07] flex-wrap gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Portofolio</div>
          <div className="flex gap-2 flex-wrap items-center">
            <select className="fin-select !py-1.5 !text-xs" value={fBulan} onChange={e=>setFBulan(e.target.value)}>
              <option value="">Semua Bulan</option>
              {months.map(m=>{const[y,mo]=m.split('-');return<option key={m} value={m}>{MONTHS_FULL[parseInt(mo)-1]} {y}</option>})}
            </select>
            <select className="fin-select !py-1.5 !text-xs" value={fJenis} onChange={e=>setFJenis(e.target.value)}>
              <option value="">Semua Jenis</option>
              {JENISARR.map(j=><option key={j}>{j}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fin-table">
            <thead><tr>
              <th>Tanggal</th><th>Nama</th><th>Jenis</th><th>Ticker</th>
              <th>Modal</th><th>Harga Beli</th><th>Harga Pasar</th><th>P/L</th><th>Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={9} className="text-center text-white/20 py-10">Belum ada data</td></tr>}
              {filtered.map(x=>{
                const{nilai_sekarang,pl,pl_pct}=calcPL(x)
                return editing?.id===x.id ? (
                  <tr key={x.id}>
                    <td><input type="date" className="fin-input !py-1 !text-xs" value={editing.tanggal} onChange={e=>setEditing(v=>v?{...v,tanggal:e.target.value}:v)}/></td>
                    <td><input type="text" className="fin-input !py-1 !text-xs w-24" value={editing.nama} onChange={e=>setEditing(v=>v?{...v,nama:e.target.value}:v)}/></td>
                    <td><select className="fin-select !py-1 !text-xs" value={editing.jenis} onChange={e=>setEditing(v=>v?{...v,jenis:e.target.value as Jenis}:v)}>{JENISARR.map(j=><option key={j}>{j}</option>)}</select></td>
                    <td><input type="text" className="fin-input !py-1 !text-xs w-20" value={editing.kode_ticker??''} onChange={e=>setEditing(v=>v?{...v,kode_ticker:e.target.value}:v)}/></td>
                    <td><input type="number" className="fin-input !py-1 !text-xs w-28" value={editing.modal} onChange={e=>setEditing(v=>v?{...v,modal:Number(e.target.value)}:v)}/></td>
                    <td><input type="number" className="fin-input !py-1 !text-xs w-28" value={editing.harga_beli??''} onChange={e=>setEditing(v=>v?{...v,harga_beli:Number(e.target.value)||null}:v)}/></td>
                    <td><input type="number" className="fin-input !py-1 !text-xs w-28" value={editing.harga_sekarang??''} onChange={e=>setEditing(v=>v?{...v,harga_sekarang:Number(e.target.value)||null}:v)}/></td>
                    <td>—</td>
                    <td><div className="flex gap-1">
                      <button onClick={handleEdit} className="btn-edit" disabled={saving}><Check size={12}/></button>
                      <button onClick={()=>setEditing(null)} className="btn-danger"><X size={12}/></button>
                    </div></td>
                  </tr>
                ) : (
                  <tr key={x.id}>
                    <td className="font-mono text-xs text-white/40">{x.tanggal}</td>
                    <td className="font-semibold">{x.nama}</td>
                    <td><span className={`badge ${INV_COLOR[x.jenis]??'badge-blue'}`}>{x.jenis}</span></td>
                    <td className="font-mono text-xs text-white/50">{x.kode_ticker||'—'}</td>
                    <td className="amt-neu">{fmt(x.modal)}</td>
                    <td className="font-mono text-xs text-white/40">{x.harga_beli?fmt(x.harga_beli):'—'}</td>
                    <td>
                      {x.harga_sekarang
                        ? <div><div className="font-mono text-xs text-white/70">{fmt(x.harga_sekarang)}</div>
                            <div className="font-mono text-[10px] text-white/30">upd: {x.tgl_update_harga}</div></div>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td>
                      {pl!==null
                        ? <div className={`flex items-center gap-1 ${pl>=0?'text-fin-green':'text-fin-red'} font-mono text-xs font-semibold`}>
                            {pl>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                            <div><div>{(pl>=0?'+':'')+fmtShort(pl)}</div><div className="text-[10px]">{fmtPct(pl_pct)}</div></div>
                          </div>
                        : <span className="text-white/20 text-xs">Isi harga</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {x.kode_ticker&&(
                          <button onClick={()=>refreshPrice(x.id)} disabled={refreshing===x.id}
                            className="btn-edit" title="Refresh harga real-time">
                            <RefreshCw size={11} className={refreshing===x.id?'animate-spin':''}/>
                          </button>
                        )}
                        <button onClick={()=>setEditing(x)} className="btn-edit"><Pencil size={11}/></button>
                        <button onClick={()=>handleDelete(x.id)} className="btn-danger"><Trash2 size={11}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
