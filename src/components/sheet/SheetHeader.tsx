import { useState } from 'react'
import type { Character, CalculatedStats, Alignment, AbilityName } from '@/types'
import { formatModifier } from '@/utils/calculations'
import { useCharacterStore } from '@/store/characterStore'
import LevelUpModal from './LevelUpModal'

const CLASS_LABELS: Record<string, string> = {
  barbarian: 'Barbarian', bard: 'Bard', cleric: 'Cleric', druid: 'Druid',
  fighter: 'Fighter', monk: 'Monk', paladin: 'Paladin', ranger: 'Ranger',
  rogue: 'Rogue', sorcerer: 'Sorcerer', warlock: 'Warlock', wizard: 'Wizard',
}

const ALIGNMENT_LABELS: Record<Alignment, string> = {
  lawfulGood: 'Lawful Good', neutralGood: 'Neutral Good', chaoticGood: 'Chaotic Good',
  lawfulNeutral: 'Lawful Neutral', trueNeutral: 'True Neutral', chaoticNeutral: 'Chaotic Neutral',
  lawfulEvil: 'Lawful Evil', neutralEvil: 'Neutral Evil', chaoticEvil: 'Chaotic Evil',
  unaligned: 'Unaligned',
}

const ABILITY_SHORT: { key: AbilityName; short: string }[] = [
  { key: 'strength', short: 'STR' },
  { key: 'dexterity', short: 'DEX' },
  { key: 'constitution', short: 'CON' },
  { key: 'intelligence', short: 'INT' },
  { key: 'wisdom', short: 'WIS' },
  { key: 'charisma', short: 'CHA' },
]

const CELL = 'border border-parchment-400 rounded-xl bg-parchment-100/40 px-3 py-2'

interface Props {
  character: Character
  stats: CalculatedStats
  isEditing?: boolean
}

