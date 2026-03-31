import { v4 as uuidv4 } from 'uuid'
import type { Character, SkillName, AbilityName } from '@/types'
import { ALL_SKILLS } from '@/data/feats'
import type { OriginFeatDef } from '@/data/feats'

export interface FeatChoices {
  skillChoices?: SkillName[]
  toolChoices?: string[]
  instrumentChoice?: string
  /** Ability name (for abilityScore choice type) or element string (for element choice type) */
  abilityChoice?: string
}

export function applyFeatToCharacter(
  character: Character,
  feat: OriginFeatDef,
  choices: FeatChoices,
  newLevel: number,
): Partial<Character> {
  const featDisplayName = feat.id === 'elemental_adept' && choices.abilityChoice
    ? `${feat.name} (${choices.abilityChoice})`
    : feat.name

  const newFeature: import('@/types').Feature = {
    id: uuidv4(),
    name: featDisplayName,
    source: `Feat: ${featDisplayName}`,
    description: feat.description,
  }

  const patch: Partial<Character> = {
    features: [...character.features, newFeature],
    takenFeatIds: [...(character.takenFeatIds ?? []), feat.id],
  }

  // ── Fixed ability score bonus ─────────────────────────────────────────────

  if (feat.fixedAbilityBonus) {
    const scores = { ...character.abilityScores }
    scores[feat.fixedAbilityBonus] = Math.min(20, scores[feat.fixedAbilityBonus] + 1)
    patch.abilityScores = scores
  }

  // ── Choice-based ability score bonus ─────────────────────────────────────

  if (feat.choice?.type === 'abilityScore' && choices.abilityChoice) {
    const ability = choices.abilityChoice as AbilityName
    const scores = { ...(patch.abilityScores ?? character.abilityScores) }
    scores[ability] = Math.min(20, scores[ability] + 1)
    patch.abilityScores = scores
  }

  // ── Origin feat effects ───────────────────────────────────────────────────

  if (feat.id === 'skilled' && choices.skillChoices?.length) {
    const updatedSkills = { ...character.skills }
    for (const skill of choices.skillChoices) {
      if (updatedSkills[skill] === 'none') {
        updatedSkills[skill] = 'proficient'
      }
    }
    patch.skills = updatedSkills
  }

  if (feat.id === 'crafter' && choices.toolChoices?.length) {
    const existing = new Set(character.toolProficiencies)
    patch.toolProficiencies = [...character.toolProficiencies, ...choices.toolChoices.filter(t => !existing.has(t))]
  }

  if (feat.id === 'performer' && choices.instrumentChoice) {
    const existing = new Set(character.toolProficiencies)
    if (!existing.has(choices.instrumentChoice)) {
      patch.toolProficiencies = [...character.toolProficiencies, choices.instrumentChoice]
    }
  }

  if (feat.id === 'tough') {
    const bonus = 2 * newLevel
    patch.hitPoints = {
      ...character.hitPoints,
      maximum: character.hitPoints.maximum + bonus,
      current: character.hitPoints.current + bonus,
    }
  }

  // ── General feat effects ──────────────────────────────────────────────────

  if (feat.id === 'resilient' && choices.abilityChoice) {
    const ability = choices.abilityChoice as AbilityName
    const updatedSavingThrows = { ...character.savingThrows }
    if (updatedSavingThrows[ability] === 'none') {
      updatedSavingThrows[ability] = 'proficient'
    }
    patch.savingThrows = updatedSavingThrows
  }

  if (feat.id === 'heavily_armored') {
    const existing = new Set(character.armorProficiencies)
    if (!existing.has('Heavy')) {
      patch.armorProficiencies = [...character.armorProficiencies, 'Heavy']
    }
  }

  if (feat.id === 'moderately_armored') {
    const existing = new Set(character.armorProficiencies)
    const toAdd = ['Medium', 'Shield'].filter(a => !existing.has(a))
    if (toAdd.length) patch.armorProficiencies = [...character.armorProficiencies, ...toAdd]
  }

  if (feat.id === 'lightly_armored') {
    const existing = new Set(character.armorProficiencies)
    const toAdd = ['Light', 'Shield'].filter(a => !existing.has(a))
    if (toAdd.length) patch.armorProficiencies = [...character.armorProficiencies, ...toAdd]
  }

  if (feat.id === 'speedy') {
    patch.speed = character.speed + 10
  }

  // ── Epic Boon effects ─────────────────────────────────────────────────────

  if (feat.id === 'boon_of_fortitude') {
    patch.hitPoints = {
      ...character.hitPoints,
      maximum: character.hitPoints.maximum + 40,
      current: character.hitPoints.current + 40,
    }
  }

  if (feat.id === 'boon_of_skill') {
    const updatedSkills = { ...character.skills }
    for (const skill of ALL_SKILLS as SkillName[]) {
      if (updatedSkills[skill] === 'none') updatedSkills[skill] = 'proficient'
    }
    patch.skills = updatedSkills
  }

  if (feat.id === 'boon_of_speed') {
    patch.speed = character.speed + 30
  }

  return patch
}
