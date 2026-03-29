import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tabungan').select('*').eq('user_id', user.id).order('urutan')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { nama, deskripsi, target, terkumpul, warna } = body
  if (!nama || !target) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabase
    .from('tabungan')
    .insert({ user_id: user.id, nama, deskripsi, target, terkumpul: terkumpul ?? 0, warna: warna ?? 'green' })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
