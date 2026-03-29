type Color = 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'accent'

const colorMap: Record<Color, string> = {
  green:  'text-fin-green',
  red:    'text-fin-red',
  blue:   'text-fin-blue',
  amber:  'text-fin-amber',
  purple: 'text-fin-purple',
  accent: 'text-accent-2',
}

export default function StatCard({
  label, value, color = 'green', sub,
}: { label: string; value: string; color?: Color; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${colorMap[color]}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
