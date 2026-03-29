import { createServerSupabase } from '@/lib/supabase'
import { Tabungan } from '@/types'
import { redirect } from 'next/navigation'

// Tabungan has its own section inside /dashboard/target
// This page redirects there for clean URL structure
export default async function TabunganPage() {
  redirect('/dashboard/target')
}
