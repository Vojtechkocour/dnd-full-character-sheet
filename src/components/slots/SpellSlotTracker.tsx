import type { SpellCharacter } from '@/store/spellStore'
import { SlotLevelRow } from './SlotLevelRow'
import { SlotPip } from '../ui/SlotPip'
import { Button } from '../ui/Button'
import { useSpellStore } from '@/store/spellStore'
import { isWarlock } from '@/utils/spellSlotTable'

interface SpellSlotTrackerProps {
  character: SpellCharacter
}

export function SpellSlotTracker({ character }: SpellSlotTrackerProps) {
  const longRest = useSpellStore(s => s.longRest)
  const shortRest = useSpellStore(s => s.shortRest)
  const useSlot = useSpellStore(s => s.useSlot)
  const recoverSlot = useSpellStore(s => s.recoverSlot)

  const warlockMode = isWarlock(character.class)
  const slots = Object.values(character.spellSlots)
  const hasAnySlots = slots.some(s => s.total > 0) || (warlockMode && character.pactSlots)

  return (
    <div className="bg-parchment-50 rounded-xl border border-parchment-400 p-5 space-y-4 shadow-md">
      <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest">Spell Slots</h2>

      {!hasAnySlots && <p className="text-ink-muted text-sm">No slots available.</p>}

      {warlockMode && character.pactSlots && (
        <div className="space-y-1">
          <p className="text-xs text-ink-muted mb-2">Pact Magic (Lv {character.pactSlots.level})</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-muted w-10 shrink-0">Pact</span>
            <div className="flex items-center gap-1.5 flex-1">
              {Array.from({ length: character.pactSlots.total }, (_, i) => {
                const filled = i >= character.pactSlots!.total - character.pactSlots!.used
                return (
                  <SlotPip
                    key={i}
                    filled={filled}
                    onClick={() => {
                      if (filled) recoverSlot(character.id, character.pactSlots!.level)
                      else useSlot(character.id, character.pactSlots!.level)
                    }}
                  />
                )
              })}
            </div>
            <span className="text-xs text-ink-muted/60 w-8 text-right shrink-0">
              {character.pactSlots.total - character.pactSlots.used}/{character.pactSlots.total}
            </span>
          </div>
        </div>
      )}

      {!warlockMode && (
        <div className="space-y-2">
          {slots.map(slot => <SlotLevelRow key={slot.level} characterId={character.id} slot={slot} />)}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-parchment-300">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => longRest(character.id)} title="Restore all slots">
          Long Rest
        </Button>
        {warlockMode && (
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => shortRest(character.id)} title="Restore Pact Magic slots">
            Short Rest
          </Button>
        )}
      </div>
    </div>
  )
}
