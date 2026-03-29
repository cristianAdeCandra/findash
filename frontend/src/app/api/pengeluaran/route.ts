// ============================================================
// app/api/pengeluaran/route.ts  — GET + POST
// app/api/pengeluaran/[id]/route.ts — PUT + DELETE
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// GET /api/pengeluaran?bulan=2024-06&kategori=Makanan
export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const bulan    = searchParams.get('bulan')
  const kategori = searchParams.get('kategori')

  let q = supabase
    .from('pengeluaran')
    .select('*')
    .eq('user_id', user.id)
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })

  if (bulan)    q = q.gte('tanggal', bulan + '-01').lte('tanggal', bulan + '-31')
  if (kategori) q = q.eq('kategori', kategori)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/pengeluaran
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { tanggal, jumlah, kategori, keterangan } = body

  if (!tanggal || !jumlah || !kategori) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pengeluaran')
    .insert({ user_id: user.id, tanggal, jumlah, kategori, keterangan })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
