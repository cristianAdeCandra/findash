'use client'
import { Profile } from '@/types'
import { MONTHS_FULL } from '@/lib/utils'
import { Bell } from 'lucide-react'

const now = new Date()

export default function TopBar({ profile }: { profile: Profile | null }) {
  const monthLabel = MONTHS_FULL[now.getMonth()] + ' ' + now.getFullYear()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between
                        px-6 py-3 bg-bg-2/80 backdrop-blur-sm border-b border-white/[0.07]">
      <span className="font-mono text-xs text-white/40 bg-bg-4 border border-white/10
                       px-3 py-1.5 rounded-full">
        {monthLabel}
      </span>

      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <Bell size={15} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center
                          text-xs font-bold text-accent-2">
            {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-sm text-white/60 hidden sm:block">
            {profile?.full_name ?? profile?.email ?? 'User'}
          </span>
        </div>
      </div>
    </header>
  )
}
