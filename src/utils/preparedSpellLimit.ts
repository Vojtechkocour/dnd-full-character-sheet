import type { CharacterClass } from '../types'

interface SpellCharacter {
  class: CharacterClass
  level: number
  spellcastingModifier?: number
}

const MAX_SPELL_LEVEL: Record<CharacterClass, number[]> = {
  bard:     [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  cleric:   [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  druid:    [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  sorcerer: [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  wizard:   [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9,9],
  paladin:  [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5],
  ranger:   [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5],
  warlock:  [1,2,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5],
  barbarian:Array(20).fill(0),
  fighter:  Array(20).fill(0),
  monk:     Array(20).fill(0),
  rogue:    Array(20).fill(0),
}

export function getMaxSpellLevel(character: SpellCharacter): number {
  const table = MAX_SPELL_LEVEL[character.class]
  if (!table) return 0
  return table[Math.min(character.level, 20) - 1]
}

const CANTRIP_LIMITS: Partial<Record<CharacterClass, number[]>> = {
  bard:      [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  cleric:    [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  druid:     [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  paladin:   Array(20).fill(2),
  ranger:    Array(20).fill(2),
  sorcerer:  [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
  warlock:   [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  wizard:    [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
}

const SPELLS_KNOWN: Partial<Record<CharacterClass, number[]>> = {
  bard:    [4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,16,16,16,17],
  sorcerer:[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
  warlock: [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],
  ranger:  [2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,10,11,11],
}

export function getMaxCantrips(character: SpellCharacter): number | null {
  const table = CANTRIP_LIMITS[character.class]
  if (!table) return null
  return table[Math.min(character.level, 20) - 1]
}

export function getMaxPreparedLeveledSpells(character: SpellCharacter): number | null {
  const cls = character.class
  const level = Math.min(character.level, 20)
  const mod = character.spellcastingModifier ?? 3

  if (cls in (SPELLS_KNOWN as object)) {
    const table = SPELLS_KNOWN[cls as keyof typeof SPELLS_KNOWN]!
    return table[level - 1]
  }

  switch (cls) {
    case 'cleric': case 'druid': case 'wizard':
      return Math.max(1, mod + level)
    case 'paladin':
      return Math.max(1, mod + Math.floor(level / 2))
    default:
      return null
  }
}
