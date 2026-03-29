import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getPrice } from '@/lib/prices'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { tanggal, jenis, nama, kode_ticker, platform, modal, harga_beli, qty, harga_sekarang, catatan } = body

  const updates: Record<string, unknown> = { tanggal, jenis, nama, kode_ticker, platform, modal, harga_beli, qty, catatan }
  if (harga_sekarang != null) {
    updates.harga_sekarang  = harga_sekarang
    updates.tgl_update_harga = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('investasi')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('investasi')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// PATCH /api/investasi/[id] — refresh real-time price
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get current item
  const { data: item } = await supabase
    .from('investasi')
    .select('kode_ticker, jenis')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!item?.kode_ticker) {
    return NextResponse.json({ error: 'Kode ticker belum diisi' }, { status: 400 })
  }

  const price = await getPrice(item.kode_ticker, item.jenis)
  if (!price) {
    return NextResponse.json({ error: 'Harga tidak ditemukan untuk ticker ini' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('investasi')
    .update({
      harga_sekarang: price.harga_idr,
      tgl_update_harga: new Date().toISOString().split('T')[0],
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, price_data: price })
}
