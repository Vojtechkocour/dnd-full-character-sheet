import { useState } from 'react'
import type { Character, AbilityName } from '@/types'
import { getAbilityModifier, formatModifier } from '@/utils/calculations'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'

type Method = 'standard' | 'pointbuy' | 'roll' | 'manual'

const ABILITIES: { key: AbilityName; label: string; short: string }[] = [
  { key: 'strength',     label: 'Strength',     short: 'STR' },
  { key: 'dexterity',    label: 'Dexterity',    short: 'DEX' },
  { key: 'constitution', label: 'Constitution', short: 'CON' },
  { key: 'intelligence', label: 'Intelligence', short: 'INT' },
  { key: 'wisdom',       label: 'Wisdom',       short: 'WIS' },
  { key: 'charisma',     label: 'Charisma',     short: 'CHA' },
]

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

const POINT_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}
const POINT_BUY_BUDGET = 27

function roll4d6Drop(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => a - b)
  return rolls.slice(1).reduce((a, b) => a + b, 0)
}

interface Props {
  character: Character
  onChange: (patch: Partial<Character>) => void
}

export default function Step3AbilityScores({ character, onChange }: Props) {
  const [method, setMethod] = useState<Method>('manual')

  // Standard Array assignment: ability → base value
  const [stdAssign, setStdAssign] = useState<Partial<Record<AbilityName, number>>>({})

  // Roll pool: 6 values (index = pool slot), assignment: ability → pool index
  const [rollPool, setRollPool] = useState<number[]>([])
  const [rollAssign, setRollAssign] = useState<Partial<Record<AbilityName, number>>>({})

  // Background ASI
  const bgASI = (character.background?.abilityScoreIncrease ?? {}) as Partial<Record<AbilityName, number>>
  function asiBonus(ability: AbilityName): number {
    return bgASI[ability] ?? 0
  }

  // setScore takes a BASE score; final stored value = base + bgASI
  function setScore(ability: AbilityName, baseValue: number) {
    onChange({ abilityScores: { ...character.abilityScores, [ability]: baseValue + asiBonus(ability) } })
  }

  // ── Standard Array ─────────────────────────────────────────────────────────
  function assignStd(ability: AbilityName, value: number | null) {
    const newAssign = { ...stdAssign }
    if (value === null) {
      delete newAssign[ability]
    } else {
      newAssign[ability] = value
    }
    setStdAssign(newAssign)
    const scores = { ...character.abilityScores }
    scores[ability] = (value ?? 10) + asiBonus(ability)
    onChange({ abilityScores: scores })
  }

  function usedStdValues(): number[] {
    return Object.values(stdAssign).filter((v): v is number => v !== undefined)
  }

  // ── Point Buy ──────────────────────────────────────────────────────────────
  function pointsSpent(): number {
    return ABILITIES.reduce((sum, { key }) => {
      const base = character.abilityScores[key] - asiBonus(key)
      return sum + (POINT_COST[base] ?? 0)
    }, 0)
  }

  function pbSetScore(ability: AbilityName, baseValue: number) {
    if (baseValue < 8 || baseValue > 15) return
    const currentBase = character.abilityScores[ability] - asiBonus(ability)
    const delta = (POINT_COST[baseValue] ?? 0) - (POINT_COST[currentBase] ?? 0)
    if (delta > 0 && pointsSpent() + delta > POINT_BUY_BUDGET) return
    setScore(ability, baseValue)
  }

  // ── Roll pool ──────────────────────────────────────────────────────────────
  function rollAll() {
    const pool = Array.from({ length: 6 }, () => roll4d6Drop())
    setRollPool(pool)
    setRollAssign({})
    // Reset base scores to 10, keep ASI
    const keys: AbilityName[] = ABILITIES.map(a => a.key)
    onChange({ abilityScores: Object.fromEntries(keys.map(k => [k, 10 + asiBonus(k)])) as Record<AbilityName, number> })
  }

  function rerollOne(poolIdx: number) {
    const newPool = [...rollPool]
    newPool[poolIdx] = roll4d6Drop()
    setRollPool(newPool)
    const newAssign = { ...rollAssign }
    for (const [ab, idx] of Object.entries(newAssign)) {
      if (idx === poolIdx) {
        delete newAssign[ab as AbilityName]
        setScore(ab as AbilityName, 10)
      }
    }
    setRollAssign(newAssign)
  }

  function assignRoll(ability: AbilityName, poolIdx: number | null) {
    const newAssign = { ...rollAssign }
    const oldIdx = newAssign[ability] ?? null
    if (oldIdx !== null) delete newAssign[ability]

    if (poolIdx !== null) {
      for (const [ab, idx] of Object.entries(newAssign)) {
        if (idx === poolIdx) delete newAssign[ab as AbilityName]
      }
      newAssign[ability] = poolIdx
      setScore(ability, rollPool[poolIdx])
    } else {
      setScore(ability, 10)
    }
    setRollAssign(newAssign)
  }

  function usedPoolIndices(): Set<number> {
    return new Set(Object.values(rollAssign).filter((v): v is number => v !== undefined))
  }

  // ── Method switch ──────────────────────────────────────────────────────────
  function switchMethod(m: Method) {
    setMethod(m)
    setStdAssign({})
    setRollPool([])
    setRollAssign({})
    const keys: AbilityName[] = ABILITIES.map(a => a.key)
    const base = m === 'pointbuy' ? 8 : 10
    onChange({ abilityScores: Object.fromEntries(keys.map(k => [k, base + asiBonus(k)])) as Record<AbilityName, number> })
  }

  const spent = pointsSpent()
  const remaining = POINT_BUY_BUDGET - spent

  // ── Background ASI handler ─────────────────────────────────────────────────
  const bgData = BACKGROUNDS_DATA.find(b => b.name === character.background?.name)
  const asiPlusTwo = (Object.entries(bgASI).find(([, v]) => v === 2)?.[0] ?? '') as AbilityName | ''
  const asiPlusOne = (Object.entries(bgASI).find(([, v]) => v === 1)?.[0] ?? '') as AbilityName | ''

  function handleASIChange(newPlusTwo: AbilityName | '', newPlusOne: AbilityName | '') {
    const newASI: Partial<Record<AbilityName, number>> = {}
    if (newPlusTwo) newASI[newPlusTwo] = 2
    if (newPlusOne) newASI[newPlusOne] = 1

    // Revert old ASI, apply new — base scores stay the same
    const scores = { ...character.abilityScores }
    for (const [ab, bonus] of Object.entries(bgASI)) {
      scores[ab as AbilityName] = Math.max(1, scores[ab as AbilityName] - (bonus as number))
    }
    for (const [ab, bonus] of Object.entries(newASI)) {
      scores[ab as AbilityName] = scores[ab as AbilityName] + (bonus as number)
    }

    onChange({
      abilityScores: scores,
      background: character.background ? { ...character.background, abilityScoreIncrease: newASI } : null,
    })
  }

  return (
    <div className="space-y-5">

      {/* Method selector */}
      <div>
        <div className="section-header mb-2">Assignment Method</div>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['standard', 'Standard Array',  '15, 14, 13, 12, 10, 8'],
            ['pointbuy', 'Point Buy',        '27 points, range 8–15'],
            ['roll',     'Roll Dice',        '4d6 drop lowest, assign'],
            ['manual',   'Manual',           'Enter your own values'],
          ] as [Method, string, string][]).map(([m, label, desc]) => (
            <button
              key={m}
              onClick={() => switchMethod(m)}
              className={`paper-card px-3 py-2.5 text-left transition-all ${
                method === m
                  ? 'border-accent-gold bg-parchment-200'
                  : 'hover:border-ink/30 hover:bg-parchment-100'
              }`}
            >
              <div className="text-sm font-serif text-ink font-semibold">{label}</div>
              <div className="text-xs font-sans text-ink-muted">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Standard Array hint */}
      {method === 'standard' && (
        <p className="text-xs font-sans text-ink-muted">
          Assign values <strong className="text-ink">15 · 14 · 13 · 12 · 10 · 8</strong> to abilities.
        </p>
      )}

      {/* Point Buy budget bar */}
      {method === 'pointbuy' && (
        <div className="paper-card p-3 bg-parchment-100/60 flex items-center gap-4">
          <div>
            <span className="text-xs text-ink-muted font-sans">Remaining points</span>
            <div className={`text-2xl font-display font-bold ${remaining < 0 ? 'text-red-600' : 'text-ink'}`}>
              {remaining} <span className="text-sm font-sans font-normal text-ink-muted">/ {POINT_BUY_BUDGET}</span>
            </div>
          </div>
          <div className="text-xs text-ink-muted font-sans ml-auto leading-relaxed">
            8=0 · 9=1 · 10=2 · 11=3<br/>12=4 · 13=5 · 14=7 · 15=9
          </div>
        </div>
      )}

      {/* Roll pool */}
      {method === 'roll' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={rollAll}
              className="paper-card px-4 py-2 text-sm font-serif hover:bg-parchment-200 transition-colors text-ink"
            >
              Roll 6× (4d6 drop lowest)
            </button>
            {rollPool.length > 0 && (
              <span className="text-xs font-sans text-ink-muted">
                Total: <strong className="text-ink">{rollPool.reduce((a, b) => a + b, 0)}</strong>
              </span>
            )}
          </div>

          {rollPool.length > 0 && (
            <div className="paper-card p-3 bg-parchment-100/60">
              <div className="text-xs font-sans text-ink-muted mb-2 font-semibold">Roll results — assign them to abilities</div>
              <div className="flex flex-wrap gap-2">
                {rollPool.map((val, idx) => {
                  const isUsed = usedPoolIndices().has(idx)
                  return (
                    <div key={idx} className={`flex items-center gap-1 px-2.5 py-1 rounded border font-display text-base transition-all ${
                      isUsed
                        ? 'border-ink/10 text-ink-muted bg-parchment-100/40'
                        : 'border-accent-gold/60 text-ink bg-parchment-200'
                    }`}>
                      <span>{val}</span>
                      {!isUsed && (
                        <button
                          onClick={() => rerollOne(idx)}
                          className="text-xs text-ink-muted hover:text-ink ml-1 leading-none"
                          title="Reroll this die"
                        >↺</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ability grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ABILITIES.map(({ key, short }) => {
          const finalScore = character.abilityScores[key]
          const bonus = asiBonus(key)
          const baseScore = finalScore - bonus
          const mod = getAbilityModifier(finalScore)

          return (
            <div key={key} className="paper-card p-3 flex flex-col items-center gap-1.5">
              <div className="section-header text-center w-full border-0 pb-0 mb-0 text-xs">{short}</div>
              <div className="font-display text-4xl text-ink leading-none">{formatModifier(mod)}</div>
              <div className="text-xs text-ink-muted font-sans">
                {bonus > 0
                  ? <span>{baseScore} <span className="text-accent-gold">+{bonus}</span> = {finalScore}</span>
                  : <span>{finalScore}</span>
                }
              </div>

              {/* Standard Array */}
              {method === 'standard' && (
                <select
                  value={stdAssign[key] ?? ''}
                  onChange={e => assignStd(key, e.target.value ? Number(e.target.value) : null)}
                  className="field-box w-full text-center text-base font-display"
                >
                  <option value="">—</option>
                  {STANDARD_ARRAY.map(v => {
                    const taken = usedStdValues().includes(v) && stdAssign[key] !== v
                    return taken ? null : <option key={v} value={v}>{v}</option>
                  })}
                </select>
              )}

              {/* Point Buy */}
              {method === 'pointbuy' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => pbSetScore(key, baseScore - 1)}
                    disabled={baseScore <= 8}
                    className="w-9 h-9 rounded border border-ink/20 bg-parchment-100 text-ink-muted hover:text-ink hover:border-ink/40 text-lg leading-none transition-colors disabled:opacity-30"
                  >−</button>
                  <span className="w-10 text-center font-display text-2xl text-ink">{baseScore}</span>
                  <button
                    onClick={() => pbSetScore(key, baseScore + 1)}
                    disabled={baseScore >= 15 || remaining <= 0}
                    className="w-9 h-9 rounded border border-ink/20 bg-parchment-100 text-ink-muted hover:text-ink hover:border-ink/40 text-lg leading-none transition-colors disabled:opacity-30"
                  >+</button>
                </div>
              )}

              {/* Roll — assign from pool */}
              {method === 'roll' && (
                rollPool.length === 0
                  ? <span className="text-xs text-ink-muted font-sans italic">roll first</span>
                  : (
                    <select
                      value={rollAssign[key] ?? ''}
                      onChange={e => assignRoll(key, e.target.value !== '' ? Number(e.target.value) : null)}
                      className="field-box w-full text-center text-base font-display"
                    >
                      <option value="">—</option>
                      {rollPool.map((val, idx) => {
                        const takenByOther = usedPoolIndices().has(idx) && rollAssign[key] !== idx
                        return takenByOther ? null : (
                          <option key={idx} value={idx}>{val}</option>
                        )
                      })}
                    </select>
                  )
              )}

              {/* Manual */}
              {method === 'manual' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setScore(key, Math.max(1, baseScore - 1))}
                    className="w-9 h-9 rounded border border-ink/20 bg-parchment-100 text-ink-muted hover:text-ink hover:border-ink/40 text-xl leading-none transition-colors"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={baseScore}
                    onChange={e => setScore(key, Math.min(30, Math.max(1, Number(e.target.value))))}
                    className="w-16 h-11 text-center field-box font-display text-3xl py-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setScore(key, Math.min(30, baseScore + 1))}
                    className="w-9 h-9 rounded border border-ink/20 bg-parchment-100 text-ink-muted hover:text-ink hover:border-ink/40 text-xl leading-none transition-colors"
                  >+</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Background ASI picker */}
      {bgData ? (
        <div className="paper-card p-3 bg-parchment-100/60 space-y-2">
          <div className="text-xs font-sans font-semibold text-ink">
            Background ASI
            <span className="font-normal text-ink-muted ml-1">({bgData.name}) — +2 a +1 do:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-ink-muted font-sans mb-1">+2 do</div>
              <select
                value={asiPlusTwo}
                onChange={e => handleASIChange(e.target.value as AbilityName | '', asiPlusOne === e.target.value ? '' : asiPlusOne)}
                className="field-box w-full text-sm"
              >
                <option value="">— select —</option>
                {bgData.suggestedAbilities.map(ab => (
                  <option key={ab} value={ab} disabled={ab === asiPlusOne}>
                    {ab.slice(0,3).toUpperCase()} — {ab.charAt(0).toUpperCase() + ab.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-ink-muted font-sans mb-1">+1 do</div>
              <select
                value={asiPlusOne}
                onChange={e => handleASIChange(asiPlusTwo === e.target.value ? '' : asiPlusTwo, e.target.value as AbilityName | '')}
                className="field-box w-full text-sm"
              >
                <option value="">— select —</option>
                {bgData.suggestedAbilities.map(ab => (
                  <option key={ab} value={ab} disabled={ab === asiPlusTwo}>
                    {ab.slice(0,3).toUpperCase()} — {ab.charAt(0).toUpperCase() + ab.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(asiPlusTwo || asiPlusOne) && (
            <div className="text-xs text-ink font-sans">
              {asiPlusTwo && <span className="mr-3">{asiPlusTwo.slice(0,3).toUpperCase()} <strong>+2</strong></span>}
              {asiPlusOne && <span>{asiPlusOne.slice(0,3).toUpperCase()} <strong>+1</strong></span>}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-muted font-sans text-center italic">
          Select a background in Step 1, then assign bonus points (+2/+1) here.
        </p>
      )}
    </div>
  )
}
