'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Pengeluaran, Kategori } from '@/types'
import { fmt, MONTHS_FULL, KAT_COLOR, todayStr } from '@/lib/utils'

const KATEGORIS: Kategori[] = [
  'Makanan & Minuman','Transportasi','Belanja','Kesehatan',
  'Hiburan','Tagihan & Utilitas','Pendidikan','Lainnya',
]

const EMPTY = { tanggal: todayStr(), jumlah: '', kategori: 'Makanan & Minuman' as Kategori, keterangan: '' }

export default function PengeluaranClient({ initialData }: { initialData: Pengeluaran[] }) {
  const [list, setList]         = useState(initialData)
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState<Pengeluaran | null>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [fBulan, setFBulan]     = useState('')
  const [fKat, setFKat]         = useState('')

  // Month options from data
  const months = useMemo(() => {
    const set = new Set(list.map(x => x.tanggal.slice(0,7)))
    return [...set].sort().reverse()
  }, [list])

  const filtered = useMemo(() =>
    list.filter(x => {
      if (fBulan && !x.tanggal.startsWith(fBulan)) return false
      if (fKat   && x.kategori !== fKat) return false
      return true
    }), [list, fBulan, fKat])

  const total = filtered.reduce((s, x) => s + x.jumlah, 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.jumlah || Number(form.jumlah) <= 0) { toast.error('Jumlah tidak valid'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jumlah: Number(form.jumlah) }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const newItem: Pengeluaran = await res.json()
      setList(prev => [newItem, ...prev].sort((a,b) => b.tanggal.localeCompare(a.tanggal)))
      setForm(EMPTY)
      toast.success('Pengeluaran berhasil disimpan')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally { setSaving(false) }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/pengeluaran/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal: editing.tanggal, jumlah: editing.jumlah, kategori: editing.kategori, keterangan: editing.keterangan }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated: Pengeluaran = await res.json()
      setList(prev => prev.map(x => x.id === updated.id ? updated : x))
      setEditing(null)
      toast.success('Perubahan disimpan')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data ini?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/pengeluaran/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setList(prev => prev.filter(x => x.id !== id))
      toast.success('Data dihapus')
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally { setDeleting(null) }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Add form */}
      <div className="card p-6">
        <div className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus size={15} className="text-accent-2" /> Tambah Pengeluaran
        </div>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tanggal</label>
            <input type="date" className="fin-input" value={form.tanggal} onChange={e => setForm(f => ({...f, tanggal: e.target.value}))} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Jumlah (Rp)</label>
            <input type="number" className="fin-input" placeholder="150000" min="0"
              value={form.jumlah} onChange={e => setForm(f => ({...f, jumlah: e.target.value}))} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Kategori</label>
            <select className="fin-select" value={form.kategori} onChange={e => setForm(f => ({...f, kategori: e.target.value as Kategori}))}>
              {KATEGORIS.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Keterangan</label>
            <input type="text" className="fin-input" placeholder="Makan siang"
              value={form.keterangan} onChange={e => setForm(f => ({...f, keterangan: e.target.value}))} />
          </div>
          <div className="col-span-2 sm:col-span-4 mt-1">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : <Plus size={14}/>}
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* Filters + table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.07] flex-wrap gap-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Riwayat</div>
          <div className="flex items-center gap-2 flex-wrap">
            <select className="fin-select !py-1.5 !text-xs" value={fBulan} onChange={e => setFBulan(e.target.value)}>
              <option value="">Semua Bulan</option>
              {months.map(m => {
                const [y,mo] = m.split('-')
                return <option key={m} value={m}>{MONTHS_FULL[parseInt(mo)-1]} {y}</option>
              })}
            </select>
            <select className="fin-select !py-1.5 !text-xs" value={fKat} onChange={e => setFKat(e.target.value)}>
              <option value="">Semua Kategori</option>
              {KATEGORIS.map(k => <option key={k}>{k}</option>)}
            </select>
            <span className="font-mono text-xs text-white/40">Total: {fmt(total)}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fin-table">
            <thead><tr>
              <th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-white/20 py-10">Belum ada data</td></tr>
              )}
              {filtered.map(x => (
                <tr key={x.id}>
                  {editing?.id === x.id ? (
                    <>
                      <td><input type="date" className="fin-input !py-1 !text-xs" value={editing.tanggal} onChange={e=>setEditing(v=>v?{...v,tanggal:e.target.value}:v)} /></td>
                      <td><input type="text" className="fin-input !py-1 !text-xs" value={editing.keterangan??''} onChange={e=>setEditing(v=>v?{...v,keterangan:e.target.value}:v)} /></td>
                      <td>
                        <select className="fin-select !py-1 !text-xs" value={editing.kategori} onChange={e=>setEditing(v=>v?{...v,kategori:e.target.value as Kategori}:v)}>
                          {KATEGORIS.map(k=><option key={k}>{k}</option>)}
                        </select>
                      </td>
                      <td><input type="number" className="fin-input !py-1 !text-xs w-28" value={editing.jumlah} onChange={e=>setEditing(v=>v?{...v,jumlah:Number(e.target.value)}:v)} /></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={handleEdit} className="btn-edit" disabled={saving}><Check size={12}/></button>
                          <button onClick={()=>setEditing(null)} className="btn-danger"><X size={12}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="font-mono text-xs text-white/40">{x.tanggal}</td>
                      <td>{x.keterangan || <span className="text-white/20">—</span>}</td>
                      <td><span className={`badge ${KAT_COLOR[x.kategori]??'badge-green'}`}>{x.kategori}</span></td>
                      <td className="amt-neg">{fmt(x.jumlah)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={()=>setEditing(x)} className="btn-edit"><Pencil size={12}/></button>
                          <button onClick={()=>handleDelete(x.id)} disabled={deleting===x.id} className="btn-danger">
                            {deleting===x.id ? <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"/> : <Trash2 size={12}/>}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
