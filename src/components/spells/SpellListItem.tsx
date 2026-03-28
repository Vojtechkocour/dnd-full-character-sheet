import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Spell, SpellCharacter } from '@/store/spellStore'
import { SPELL_SCHOOL_LABELS } from '@/store/spellStore'
import type { SpellLevel } from '@/utils/spellSlotTable'
import { Button } from '../ui/Button'
import { useSpellStore } from '@/store/spellStore'
import { CastSpellModal } from './CastSpellModal'

interface SpellListItemProps {
  spell: Spell
  character: SpellCharacter
  onRemove: () => void
  isOriginSpell?: boolean
  originSpellUses?: Record<string, number>
  onOriginCast?: (spellId: string) => void
}

export function SpellListItem({ spell, character, onRemove, isOriginSpell, originSpellUses, onOriginCast }: SpellListItemProps) {
  const navigate = useNavigate()
  const useSlot = useSpellStore(s => s.useSlot)
  const startConcentration = useSpellStore(s => s.startConcentration)
  const [showCastModal, setShowCastModal] = useState(false)

  const isOriginLeveled = isOriginSpell && spell.level > 0
  const originUsesLeft = isOriginLeveled ? (originSpellUses?.[spell.id] ?? 0) : null
  const originExhausted = isOriginLeveled && originUsesLeft === 0

  function handleCast() {
    if (spell.level === 0) {
      if (spell.concentration) startConcentration(character.id, spell.id)
      return
    }
    // Origin leveled spell: 1/long rest, no slot needed
    if (isOriginLeveled) {
      if (originUsesLeft && originUsesLeft > 0) {
        onOriginCast?.(spell.id)
        if (spell.concentration) startConcentration(character.id, spell.id)
      }
      return
    }
    setShowCastModal(true)
  }

  function handleConfirmCast(slotLevel: SpellLevel) {
    useSlot(character.id, slotLevel)
    if (spell.concentration) startConcentration(character.id, spell.id)
  }

  const levelLabel = spell.level === 0 ? 'Cantrip' : `Lv ${spell.level}`

  return (
    <>
      <div className="flex items-center gap-3 py-2.5 px-2 -mx-2 border-b border-parchment-300 last:border-0 rounded hover:bg-parchment-200/50 transition-colors">
        <button onClick={() => navigate(`/spells/${spell.id}`)} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-ink font-medium truncate">{spell.name}</span>
            {spell.concentration && <span className="shrink-0 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-300">C</span>}
            {spell.ritual && <span className="shrink-0 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-300">R</span>}
            {isOriginSpell && <span className="shrink-0 text-xs bg-accent-gold/10 text-accent-gold px-1.5 py-0.5 rounded border border-accent-gold/40">Origin</span>}
          </div>
          <p className="text-xs text-ink-muted">{levelLabel} &bull; {SPELL_SCHOOL_LABELS[spell.school]} &bull; {spell.castingTime}</p>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Uses badge for origin leveled spells */}
          {isOriginLeveled && (
            <span className={`text-xs px-1.5 py-0.5 rounded border ${originUsesLeft! > 0 ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-50 text-accent-red border-red-200'}`}
              title={originUsesLeft! > 0 ? '1/Long Rest available' : 'Used — Long Rest needed'}>
              {originUsesLeft}/1
            </span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCast}
            disabled={originExhausted}
            title={originExhausted ? 'Long Rest needed' : 'Cast'}
          >
            &#x25B6;
          </Button>
          {!isOriginSpell && (
            <button onClick={onRemove} className="text-ink-muted/40 hover:text-accent-red transition-colors px-1" aria-label="Remove from prepared">&#x2715;</button>
          )}
        </div>
      </div>

      {!isOriginLeveled && (
        <CastSpellModal spell={spell} character={character} open={showCastModal} onClose={() => setShowCastModal(false)} onCast={handleConfirmCast} />
      )}
    </>
  )
}
