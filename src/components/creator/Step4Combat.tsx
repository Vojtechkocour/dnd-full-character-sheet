import { useEffect, useState } from 'react'
import type { Character } from '@/types'
import { getAbilityModifier, calculateStats } from '@/utils/calculations'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'

interface Props {
  character: Character
  onChange: (patch: Partial<Character>) => void
}

export default function Step4Combat({ character, onChange }: Props) {
  const stats = calculateStats(character)
  const dexMod = getAbilityModifier(character.abilityScores.dexterity)
  const conMod = getAbilityModifier(character.abilityScores.constitution)
  const primaryHitDie = character.classes[0]?.hitDie ?? 8
  const level = stats.totalLevel

  // ── HP bonuses from species/feats ─────────────────────────────────────────
  const hasDwarvenToughness = character.features.some(f => f.name === 'Dwarven Toughness')
  const bgData = BACKGROUNDS_DATA.find(b => b.name === character.background?.name)
  const hasToughFeat = bgData?.featId === 'tough' || character.originFeatChoice === 'tough'
    || (character.takenFeatIds ?? []).includes('tough')

  const hpBonusPerLevel = (hasDwarvenToughness ? 1 : 0) + (hasToughFeat ? 2 : 0)
  const hpBonusSources: string[] = [
    ...(hasDwarvenToughness ? ['Dwarven Toughness (+1/lvl)'] : []),
    ...(hasToughFeat ? ['Tough feat (+2/lvl)'] : []),
  ]

  // HP method for levels 2+
  const [hpMethod, setHpMethod] = useState<'average' | 'roll'>('average')
  // Rolled HP for each level above 1 (index 0 = level 2, etc.)
  const [levelRolls, setLevelRolls] = useState<number[]>([])

  // Level 1 HP: always max die + CON + bonuses
  const level1HP = level > 0 ? primaryHitDie + conMod + hpBonusPerLevel : 0

  // Average per level (levels 2+): floor(die/2)+1 + CON + bonuses
  const avgPerLevel = Math.floor(primaryHitDie / 2) + 1 + conMod + hpBonusPerLevel

  // Total HP based on method
  const averageTotal = level > 0 ? level1HP + (level - 1) * avgPerLevel : 0
  const rolledTotal = level > 0
    ? level1HP + levelRolls.slice(0, level - 1).reduce((a, b) => a + b, 0)
    : 0

  const computedHP = hpMethod === 'average' ? averageTotal : rolledTotal
  const allRolled = levelRolls.filter(Boolean).length >= level - 1

  function rollDie(): number {
    return Math.floor(Math.random() * primaryHitDie) + 1
  }

  function rollLevel(idx: number) {
    const val = rollDie()
    const newRolls = [...levelRolls]
    while (newRolls.length <= idx) newRolls.push(0)
    newRolls[idx] = val
    setLevelRolls(newRolls)
    const extraLevels = newRolls.slice(0, level - 1).filter(Boolean).length
    const rolled = newRolls.slice(0, level - 1).reduce((a, b) => a + b, 0)
    applyHP(level1HP + rolled + extraLevels * (conMod + hpBonusPerLevel))
  }

  function rollAll() {
    const newRolls = Array.from({ length: level - 1 }, () => rollDie())
    setLevelRolls(newRolls)
    applyHP(level1HP + newRolls.reduce((a, b) => a + b, 0) + (level - 1) * (conMod + hpBonusPerLevel))
  }

  function applyHP(hp: number) {
    onChange({ hitPoints: { ...character.hitPoints, maximum: hp, current: hp } })
  }

  // Auto-apply when method or base changes
  useEffect(() => {
    if (level <= 0) return
    if (hpMethod === 'average') {
      applyHP(averageTotal)
    }
  }, [hpMethod, averageTotal])

  // Sync when switching to average
  function switchMethod(m: 'average' | 'roll') {
    setHpMethod(m)
    if (m === 'roll') {
      setLevelRolls([])
      applyHP(level1HP) // start with just level 1 until they roll
    }
  }

  return (
    <div className="space-y-5">

      {/* HP section */}
      <div className="space-y-3">
        <label className="section-header block">Hit Points</label>

        {/* Level 1 base — always shown */}
        <div className="paper-card p-3 bg-parchment-100/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-sans text-ink-muted mb-0.5">Level 1 — maximum</div>
            <div className="font-display text-2xl text-ink">{level > 0 ? level1HP : '—'}</div>
          </div>
          <div className="text-xs font-sans text-ink-muted text-right">
            d{primaryHitDie} (max) + {conMod >= 0 ? '+' : ''}{conMod} CON
            {hpBonusSources.map(s => <div key={s} className="text-accent-gold">{s}</div>)}
          </div>
        </div>

        {/* Higher levels */}
        {level > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-sans text-ink-muted font-semibold uppercase tracking-wide">
                Levels 2–{level}
              </div>
              <div className="flex gap-1">
                {(['average', 'roll'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMethod(m)}
                    className={`text-xs px-2.5 py-1 rounded font-sans transition-colors ${
                      hpMethod === m
                        ? 'bg-ink text-parchment-50'
                        : 'bg-parchment-200 text-ink-muted hover:text-ink'
                    }`}
                  >
                    {m === 'average' ? 'Average' : 'Roll Dice'}
                  </button>
                ))}
              </div>
            </div>

            {hpMethod === 'average' && (
              <div className="paper-card p-3 bg-parchment-100/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-sans text-ink-muted mb-0.5">
                    {level - 1}× (⌊d{primaryHitDie}/2⌋+1 + {conMod >= 0 ? '+' : ''}{conMod} CON)
                  </div>
                  <div className="font-display text-2xl text-ink">
                    +{(level - 1) * avgPerLevel}
                  </div>
                </div>
                <div className="text-xs font-sans text-ink-muted text-right">
                  {avgPerLevel >= 0 ? '+' : ''}{avgPerLevel} / level
                </div>
              </div>
            )}

            {hpMethod === 'roll' && (
              <div className="paper-card p-3 bg-parchment-100/60 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-sans text-ink-muted">
                    Roll d{primaryHitDie} for each level + {conMod >= 0 ? '+' : ''}{conMod} CON
                  </span>
                  <button
                    onClick={rollAll}
                    className="text-xs px-2.5 py-1 paper-card hover:bg-parchment-200 font-sans text-ink transition-colors"
                  >
                    Roll All
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: level - 1 }, (_, i) => {
                    const rolled = levelRolls[i] ?? 0
                    return (
                      <button
                        key={i}
                        onClick={() => rollLevel(i)}
                        className={`paper-card px-2 py-1.5 text-center transition-colors hover:bg-parchment-200 ${
                          rolled ? 'border-ink/20' : 'border-accent-gold/60'
                        }`}
                      >
                        <div className="text-xs font-sans text-ink-muted">lvl {i + 2}</div>
                        <div className="font-display text-base text-ink">
                          {rolled ? `+${rolled + conMod}` : '?'}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {!allRolled && (
                  <p className="text-xs text-ink-muted font-sans italic">
                    Click a level or "Roll All"
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Total HP */}
        {level > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs font-sans text-ink-muted mb-1">Maximum HP</div>
              <input
                type="number"
                min={1}
                value={character.hitPoints.maximum}
                onChange={(e) => onChange({
                  hitPoints: { ...character.hitPoints, maximum: Number(e.target.value), current: Number(e.target.value) },
                })}
                className="field-box w-full text-center font-display text-2xl"
              />
            </div>
            {level > 1 && computedHP !== character.hitPoints.maximum && (
              <button
                onClick={() => applyHP(computedHP)}
                className="text-xs text-accent-gold hover:underline font-sans mt-4 whitespace-nowrap"
              >
                Apply {computedHP}
              </button>
            )}
          </div>
        )}
      </div>

      {/* AC, Speed, Initiative */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="section-header block">Armor Class</label>
          <input
            type="number"
            min={1}
            value={character.armorClass}
            onChange={(e) => onChange({ armorClass: Number(e.target.value) })}
            className="field-box w-full text-center font-display text-lg"
          />
          <p className="text-xs text-ink-muted mt-1 font-sans">Unarmored: {10 + dexMod}</p>
        </div>
        <div>
          <label className="section-header block">Speed (ft)</label>
          <input
            type="number"
            min={0}
            step={5}
            value={character.speed}
            onChange={(e) => onChange({ speed: Number(e.target.value) })}
            className="field-box w-full text-center font-display text-lg"
          />
        </div>
        <div>
          <label className="section-header block">Initiative</label>
          <input
            type="number"
            value={character.initiative === 0 ? dexMod : character.initiative}
            onChange={(e) => onChange({ initiative: Number(e.target.value) })}
            className="field-box w-full text-center font-display text-lg"
          />
          <p className="text-xs text-ink-muted mt-1 font-sans">DEX mod: {dexMod >= 0 ? '+' : ''}{dexMod}</p>
        </div>
      </div>

      {/* Summary */}
      {level > 0 && (
        <div className="paper-card p-3 bg-parchment-100/50">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-display text-base text-ink">{character.hitPoints.maximum}</div>
              <div className="text-xs text-ink-muted">HP Max</div>
            </div>
            <div>
              <div className="font-display text-base text-ink">{character.armorClass}</div>
              <div className="text-xs text-ink-muted">AC</div>
            </div>
            <div>
              <div className="font-display text-base text-ink">{character.speed}</div>
              <div className="text-xs text-ink-muted">Speed</div>
            </div>
            <div>
              <div className="font-display text-base text-ink">+{stats.proficiencyBonus}</div>
              <div className="text-xs text-ink-muted">Prof Bonus</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
