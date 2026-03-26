import { useNavigate, useParams } from 'react-router-dom'
import { useSpellStore, selectActiveSpellCharacter, SPELL_SCHOOL_LABELS, SPELL_SCHOOL_COLORS, CHARACTER_CLASS_LABELS } from '@/store/spellStore'
import type { CharacterClass } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getMaxCantrips, getMaxPreparedLeveledSpells, getMaxSpellLevel } from '@/utils/preparedSpellLimit'

export default function SpellDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const spells = useSpellStore(s => s.spells)
  const character = useSpellStore(selectActiveSpellCharacter)
  const addPreparedSpell = useSpellStore(s => s.addPreparedSpell)
  const removePreparedSpell = useSpellStore(s => s.removePreparedSpell)

  const spell = spells.find(s => s.id === id)
  const isPrepared = character?.preparedSpellIds.includes(id ?? '') ?? false
  const isUnavailable = !isPrepared && !!character && !!spell && spell.level > 0 && spell.level > getMaxSpellLevel(character)
  const isAtLimit = (() => {
    if (!character || !spell || isPrepared) return false
    if (spell.level === 0) {
      const max = getMaxCantrips(character)
      const current = character.preparedSpellIds.filter(sid => spells.find(s => s.id === sid)?.level === 0).length
      return max !== null && current >= max
    }
    const max = getMaxPreparedLeveledSpells(character)
    const current = character.preparedSpellIds.filter(sid => { const s = spells.find(sp => sp.id === sid); return s && s.level > 0 }).length
    return max !== null && current >= max
  })()

  function togglePrepare() {
    if (!character || !id) return
    if (isPrepared) removePreparedSpell(character.id, id)
    else addPreparedSpell(character.id, id)
  }

  if (!spell) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Spell not found.</p>
          <Button onClick={() => navigate(-1)}>&larr; Back</Button>
        </div>
      </div>
    )
  }

  const levelLabel = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`
  const components = [spell.components.verbal && 'V', spell.components.somatic && 'S', spell.components.material && 'M'].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-parchment-100 text-ink">
      <header className="bg-parchment-50 border-b border-parchment-300 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="text-ink-muted hover:text-ink transition-colors text-sm">&larr;</button>
        <h1 className="font-display text-accent-gold text-lg flex-1 truncate">{spell.name}</h1>
        {character && (
          <Button size="sm" variant={isPrepared ? 'danger' : 'secondary'}
            onClick={isAtLimit || isUnavailable ? undefined : togglePrepare}
            disabled={isAtLimit || isUnavailable}
            title={isUnavailable ? 'Requires higher character level' : isAtLimit ? 'Spell limit reached' : undefined}>
            {isPrepared ? 'Remove' : isUnavailable ? 'Too high level' : isAtLimit ? '— at limit' : '+ Add'}
          </Button>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge label={SPELL_SCHOOL_LABELS[spell.school]} className={SPELL_SCHOOL_COLORS[spell.school]} />
          <Badge label={levelLabel} className="bg-parchment-200 text-ink-light border border-parchment-300" />
          {spell.concentration && <Badge label="Concentration" className="bg-yellow-100 text-yellow-800 border border-yellow-300" />}
          {spell.ritual && <Badge label="Ritual" className="bg-purple-100 text-purple-800 border border-purple-300" />}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Casting Time', value: spell.castingTime },
            { label: 'Range', value: spell.range },
            { label: 'Components', value: components || '—' },
            { label: 'Duration', value: spell.duration },
            ...(spell.savingThrow ? [{ label: 'Saving Throw', value: spell.savingThrow }] : []),
            ...(spell.damageType ? [{ label: 'Damage Type', value: spell.damageType }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="bg-parchment-50 border border-parchment-400 rounded-xl p-3 shadow-md">
              <p className="text-xs text-ink-muted mb-1">{label}</p>
              <p className="text-ink">{value}</p>
            </div>
          ))}
        </div>

        {spell.components.material && spell.components.materialDescription && (
          <div className="text-sm text-ink-muted">
            <span className="font-medium text-ink-light">Material Components: </span>
            {spell.components.materialDescription}
          </div>
        )}

        <div className="bg-parchment-50 border border-parchment-400 rounded-xl p-5 space-y-4 shadow-md">
          <h2 className="font-display text-accent-gold text-sm uppercase tracking-wide">Description</h2>
          <p className="text-ink-light leading-relaxed whitespace-pre-line">{spell.description}</p>
          {spell.higherLevels && (
            <div className="border-t border-parchment-300 pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">At Higher Levels</p>
              <p className="text-ink-light leading-relaxed">{spell.higherLevels}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Classes</p>
          <div className="flex flex-wrap gap-2">
            {spell.classes.map(cls => (
              <Badge key={cls} label={CHARACTER_CLASS_LABELS[cls as CharacterClass] ?? cls}
                className="bg-parchment-200 text-ink-light border border-parchment-300" />
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-muted/50">Source: {spell.source}</p>
      </main>
    </div>
  )
}
