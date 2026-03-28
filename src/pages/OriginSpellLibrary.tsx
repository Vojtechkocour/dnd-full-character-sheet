import { useNavigate, useParams } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useSpellStore } from '@/store/spellStore'
import { SpellCard } from '@/components/spells/SpellCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { useState } from 'react'
import { getOriginSpellGrants, type ResolvedGrant } from '@/utils/originSpellGrants'
import type { SpellGrantDef } from '@/types'

export default function OriginSpellLibrary() {
  const navigate = useNavigate()
  const { characterId } = useParams<{ characterId: string }>()
  const character = useCharacterStore(s => s.characters.find(c => c.id === characterId))
  const updateCharacter = useCharacterStore(s => s.updateCharacter)
  const spells = useSpellStore(s => s.spells)
  const addPreparedSpell = useSpellStore(s => s.addPreparedSpell)
  const removePreparedSpell = useSpellStore(s => s.removePreparedSpell)
  const [searchQuery, setSearchQuery] = useState('')

  if (!character || !characterId) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center text-ink-muted">
        <p>Character not found.</p>
      </div>
    )
  }

  const grants = getOriginSpellGrants(character, spells)

  function handleToggle(spellId: string, grant: ResolvedGrant, grantDef: SpellGrantDef) {
    const isSelected = character!.originSpellChoices.includes(spellId)
    const spell = spells.find(s => s.id === spellId)
    if (!spell) return

    if (isSelected) {
      const newChoices = character!.originSpellChoices.filter(id => id !== spellId)
      const newUses = { ...character!.originSpellUses }
      delete newUses[spellId]
      removePreparedSpell(characterId!, spellId)
      updateCharacter(characterId!, { originSpellChoices: newChoices, originSpellUses: newUses })
    } else {
      if (grant.alreadyChosenIds.length >= grantDef.count) return
      const newChoices = [...character!.originSpellChoices, spellId]
      const newUses = { ...character!.originSpellUses }
      if (spell.level > 0) newUses[spellId] = 1  // 1/long rest for leveled spells
      addPreparedSpell(characterId!, spellId)
      updateCharacter(characterId!, { originSpellChoices: newChoices, originSpellUses: newUses })
    }
  }

  const allSatisfied = grants.every(g => g.isSatisfied)
  const q = searchQuery.toLowerCase()

  return (
    <div className="min-h-screen bg-parchment-100 text-ink">
      {/* Header */}
      <header className="bg-parchment-50 border-b border-parchment-300 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="text-ink-muted hover:text-ink transition-colors text-sm shrink-0">
          &larr; Back
        </button>
        <span className="font-display text-accent-gold text-sm uppercase tracking-widest shrink-0">Origin Spells</span>
        <SearchInput className="flex-1" placeholder="Search spells..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {allSatisfied
            ? <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 rounded-full">All origin spells selected</span>
            : <span className="text-xs bg-accent-red/10 text-accent-red border border-accent-red/30 px-2 py-0.5 rounded-full">{grants.filter(g => !g.isSatisfied).length} grant(s) not yet completed</span>
          }
        </div>

        {grants.length === 0 && (
          <div className="text-center py-16 text-ink-muted">
            <p>This character has no origin spell grants.</p>
          </div>
        )}

        <div className="flex flex-col gap-10">
          {grants.map((grant, grantIndex) => {
            const grantDef = grant.grantDef
            const filtered = spells
              .filter(s =>
                s.classes.includes(grantDef.spellClass) &&
                s.level === grantDef.maxLevel &&
                (q === '' || s.name.toLowerCase().includes(q))
              )
              .sort((a, b) => a.name.localeCompare(b.name))

            return (
              <section key={grantIndex}>
                {/* Grant header */}
                <div className="flex items-center justify-between mb-3 border-b border-parchment-300 pb-2">
                  <div>
                    <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest">{grant.sourceName}</h2>
                    <p className="text-xs text-ink-muted mt-0.5">{grantDef.label}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${grant.isSatisfied ? 'bg-green-100 text-green-700 border-green-300' : 'bg-parchment-200 text-ink-muted border-parchment-400'}`}>
                    {grant.alreadyChosenIds.length}/{grantDef.count} {grant.isSatisfied ? '✓' : ''}
                  </span>
                </div>

                {filtered.length === 0 && (
                  <p className="text-sm text-ink-muted text-center py-6">No spells found.</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map(spell => {
                    const isPrepared = character.originSpellChoices.includes(spell.id)
                    const isAtLimit = !isPrepared && grant.alreadyChosenIds.length >= grantDef.count
                    return (
                      <SpellCard
                        key={spell.id}
                        spell={spell}
                        isPrepared={isPrepared}
                        isAtLimit={isAtLimit}
                        onTogglePrepare={() => handleToggle(spell.id, grant, grantDef)}
                      />
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
