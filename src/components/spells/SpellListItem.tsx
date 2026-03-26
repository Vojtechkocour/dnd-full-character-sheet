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
}

export function SpellListItem({ spell, character, onRemove }: SpellListItemProps) {
  const navigate = useNavigate()
  const useSlot = useSpellStore(s => s.useSlot)
  const startConcentration = useSpellStore(s => s.startConcentration)
  const [showCastModal, setShowCastModal] = useState(false)

  function handleCast() {
    if (spell.level === 0) {
      if (spell.concentration) startConcentration(character.id, spell.id)
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
          </div>
          <p className="text-xs text-ink-muted">{levelLabel} &bull; {SPELL_SCHOOL_LABELS[spell.school]} &bull; {spell.castingTime}</p>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="secondary" onClick={handleCast} title="Cast">&#x25B6;</Button>
          <button onClick={onRemove} className="text-ink-muted/40 hover:text-accent-red transition-colors px-1" aria-label="Remove from prepared">&#x2715;</button>
        </div>
      </div>

      <CastSpellModal spell={spell} character={character} open={showCastModal} onClose={() => setShowCastModal(false)} onCast={handleConfirmCast} />
    </>
  )
}
