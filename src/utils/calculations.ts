import type { AbilityScores, AbilityName, SkillName, SkillProficiencies, Character, CalculatedStats } from '@/types'
import { SKILL_ABILITY_MAP } from '@/types'

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getProficiencyBonus(totalLevel: number): number {
  return Math.ceil(totalLevel / 4) + 1
}

export function getTotalLevel(character: Character): number {
  return character.classes.reduce((sum, c) => sum + c.level, 0)
}

export function getSkillBonus(
  skillName: SkillName,
  proficiency: SkillProficiencies[SkillName],
  abilityScores: AbilityScores,
  profBonus: number
): number {
  const ability = SKILL_ABILITY_MAP[skillName]
  const mod = getAbilityModifier(abilityScores[ability])

  switch (proficiency) {
    case 'proficient':    return mod + profBonus
    case 'expertise':     return mod + profBonus * 2
    case 'halfProficiency': return mod + Math.floor(profBonus / 2)
    default:              return mod
  }
}

export function getSavingThrowBonus(
  ability: AbilityName,
  proficiency: 'none' | 'proficient' | 'expertise' | 'halfProficiency',
  abilityScores: AbilityScores,
  profBonus: number
): number {
  const mod = getAbilityModifier(abilityScores[ability])
  switch (proficiency) {
    case 'proficient': return mod + profBonus
    case 'expertise':  return mod + profBonus * 2
    default:           return mod
  }
}

export function calculateStats(character: Character): CalculatedStats {
  const totalLevel = getTotalLevel(character)
  const proficiencyBonus = getProficiencyBonus(totalLevel)

  const abilityModifiers = Object.fromEntries(
    Object.entries(character.abilityScores).map(([key, val]) => [
      key,
      getAbilityModifier(val),
    ])
  ) as Record<AbilityName, number>

  const passivePerception =
    10 +
    getSkillBonus('perception', character.skills.perception, character.abilityScores, proficiencyBonus)

  const passiveInsight =
    10 +
    getSkillBonus('insight', character.skills.insight, character.abilityScores, proficiencyBonus)

  const passiveInvestigation =
    10 +
    getSkillBonus('investigation', character.skills.investigation, character.abilityScores, proficiencyBonus)

  let spellSaveDC: number | undefined
  let spellAttackBonus: number | undefined
  if (character.spellcasting) {
    const spellMod = abilityModifiers[character.spellcasting.ability]
    spellSaveDC = 8 + proficiencyBonus + spellMod
    spellAttackBonus = proficiencyBonus + spellMod
  }

  return {
    totalLevel,
    proficiencyBonus,
    abilityModifiers,
    passivePerception,
    passiveInsight,
    passiveInvestigation,
    spellSaveDC,
    spellAttackBonus,
  }
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}
