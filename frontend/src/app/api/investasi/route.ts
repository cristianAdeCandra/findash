import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const bulan = searchParams.get('bulan')
  const jenis = searchParams.get('jenis')

  let q = supabase
    .from('investasi')
    .select('*')
    .eq('user_id', user.id)
    .order('tanggal', { ascending: false })

  if (bulan) q = q.gte('tanggal', bulan + '-01').lte('tanggal', bulan + '-31')
  if (jenis) q = q.eq('jenis', jenis)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { tanggal, jenis, nama, kode_ticker, platform, modal, harga_beli, qty, catatan } = body

  if (!tanggal || !jenis || !nama || !modal) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('investasi')
    .insert({ user_id: user.id, tanggal, jenis, nama, kode_ticker, platform, modal, harga_beli, qty, catatan })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
