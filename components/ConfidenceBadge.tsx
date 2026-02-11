'use client'

interface ConfidenceBadgeProps {
  confidence: number
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const getConfidenceLevel = (): { label: string; color: 'emerald' | 'amber' | 'red' } => {
    if (confidence >= 0.85) return { label: 'High', color: 'emerald' }
    if (confidence >= 0.6) return { label: 'Medium', color: 'amber' }
    return { label: 'Low', color: 'red' }
  }

  const level = getConfidenceLevel()
  const percentage = Math.round(confidence * 100)

  const colorClasses: Record<'emerald' | 'amber' | 'red', string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
        colorClasses[level.color]
      }`}
      title={`${percentage}% confidence`}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
      {level.label} ({percentage}%)
    </span>
  )
}
