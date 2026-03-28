import { v4 as uuidv4 } from 'uuid'
import type { Character, SkillName } from '@/types'
import type { OriginFeatDef } from '@/data/feats'

export interface FeatChoices {
  skillChoices?: SkillName[]
  toolChoices?: string[]
  instrumentChoice?: string
}

export function applyFeatToCharacter(
  character: Character,
  feat: OriginFeatDef,
  choices: FeatChoices,
  newLevel: number,
): Partial<Character> {
  const newFeature: import('@/types').Feature = {
    id: uuidv4(),
    name: feat.name,
    source: `Feat: ${feat.name}`,
    description: feat.description,
  }

  const patch: Partial<Character> = {
    features: [...character.features, newFeature],
    takenFeatIds: [...(character.takenFeatIds ?? []), feat.id],
  }

  // ── Feat-specific effects ─────────────────────────────────────────────────

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

  return patch
}