export default function SheetHeader({ character, stats, isEditing = false }: Props) {
  const { updateCharacter } = useCharacterStore()
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [hpDelta, setHpDelta] = useState(0)
  const [editingHP, setEditingHP] = useState<'current' | 'max' | 'temp' | null>(null)

  const classLine = character.classes
    .map((c) => `${CLASS_LABELS[c.class] ?? c.class} ${c.level}`)
    .join(' / ')

  function toggleInspiration() {
    updateCharacter(character.id, { inspiration: !character.inspiration })
  }

  function patch(partial: Partial<Character>) {
    updateCharacter(character.id, partial)
  }

  function setHP(field: 'current' | 'temporary' | 'maximum', value: number) {
    updateCharacter(character.id, {
      hitPoints: { ...character.hitPoints, [field]: value },
    })
  }

  function setDeathSave(field: 'successes' | 'failures', value: number) {
    updateCharacter(character.id, {
      deathSaves: { ...character.deathSaves, [field]: value },
    })
  }

  const isDying = character.hitPoints.current <= 0 && character.hitPoints.maximum > 0
  const hpPercent = character.hitPoints.maximum > 0
    ? Math.max(0, Math.min(100, (character.hitPoints.current / character.hitPoints.maximum) * 100))
    : 0

  return (
    <>
      <div className={`paper-card p-3 mb-4 transition-colors ${isEditing ? 'ring-2 ring-accent-gold/40' : ''}`}>

        {/* === ROW 1: Identity + Class / HP === */}
        <div className={`grid gap-2 ${isEditing ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-[1fr_auto]'}`}>

          {/* Cell A — Identity + Class (merged) */}
          <div className={CELL}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  className="field-box w-full font-display text-xl text-ink mb-1"
                  placeholder="Character name"
                />
                <input
                  type="text"
                  value={character.species ?? ''}
                  onChange={(e) => patch({ species: e.target.value })}
                  className="field-box w-full font-serif text-sm text-ink-muted mb-1"
                  placeholder="Species"
                />
                <div className="font-serif text-sm text-ink mb-1">{classLine || 'No class'}</div>
                <select
                  value={character.alignment}
                  onChange={(e) => patch({ alignment: e.target.value as Alignment })}
                  className="field-box w-full font-serif text-sm text-ink-muted"
                >
                  {(Object.entries(ALIGNMENT_LABELS) as [Alignment, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </>
            ) : (
              <div className="flex flex-col gap-0">
                {/* Row 1: Name + Level + Prof */}
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-xl text-ink font-semibold leading-tight">{character.name}</div>
                  <div className="shrink-0 border border-parchment-400 rounded-xl bg-parchment-100/40 px-3 py-1 text-center">
                    <div className="font-display text-2xl font-semibold text-ink leading-none">{formatModifier(stats.proficiencyBonus)}</div>
                    <div className="text-[9px] font-sans text-ink-muted leading-tight mt-0.5">Proficiency Bonus</div>
                  </div>
                </div>
                {/* Row 2: Class + Level */}
                <div className="flex items-baseline gap-2">
                  <div className="font-serif text-base text-ink">
                    {character.classes.length > 0
                      ? character.classes.map((c) => CLASS_LABELS[c.class] ?? c.class).join(' / ')
                      : 'No class'}
                  </div>
                  {stats.totalLevel > 0 && (
                    <div className="font-sans text-xs text-ink-muted border border-parchment-400 rounded px-1.5 py-0.5 leading-none">
                      Lvl {stats.totalLevel}
                    </div>
                  )}
                </div>
                {/* Row 3: Species · Background · Alignment */}
                <div className="font-sans text-sm text-ink-muted">
                  {[character.species, character.background?.name, ALIGNMENT_LABELS[character.alignment] ?? character.alignment]
                    .filter(Boolean).join(' · ')}
                </div>
                {/* Row 4: buttons */}
                <div className="flex items-center gap-2 pt-1 no-print">
                  <button
                    onClick={toggleInspiration}
                    className={`flex items-center gap-1 px-2 py-1 rounded-sm border text-xs font-sans transition-colors ${
                      character.inspiration
                        ? 'bg-accent-gold border-accent-gold text-parchment-50'
                        : 'border-ink/20 text-ink-muted hover:border-accent-gold/50'
                    }`}
                    title="Inspiration"
                  >
                    <span>★</span>
                    <span>Insp</span>
                  </button>
                  {stats.totalLevel > 0 && stats.totalLevel < 20 && (
                    <button
                      onClick={() => setShowLevelUp(true)}
                      className="px-2 py-1 bg-accent-gold text-parchment-50 font-sans text-xs rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      Level Up
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cell C — HP Block */}
          {!isEditing && stats.totalLevel > 0 && (
            <div className={CELL}>
              {/* HP numbers inline */}
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-sans font-semibold text-ink-muted tracking-widest uppercase">HP</div>

                {/* Current */}
                {editingHP === 'current' ? (
                  <input
                    type="number"
                    autoFocus
                    value={character.hitPoints.current}
                    onChange={(e) => setHP('current', Number(e.target.value))}
                    onBlur={() => setEditingHP(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingHP(null)}
                    className={`field-box w-14 text-center font-display text-lg ${isDying ? 'border-accent-red text-accent-red' : ''}`}
                  />
                ) : (
                  <span
                    onClick={() => setEditingHP('current')}
                    className={`font-display text-xl font-semibold cursor-pointer hover:opacity-70 transition-opacity ${isDying ? 'text-accent-red' : 'text-ink'}`}
                    title="Click to edit"
                  >
                    {character.hitPoints.current}
                  </span>
                )}

                <span className="font-display text-ink-muted">/</span>

                {/* Max */}
                {editingHP === 'max' ? (
                  <input
                    type="number"
                    autoFocus
                    value={character.hitPoints.maximum}
                    onChange={(e) => setHP('maximum', Number(e.target.value))}
                    onBlur={() => setEditingHP(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingHP(null)}
                    className="field-box w-14 text-center font-display text-lg"
                  />
                ) : (
                  <span
                    onClick={() => setEditingHP('max')}
                    className="font-display text-xl text-ink-muted cursor-pointer hover:opacity-70 transition-opacity"
                    title="Click to edit"
                  >
                    {character.hitPoints.maximum}
                  </span>
                )}

                {/* Temp */}
                {editingHP === 'temp' ? (
                  <input
                    type="number"
                    autoFocus
                    min={0}
                    value={character.hitPoints.temporary}
                    onChange={(e) => setHP('temporary', Number(e.target.value))}
                    onBlur={() => setEditingHP(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingHP(null)}
                    className="field-box w-12 text-center font-display text-lg"
                  />
                ) : (
                  <span
                    onClick={() => setEditingHP('temp')}
                    className="font-display text-lg cursor-pointer hover:opacity-70 transition-opacity ml-1"
                    title="Temp HP"
                  >
                    {character.hitPoints.temporary > 0
                      ? <span className="text-accent-gold font-semibold">+{character.hitPoints.temporary}</span>
                      : <span className="text-ink-muted">tmp</span>
                    }
                  </span>
                )}
              </div>

              {/* HP bar */}
              <div className="w-full h-1.5 bg-parchment-300 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${isDying ? 'bg-accent-red' : hpPercent > 50 ? 'bg-ink' : hpPercent > 25 ? 'bg-accent-gold' : 'bg-accent-red'}`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Compact damage/heal */}
              <div className="flex items-center gap-1.5 mt-1.5 no-print">
                <input
                  type="number"
                  min={0}
                  value={hpDelta || ''}
                  placeholder="0"
                  onChange={(e) => setHpDelta(Math.max(0, Number(e.target.value)))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setHP('current', Math.max(0, character.hitPoints.current - hpDelta))
                      setHpDelta(0)
                    }
                  }}
                  className="field-box w-14 text-center font-display text-sm py-0.5"
                />
                <button
                  onClick={() => { setHP('current', Math.max(0, character.hitPoints.current - hpDelta)); setHpDelta(0) }}
                  disabled={hpDelta === 0}
                  className="px-2 py-0.5 bg-accent-red/90 text-parchment-50 font-sans text-xs rounded-sm hover:bg-accent-red transition-colors disabled:opacity-30"
                >Dmg</button>
                <button
                  onClick={() => { setHP('current', Math.min(character.hitPoints.maximum, character.hitPoints.current + hpDelta)); setHpDelta(0) }}
                  disabled={hpDelta === 0}
                  className="px-2 py-0.5 bg-ink text-parchment-50 font-sans text-xs rounded-sm hover:opacity-80 transition-colors disabled:opacity-30"
                >Heal</button>
              </div>

              {/* Death saves */}
              {isDying && (
                <div className="flex gap-4 mt-2 pt-2 border-t border-parchment-300">
                  {(['successes', 'failures'] as const).map((type) => (
                    <div key={type}>
                      <div className={`text-[10px] font-sans font-semibold uppercase tracking-widest mb-1 ${type === 'failures' ? 'text-accent-red' : 'text-ink-muted'}`}>
                        {type === 'successes' ? 'Successes' : 'Failures'}
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                          <button
                            key={i}
                            onClick={() => setDeathSave(type, character.deathSaves[type] === i ? i - 1 : i)}
                            className={`w-5 h-5 rounded-full border-2 transition-colors ${
                              i <= character.deathSaves[type]
                                ? type === 'failures' ? 'bg-accent-red border-accent-red' : 'bg-ink border-ink'
                                : 'border-ink/30 bg-parchment-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* === ROW 2: Ability Scores === */}
        {!isEditing && stats.totalLevel > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
            {ABILITY_SHORT.map(({ key, short }) => {
              const score = character.abilityScores[key]
              const mod = stats.abilityModifiers[key]
              return (
                <div key={key} className={`${CELL} text-center flex flex-col items-center justify-center gap-0.5`}>
                  <div className="text-[9px] font-sans font-semibold text-ink-muted tracking-wide uppercase">{short}</div>
                  <div className="font-display text-xl text-ink leading-none font-semibold">{formatModifier(mod)}</div>
                  <div className="text-xs font-sans text-ink-muted">{score}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* === ROW 3: Quick Stats === */}
        {isEditing ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className={`${CELL} text-center`}>
              <div className="text-[10px] font-sans font-semibold text-ink-muted tracking-widest uppercase mb-1">AC</div>
              <input
                type="number"
                value={character.armorClass}
                onChange={(e) => patch({ armorClass: Number(e.target.value) })}
                className="field-box w-full text-center font-display text-lg"
              />
            </div>
            <div className={`${CELL} text-center`}>
              <div className="text-[10px] font-sans font-semibold text-ink-muted tracking-widest uppercase mb-1">Initiative</div>
              <input
                type="number"
                value={character.initiative ?? 0}
                onChange={(e) => patch({ initiative: Number(e.target.value) })}
                className="field-box w-full text-center font-display text-lg"
              />
            </div>
            <div className={`${CELL} text-center`}>
              <div className="text-[10px] font-sans font-semibold text-ink-muted tracking-widest uppercase mb-1">Speed (ft)</div>
              <input
                type="number"
                value={character.speed}
                onChange={(e) => patch({ speed: Number(e.target.value) })}
                className="field-box w-full text-center font-display text-lg"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
            {[
              { label: 'AC', value: character.armorClass },
              { label: 'Init', value: formatModifier(character.initiative || stats.abilityModifiers.dexterity) },
              { label: 'Speed', value: `${character.speed} ft` },
              { label: 'Pass. Perc', value: stats.passivePerception },
              { label: 'Pass. Ins', value: stats.passiveInsight },
              { label: 'Pass. Inv', value: stats.passiveInvestigation },
            ].map(({ label, value }) => (
              <div key={label} className={`${CELL} text-center`}>
                <div className="font-display text-xl font-semibold text-ink leading-none">{value}</div>
                <div className="text-[9px] font-sans font-semibold text-ink-muted tracking-wide uppercase mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        )}

      </div>

      {showLevelUp && (
        <LevelUpModal character={character} onClose={() => setShowLevelUp(false)} />
      )}
    </>
  )
}
