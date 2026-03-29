import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'

export default async function RootPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  redirect('/auth')
}
