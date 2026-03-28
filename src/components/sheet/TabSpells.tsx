import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import type { Character } from '@/types'
import { useSpellStore } from '@/store/spellStore'
import { useCharacterStore } from '@/store/characterStore'
import type { CharacterClass } from '@/types'
import { isCaster } from '@/utils/spellSlotTable'
import { getOriginSpellGrants, getActiveFixedSpellGrants } from '@/utils/originSpellGrants'
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
  const addPreparedSpell = useSpellStore(s => s.addPreparedSpell)
  const removePreparedSpell = useSpellStore(s => s.removePreparedSpell)
  const updateCharacter = useCharacterStore(s => s.updateCharacter)

  const primaryClass = character.classes[0]
  const cls = primaryClass?.class as CharacterClass | undefined
  const level = primaryClass?.level ?? 0

  const grants = getOriginSpellGrants(character, spells)
  const activeFixed = getActiveFixedSpellGrants(character, spells)
  const hasOriginGrants = grants.length > 0
  const hasFixed = activeFixed.length > 0
  const isSpellcaster = cls ? isCaster(cls) : false
  const unsatisfiedCount = grants.filter(g => !g.isSatisfied).length

  // All origin spell IDs (selectable + fixed)
  const allOriginSpellIds = new Set([
    ...character.originSpellChoices,
    ...activeFixed.map(g => g.spellId),
  ])

  // Check if any leveled origin spells are exhausted
  const hasExhaustedOriginSpells = [...allOriginSpellIds].some(id => {
    const spell = spells.find(s => s.id === id)
    return spell && spell.level > 0 && (character.originSpellUses[id] ?? 0) === 0
  })

  function handleOriginLongRest() {
    const newUses = { ...character.originSpellUses }
    for (const id of allOriginSpellIds) {
      const spell = spells.find(s => s.id === id)
      if (spell && spell.level > 0) newUses[id] = 1
    }
    updateCharacter(character.id, { originSpellUses: newUses })
  }

  // Sync character data to spell store
  useEffect(() => {
    if (!cls) return
    if (!isSpellcaster && !hasOriginGrants && !hasFixed) return
    ensureSpellCharacter(character.id, character.name, cls, level)
    setActiveSpellCharacter(character.id)
  }, [character.id, character.name, cls, level, isSpellcaster, hasOriginGrants, hasFixed])

  // Sync selectable origin choices into preparedSpellIds
  useEffect(() => {
    if (!spellCharacter) return
    for (const id of character.originSpellChoices) {
      addPreparedSpell(character.id, id)
    }
  }, [character.originSpellChoices, spellCharacter?.id])

  // Sync fixed spell grants: add to preparedSpellIds + initialize uses when newly unlocked
  useEffect(() => {
    if (!spellCharacter || activeFixed.length === 0) return
    const newUses = { ...character.originSpellUses }
    let usesChanged = false
    for (const grant of activeFixed) {
      addPreparedSpell(character.id, grant.spellId)
      if (grant.usesPerLongRest !== null && character.originSpellUses[grant.spellId] === undefined) {
        newUses[grant.spellId] = grant.usesPerLongRest
        usesChanged = true
      }
    }
    if (usesChanged) updateCharacter(character.id, { originSpellUses: newUses })
  }, [spellCharacter?.id, activeFixed.map(g => g.spellId).join(',')])

  if (!cls || (!isSpellcaster && !hasOriginGrants && !hasFixed)) {
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
      {/* Origin Spells panel */}
      {(hasOriginGrants || hasFixed) && (
        <div className="bg-parchment-50 rounded-xl border border-parchment-400 p-4 shadow-md flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest">Origin Spells</h2>
            {unsatisfiedCount > 0
              ? <p className="text-xs text-accent-red mt-0.5">{unsatisfiedCount} grant(s) not yet completed</p>
              : <p className="text-xs text-ink-muted mt-0.5">All origin spells selected</p>
            }
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasExhaustedOriginSpells && (
              <Button size="sm" variant="secondary" onClick={handleOriginLongRest} title="Restore all 1/Long Rest origin spells">
                Long Rest
              </Button>
            )}
            {hasOriginGrants && (
              <Button size="sm" variant="secondary" onClick={() => navigate(`/origin-spells/${character.id}`)}>
                Choose Spells
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={isSpellcaster ? 'grid gap-4 lg:grid-cols-2' : 'space-y-4'}>
        {isSpellcaster && (
          <div className="space-y-4">
            <SpellSlotTracker character={spellCharacter} />
            <ConcentrationTracker characterId={spellCharacter.id} spellId={spellCharacter.concentratingOnSpellId} />
          </div>
        )}

        {!isSpellcaster && (hasOriginGrants || hasFixed) && (
          <ConcentrationTracker characterId={spellCharacter.id} spellId={spellCharacter.concentratingOnSpellId} />
        )}

        {/* Prepared spells */}
        <div className="bg-parchment-50 rounded-xl border border-parchment-400 p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest">Prepared Spells</h2>
            {isSpellcaster && (
              <Button size="sm" variant="secondary" onClick={() => navigate(`/library/${character.id}`)}>+ Add</Button>
            )}
          </div>

          {preparedSpells.length === 0 ? (
            <div className="text-center py-8 text-ink-muted/60">
              <p className="text-sm">No spells prepared.</p>
              {isSpellcaster && (
                <button onClick={() => navigate(`/library/${character.id}`)}
                  className="text-accent-gold hover:text-accent-gold/80 text-sm mt-2 underline">Open Library</button>
              )}
              {!isSpellcaster && (hasOriginGrants || hasFixed) && (
                <p className="text-sm mt-2">Choose your origin spells above.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const groups = new Map<number, typeof preparedSpells>()
                for (const spell of preparedSpells) {
                  if (!groups.has(spell.level)) groups.set(spell.level, [])
                  groups.get(spell.level)!.push(spell)
                }
                return Array.from(groups.entries()).sort(([a], [b]) => a - b).map(([lvl, group]) => (
                  <div key={lvl} className="rounded-xl overflow-hidden border border-parchment-400 shadow-md">
                    <div className={`px-3 py-2 flex items-center gap-2 ${lvl === 0 ? 'bg-parchment-200/80' : 'bg-parchment-300/70'} border-b border-parchment-300`}>
                      <span className="font-display text-accent-gold text-xs uppercase tracking-widest">
                        {lvl === 0 ? 'Cantrips' : `Level ${lvl}`}
                      </span>
                      <span className="text-xs text-ink-muted ml-auto">{group.length}</span>
                    </div>
                    <div className="px-3">
                      {group.map(spell => (
                        <SpellListItem key={spell.id} spell={spell} character={spellCharacter}
                          isOriginSpell={allOriginSpellIds.has(spell.id)}
                          originSpellUses={character.originSpellUses}
                          onOriginCast={(spellId) => {
                            const newUses = {
                              ...character.originSpellUses,
                              [spellId]: Math.max(0, (character.originSpellUses[spellId] ?? 0) - 1)
                            }
                            updateCharacter(character.id, { originSpellUses: newUses })
                          }}
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
