// ============================================================
// app/api/prices/route.ts
// GET /api/prices?kode=BTC&jenis=kripto
// GET /api/prices?batch=BTC:kripto,BBCA:saham,XAU:emas
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPrice, getBatchPrices } from '@/lib/prices'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const batch = searchParams.get('batch')
  const kode  = searchParams.get('kode')
  const jenis = searchParams.get('jenis')

  // ── Batch mode: ?batch=BTC:kripto,BBCA:saham ──────────────
  if (batch) {
    const items = batch.split(',').map(s => {
      const [k, j] = s.split(':')
      return { kode: k, jenis: j ?? 'saham' }
    }).filter(x => x.kode)

    if (!items.length) {
      return NextResponse.json({ error: 'No items' }, { status: 400 })
    }

    const prices = await getBatchPrices(items)

    // Cache results in Supabase harga_cache
    try {
      const supabase = createServerSupabase()
      const upserts = Object.values(prices).map(p => ({
        kode: p.kode,
        nama: p.nama,
        jenis: items.find(x => x.kode === p.kode)?.jenis ?? 'saham',
        harga_idr: p.harga_idr,
        change_24h: p.change_24h,
        updated_at: p.updated_at,
      }))
      if (upserts.length) {
        await supabase.from('harga_cache').upsert(upserts, { onConflict: 'kode' })
      }
    } catch { /* non-critical */ }

    return NextResponse.json(prices, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  }

  // ── Single mode: ?kode=BTC&jenis=kripto ──────────────────
  if (!kode || !jenis) {
    return NextResponse.json({ error: 'kode and jenis required' }, { status: 400 })
  }

  const price = await getPrice(kode, jenis)
  if (!price) {
    return NextResponse.json({ error: 'Price not found', kode }, { status: 404 })
  }

  return NextResponse.json(price, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  })
}
