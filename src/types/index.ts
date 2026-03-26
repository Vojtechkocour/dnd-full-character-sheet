// ─── Enums & Unions ───────────────────────────────────────────────────────────

export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

export type SkillName =
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleightOfHand'
  | 'stealth' | 'survival'

export type CharacterClass =
  | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter'
  | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer'
  | 'warlock' | 'wizard'

export type Alignment =
  | 'lawfulGood' | 'neutralGood' | 'chaoticGood'
  | 'lawfulNeutral' | 'trueNeutral' | 'chaoticNeutral'
  | 'lawfulEvil' | 'neutralEvil' | 'chaoticEvil'
  | 'unaligned'

export type DieSize = 4 | 6 | 8 | 10 | 12 | 20

export type ProficiencyLevel = 'none' | 'proficient' | 'expertise' | 'halfProficiency'

// ─── Ability Scores ───────────────────────────────────────────────────────────

export type AbilityScores = Record<AbilityName, number>

// ─── Skills ───────────────────────────────────────────────────────────────────

export type SkillProficiencies = Record<SkillName, ProficiencyLevel>

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  acrobatics: 'dexterity',
  animalHandling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
}

// ─── Combat ───────────────────────────────────────────────────────────────────

export interface HitPoints {
  maximum: number
  current: number
  temporary: number
}

export interface DeathSaves {
  successes: number  // 0–3
  failures: number   // 0–3
}

export interface HitDice {
  dieSize: DieSize
  total: number      // equals level
  remaining: number
}

// ─── Weapon Mastery (2024) ────────────────────────────────────────────────────

export type WeaponMastery =
  | 'cleave' | 'graze' | 'nick' | 'push' | 'sap'
  | 'slow' | 'topple' | 'vex'

export interface Weapon {
  id: string
  name: string
  attackBonus: number
  damageDice: string   // e.g. "1d8"
  damageBonus: number
  damageType: string
  properties: string[]
  mastery?: WeaponMastery
  notes?: string
}

// ─── Item Catalog Definitions (static data, not character inventory) ──────────

export interface WeaponDef {
  name: string
  damage: string
  damageType: string
  properties: string[]
  mastery: WeaponMastery
  category: 'simple-melee' | 'simple-ranged' | 'martial-melee' | 'martial-ranged'
  cost: string
  weight: number
  description: string
}

export interface ArmorDef {
  name: string
  type: 'light' | 'medium' | 'heavy' | 'shield'
  ac: string              // e.g. "11 + DEX", "14 + DEX (max 2)", "16", "+2"
  strengthReq?: number
  stealthDisadvantage?: boolean
  cost: string
  weight: number
  description: string
}

export interface GearDef {
  name: string
  cost?: string
  weight?: number
  description: string
}

// ─── Starting Equipment (used in class & background data) ─────────────────────

export type StartingItemCategory = 'weapon' | 'armor' | 'gear'

export interface StartingItemRef {
  type: StartingItemCategory
  name: string        // must match WeaponDef/ArmorDef/GearDef.name exactly; descriptive label when weaponChoice is set
  quantity?: number   // defaults to 1
  weaponChoice?: 'simple' | 'martial' | 'simple-melee' | 'simple-ranged' | 'martial-melee' | 'martial-ranged'
}

export interface StartingPackage {
  label: string               // e.g. "Chain Mail & Shield" or "110 GP"
  items: StartingItemRef[]
  currency?: Partial<Currency>
}

export interface ClassStartingEquipment {
  fixed: StartingItemRef[]    // always included regardless of choice
  choose?: StartingPackage[]  // pick exactly one
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export interface EquipmentItem {
  id: string
  name: string
  quantity: number
  weight?: number
  notes?: string
}

export interface Currency {
  cp: number  // copper
  sp: number  // silver
  ep: number  // electrum
  gp: number  // gold
  pp: number  // platinum
}

// ─── Features & Traits ────────────────────────────────────────────────────────

export interface Feature {
  id: string
  name: string
  source: string  // e.g. "Fighter 1", "Background: Soldier", "Feat: Alert"
  description: string
  usesMax?: number
  usesRemaining?: number
  recharge?: 'shortRest' | 'longRest' | 'dawn' | 'manual'
}

// ─── Origin / Background (2024) ───────────────────────────────────────────────

export interface Background2024 {
  name: string
  abilityScoreIncrease: Partial<AbilityScores>  // fixed ASI from background
  originFeat: string
  skillProficiencies: SkillName[]
  toolProficiency?: string
  languages: string[]
  equipment: string
  description?: string
}

// ─── Class Entry (supports multiclass) ───────────────────────────────────────

export interface ClassEntry {
  class: CharacterClass
  level: number
  subclass?: string
  hitDie: DieSize
}

// ─── Spellcasting ─────────────────────────────────────────────────────────────

export interface SpellcastingInfo {
  ability: AbilityName
  saveDC: number        // auto-calculated
  attackBonus: number   // auto-calculated
  knownSpells: string[] // spell IDs / names
  preparedSpells: string[]
}

// ─── Character ────────────────────────────────────────────────────────────────

export interface Character {
  id: string
  createdAt: string
  updatedAt: string

  // Identity
  name: string
  species: string           // 2024: "species" instead of "race"
  speciesId: string         // data key for species lookup
  speciesChoice?: string    // subspecies choice id (e.g. dragonborn ancestry, elf lineage)
  originFeatChoice?: string // for Human Versatile — chosen origin feat id
  featSkillChoices: SkillName[]   // skills chosen via Skilled feat (up to 3)
  classes: ClassEntry[]     // supports multiclass
  background: Background2024 | null
  alignment: Alignment
  xp: number
  inspiration: boolean

  // Ability Scores (before racial/background bonuses — stored as base values)
  abilityScores: AbilityScores

  // Combat
  armorClass: number
  speed: number
  initiative: number        // auto-calculated (can override)
  hitPoints: HitPoints
  deathSaves: DeathSaves
  hitDice: HitDice[]        // one entry per class

  // Proficiencies
  savingThrows: Record<AbilityName, ProficiencyLevel>
  skills: SkillProficiencies
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
  toolNotes: Record<string, string>  // custom note per tool (keyed by tool name)
  bgToolChoice: string       // resolved bg tool choice ('' if bg has no choice or not yet chosen)
  classToolChoices: string[] // resolved class tool choice slots (index matches toolChoices array)
  languages: string[]

  // Attacks & Equipment
  weapons: Weapon[]
  equipment: EquipmentItem[]
  currency: Currency

  // Features
  features: Feature[]

  // Spellcasting (optional — only for casters)
  spellcasting?: SpellcastingInfo

  // Personality
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
  appearance: string
  age: string
  height: string
  weight: string
  eyes: string
  skin: string
  hair: string
}

// ─── Calculated Stats ────────────────────────────────────────────────────────

export interface CalculatedStats {
  totalLevel: number
  proficiencyBonus: number
  abilityModifiers: Record<AbilityName, number>
  passivePerception: number
  passiveInsight: number
  passiveInvestigation: number
  spellSaveDC?: number
  spellAttackBonus?: number
}
