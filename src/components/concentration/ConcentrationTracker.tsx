import { useSpellStore } from '@/store/spellStore'
import { Button } from '../ui/Button'

interface ConcentrationTrackerProps {
  characterId: string
  spellId: string | null
}

export function ConcentrationTracker({ characterId, spellId }: ConcentrationTrackerProps) {
  const endConcentration = useSpellStore(s => s.endConcentration)
  const spells = useSpellStore(s => s.spells)
  const spell = spellId ? spells.find(s => s.id === spellId) : null

  if (!spell) {
    return (
      <div className="bg-parchment-50 rounded-xl border border-parchment-400 p-5 shadow-md">
        <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest mb-2">Concentration</h2>
        <p className="text-ink-muted text-sm">Not concentrating on any spell.</p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50/50 rounded-xl border border-yellow-500 p-5 shadow-md">
      <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest mb-3">Concentration Active</h2>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-ink font-semibold">{spell.name}</p>
          <p className="text-xs text-ink-muted">{spell.duration}</p>
        </div>
        <Button variant="danger" size="sm" onClick={() => endConcentration(characterId)}>End</Button>
      </div>
    </div>
  )
}
