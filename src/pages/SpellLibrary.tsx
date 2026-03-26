import { useNavigate, useParams } from 'react-router-dom'
import { useSpellStore, selectActiveSpellCharacter } from '@/store/spellStore'
import { useSpellFilter } from '@/hooks/useSpellFilter'
import { SpellCard } from '@/components/spells/SpellCard'
import { SpellFilters } from '@/components/spells/SpellFilters'
import { SearchInput } from '@/components/ui/SearchInput'
import { useState } from 'react'
import { getMaxCantrips, getMaxPreparedLeveledSpells, getMaxSpellLevel } from '@/utils/preparedSpellLimit'

export default function SpellLibrary() {
  const navigate = useNavigate()
  const { characterId } = useParams<{ characterId: string }>()
  const spells = useSpellStore(s => s.spells)
  const filters = useSpellStore(s => s.filters)
  const setFilter = useSpellStore(s => s.setFilter)
  const resetFilters = useSpellStore(s => s.resetFilters)
  const character = useSpellStore(s => characterId ? s.spellCharacters.find(c => c.id === characterId) : selectActiveSpellCharacter(s))
  const addPreparedSpell = useSpellStore(s => s.addPreparedSpell)
  const removePreparedSpell = useSpellStore(s => s.removePreparedSpell)
  const [showFilters, setShowFilters] = useState(false)

  const maxCantrips = character ? getMaxCantrips(character) : null
  const maxLeveled = character ? getMaxPreparedLeveledSpells(character) : null
  const maxSpellLevel = character ? getMaxSpellLevel(character) : 9

  const preparedCantrips = character
    ? character.preparedSpellIds.filter(id => spells.find(s => s.id === id)?.level === 0).length : 0
  const preparedLeveled = character
    ? character.preparedSpellIds.filter(id => { const s = spells.find(sp => sp.id === id); return s && s.level > 0 }).length : 0

  const effectiveFilters = character
    ? { ...filters, classes: filters.classes.length > 0 ? filters.classes : [character.class] }
    : filters

  const filtered = useSpellFilter(spells, effectiveFilters)

  function handleToggle(spellId: string) {
    if (!character) return
    if (character.preparedSpellIds.includes(spellId)) removePreparedSpell(character.id, spellId)
    else addPreparedSpell(character.id, spellId)
  }

  return (
    <div className="min-h-screen bg-parchment-100 text-ink">
      <header className="bg-parchment-50 border-b border-parchment-300 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="text-ink-muted hover:text-ink transition-colors text-sm shrink-0">
          &larr; Back
        </button>
        <SearchInput className="flex-1" placeholder="Search spells..." value={filters.searchQuery}
          onChange={e => setFilter({ searchQuery: e.target.value })} onClear={() => setFilter({ searchQuery: '' })} />
        <button onClick={() => setShowFilters(!showFilters)} className="text-ink-muted hover:text-ink transition-colors text-sm shrink-0">
          Filters
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {showFilters && <div className="mb-6"><SpellFilters filters={filters} onChange={setFilter} onReset={resetFilters} /></div>}

        {!character && (
          <div className="mb-4 p-3 bg-parchment-50 border border-accent-gold/30 rounded text-sm text-ink-muted">
            Select a character to manage prepared spells.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <p className="text-xs text-ink-muted">{filtered.length} of {spells.length} spells</p>
          {character && maxCantrips !== null && (
            <span className={`text-xs px-2 py-0.5 rounded border ${preparedCantrips >= maxCantrips ? 'border-accent-red/60 text-accent-red bg-red-50' : 'border-parchment-300 text-ink-muted'}`}>
              Cantrips: {preparedCantrips} / {maxCantrips}
            </span>
          )}
          {character && maxLeveled !== null && (
            <span className={`text-xs px-2 py-0.5 rounded border ${preparedLeveled >= maxLeveled ? 'border-accent-red/60 text-accent-red bg-red-50' : 'border-parchment-300 text-ink-muted'}`}>
              Spells: {preparedLeveled} / {maxLeveled}
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <p>No spells found.</p>
          </div>
        ) : (() => {
          const groups = new Map<number, typeof filtered>()
          for (const spell of filtered) {
            if (!groups.has(spell.level)) groups.set(spell.level, [])
            groups.get(spell.level)!.push(spell)
          }
          return (
            <div className="flex flex-col gap-8">
              {Array.from(groups.keys()).sort((a, b) => a - b).map(level => (
                <section key={level}>
                  <h2 className="font-display text-accent-gold text-sm uppercase tracking-widest mb-3 border-b border-parchment-300 pb-1">
                    {level === 0 ? 'Cantrips' : `Level ${level}`}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.get(level)!.map(spell => (
                      <SpellCard key={spell.id} spell={spell}
                        isPrepared={character?.preparedSpellIds.includes(spell.id) ?? false}
                        isUnavailable={character != null && spell.level > 0 && !character.preparedSpellIds.includes(spell.id) && spell.level > maxSpellLevel}
                        isAtLimit={character && !character.preparedSpellIds.includes(spell.id)
                          ? spell.level === 0 ? maxCantrips !== null && preparedCantrips >= maxCantrips
                          : maxLeveled !== null && preparedLeveled >= maxLeveled : false}
                        onTogglePrepare={() => handleToggle(spell.id)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        })()}
      </main>
    </div>
  )
}
