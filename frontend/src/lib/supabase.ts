// ============================================================
// lib/supabase.ts — Supabase client helpers
// ============================================================
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Use in Client Components */
export function createClient() {
  return createBrowserClient(URL, ANON)
}

/** Use in Server Components / Route Handlers */
export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(URL, ANON, {
    cookies: {
      get(name)         { return cookieStore.get(name)?.value },
      set(name, value, options) {
        try { cookieStore.set({ name, value, ...options }) } catch {}
      },
      remove(name, options) {
        try { cookieStore.set({ name, value: '', ...options }) } catch {}
      },
    },
  })
}
