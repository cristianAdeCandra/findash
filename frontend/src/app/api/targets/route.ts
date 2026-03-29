// ── TARGETS ──────────────────────────────────────────────────
// GET/POST /api/targets?bulan=2024-06
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bulan = req.nextUrl.searchParams.get('bulan') ?? new Date().toISOString().slice(0, 7)

  const { data, error } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', user.id)
    .eq('bulan', bulan)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { bulan, pendapatan, batas_keluar, target_invest, target_tabung } = body

  const { data, error } = await supabase
    .from('targets')
    .upsert(
      { user_id: user.id, bulan, pendapatan, batas_keluar, target_invest, target_tabung },
      { onConflict: 'user_id,bulan' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
