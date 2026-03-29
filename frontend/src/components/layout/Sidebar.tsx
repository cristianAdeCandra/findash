'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingDown, TrendingUp, Target, PiggyBank, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/pengeluaran', icon: TrendingDown,    label: 'Pengeluaran' },
  { href: '/dashboard/investasi',   icon: TrendingUp,      label: 'Investasi' },
  { href: '/dashboard/target',      icon: Target,          label: 'Target' },
  { href: '/dashboard/tabungan',    icon: PiggyBank,       label: 'Tabungan' },
]

export default function Sidebar() {
  const path     = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-bg-2 border-r border-white/[0.07] py-6 px-3 sticky top-0 h-screen">
      {/* Logo */}
      <div className="text-xl font-bold tracking-tight px-3 mb-8">
        Fin<span className="text-accent-2">Track</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? 'bg-accent text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button onClick={signOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   text-white/30 hover:text-fin-red hover:bg-fin-red/10 transition-all mt-4">
        <LogOut size={16} />
        Keluar
      </button>
    </aside>
  )
}
