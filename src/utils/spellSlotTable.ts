import type { CharacterClass } from '../types'

// PHB 2024 Spell Slot Tables
// Index = character level - 1 (so index 0 = level 1, index 19 = level 20)

export type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface SpellSlotLevel {
  level: SpellLevel
  total: number
  used: number
}

export type SpellSlots = Record<SpellLevel, SpellSlotLevel>

export interface PactSlots {
  level: SpellLevel
  total: number
  used: number
}

type SlotRow = [number, number, number, number, number, number, number, number, number]

const FULL_CASTER: SlotRow[] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

const HALF_CASTER: SlotRow[] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0],
]

export const ARTIFICER_CASTER: SlotRow[] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0],
]

const WARLOCK_PACT: [SpellLevel, number][] = [
  [1, 1], [1, 2], [2, 2], [2, 2], [3, 2], [3, 2], [4, 2], [4, 2],
  [5, 2], [5, 2], [5, 3], [5, 3], [5, 3], [5, 3], [5, 3], [5, 3],
  [5, 4], [5, 4], [5, 4], [5, 4],
]

function rowToSpellSlots(row: SlotRow): SpellSlots {
  const slots = {} as SpellSlots
  for (let i = 0; i < 9; i++) {
    const level = (i + 1) as SpellLevel
    slots[level] = { level, total: row[i], used: 0 }
  }
  return slots
}

export function getSlotsForCharacter(cls: CharacterClass, characterLevel: number): SpellSlots {
  const idx = Math.max(0, Math.min(19, characterLevel - 1))
  switch (cls) {
    case 'bard': case 'cleric': case 'druid': case 'sorcerer': case 'wizard':
      return rowToSpellSlots(FULL_CASTER[idx])
    case 'paladin': case 'ranger':
      return rowToSpellSlots(HALF_CASTER[idx])
    case 'warlock':
      return rowToSpellSlots([0, 0, 0, 0, 0, 0, 0, 0, 0])
    default:
      return rowToSpellSlots([0, 0, 0, 0, 0, 0, 0, 0, 0])
  }
}

export function getPactSlotsForWarlock(characterLevel: number): PactSlots {
  const idx = Math.max(0, Math.min(19, characterLevel - 1))
  const [slotLevel, total] = WARLOCK_PACT[idx]
  return { level: slotLevel, total, used: 0 }
}

export function isWarlock(cls: CharacterClass): boolean {
  return cls === 'warlock'
}

export function isCaster(cls: CharacterClass): boolean {
  return ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'].includes(cls)
}
