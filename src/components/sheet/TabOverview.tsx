import type { Character } from '@/types'
import type { CalculatedStats } from '@/types'

interface Props {
  character?: Character
  stats: CalculatedStats
}

export default function TabOverview({ stats }: Props) {
  if (stats.totalLevel === 0) {
    return (
      <p className="text-sm text-ink-muted font-sans italic text-center py-8">
        This character has no class or level assigned yet.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted font-sans italic text-center py-4">
        Core stats are displayed in the header above.
      </p>
    </div>
  )
}
