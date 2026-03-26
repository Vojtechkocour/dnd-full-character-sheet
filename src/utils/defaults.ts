import { v4 as uuidv4 } from 'uuid'
import type { Character, AbilityScores, SkillProficiencies, AbilityName } from '@/types'

export function defaultAbilityScores(): AbilityScores {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  }
}

export function defaultSkills(): SkillProficiencies {
  return {
    acrobatics: 'none',
    animalHandling: 'none',
    arcana: 'none',
    athletics: 'none',
    deception: 'none',
    history: 'none',
    insight: 'none',
    intimidation: 'none',
    investigation: 'none',
    medicine: 'none',
    nature: 'none',
    perception: 'none',
    performance: 'none',
    persuasion: 'none',
    religion: 'none',
    sleightOfHand: 'none',
    stealth: 'none',
    survival: 'none',
  }
}

export function defaultSavingThrows(): Record<AbilityName, 'none' | 'proficient' | 'expertise' | 'halfProficiency'> {
  return {
    strength: 'none',
    dexterity: 'none',
    constitution: 'none',
    intelligence: 'none',
    wisdom: 'none',
    charisma: 'none',
  }
}

export function createNewCharacter(name = 'Unnamed Hero'): Character {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,

    name,
    species: '',
    speciesId: '',
    speciesChoice: undefined,
    originFeatChoice: undefined,
    featSkillChoices: [],
    classes: [],
    background: null,
    alignment: 'trueNeutral',
    xp: 0,
    inspiration: false,

    abilityScores: defaultAbilityScores(),

    armorClass: 10,
    speed: 30,
    initiative: 0,
    hitPoints: { maximum: 0, current: 0, temporary: 0 },
    deathSaves: { successes: 0, failures: 0 },
    hitDice: [],

    savingThrows: defaultSavingThrows(),
    skills: defaultSkills(),
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    toolNotes: {},
    bgToolChoice: '',
    classToolChoices: [],
    languages: [],

    weapons: [],
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },

    features: [],

    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    appearance: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
  }
}
