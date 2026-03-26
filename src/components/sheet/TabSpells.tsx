import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import type { Character } from '@/types'
import { useSpellStore } from '@/store/spellStore'
import type { CharacterClass } from '@/types'
import { isCaster } from '@/utils/spellSlotTable'
import { SpellSlotTracker } from '@/components/slots/SpellSlotTracker'
import { ConcentrationTracker } from '@/components/concentration/ConcentrationTracker'
import { ConcentrationWarning } from '@/components/concentration/ConcentrationWarning'
import { SpellListItem } from '@/components/spells/SpellListItem'
import { Button } from '@/components/ui/Button'

interface Props {
  character: Character
}

export default function TabSpells({ character }: Props) {
  const navigate = useNavigate()
  const ensureSpellCharacter = useSpellStore(s => s.ensureSpellCharacter)
  const setActiveSpellCharacter = useSpellStore(s => s.setActiveSpellCharacter)
  const spellCharacter = useSpellStore(s => s.spellCharacters.find(c => c.id === character.id))
  const spells = useSpellStore(s => s.spells)
  const removePreparedSpell = useSpellStore(s => s.removePreparedSpell)

  const primaryClass = character.classes[0]
  const cls = primaryClass?.class as CharacterClass | undefined
  const level = primaryClass?.level ?? 0

  // Sync character data to spell store
  useEffect(() => {
    if (!cls || !isCaster(cls)) return
    ensureSpellCharacter(character.id, character.name, cls, level)
    setActiveSpellCharacter(character.id)
  }, [character.id, character.name, cls, level])

  if (!cls || !isCaster(cls)) {
    return (
      <div className="text-center py-12 text-ink-muted">
        <p className="font-serif italic">This class does not have spellcasting.</p>
      </div>
    )
  }

  if (!spellCharacter) {
    return (
      <div className="text-center py-12 text-ink-muted">
        <p className="font-serif italic">Loading spell data...</p>
      </div>
    )
  }

  const preparedSpells = spellCharacter.preparedSpellIds
    .map(id => spells.find(s => s.id === id))
    .filter(Boolean) as typeof spells

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <SpellSlotTracker character={spellCharacter} />
          <ConcentrationTracker characterId={spellCharacter.id} spellId={spellCharacter.concentratingOnSpellId} />
        </div>

        {/* Right column — Prepared spells */}
        <div className="bg-parchment-50 rounded-xl border border-parchment-400 p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest">Prepared Spells</h2>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/library/${character.id}`)}>+ Add</Button>
          </div>

          {preparedSpells.length === 0 ? (
            <div className="text-center py-8 text-ink-muted/60">
              <p className="text-sm">No spells prepared.</p>
              <button onClick={() => navigate(`/library/${character.id}`)}
                className="text-accent-gold hover:text-accent-gold/80 text-sm mt-2 underline">Open Library</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const groups = new Map<number, typeof preparedSpells>()
                for (const spell of preparedSpells) {
                  if (!groups.has(spell.level)) groups.set(spell.level, [])
                  groups.get(spell.level)!.push(spell)
                }
                return Array.from(groups.entries()).sort(([a], [b]) => a - b).map(([level, group]) => (
                  <div key={level} className="rounded-xl overflow-hidden border border-parchment-400 shadow-md">
                    <div className={`px-3 py-2 flex items-center gap-2 ${level === 0 ? 'bg-parchment-200/80' : 'bg-parchment-300/70'} border-b border-parchment-300`}>
                      <span className="font-display text-accent-gold text-xs uppercase tracking-widest">
                        {level === 0 ? 'Cantrips' : `Level ${level}`}
                      </span>
                      <span className="text-xs text-ink-muted ml-auto">{group.length}</span>
                    </div>
                    <div className="px-3">
                      {group.map(spell => (
                        <SpellListItem key={spell.id} spell={spell} character={spellCharacter}
                          onRemove={() => removePreparedSpell(spellCharacter.id, spell.id)} />
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}
        </div>
      </div>

      <ConcentrationWarning characterId={spellCharacter.id} />
    </div>
  )
}
