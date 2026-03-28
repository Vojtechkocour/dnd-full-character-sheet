import type { SkillName, SpellGrantDef } from '@/types'

// ─── Artisan Tools ────────────────────────────────────────────────────────────

export const ARTISAN_TOOLS = [
  "Alchemist's Supplies",
  "Brewer's Supplies",
  "Calligrapher's Supplies",
  "Carpenter's Tools",
  "Cartographer's Tools",
  "Cobbler's Tools",
  "Cook's Utensils",
  "Glassblower's Tools",
  "Jeweler's Tools",
  "Leatherworker's Tools",
  "Mason's Tools",
  "Painter's Supplies",
  "Potter's Tools",
  "Smith's Tools",
  "Tinker's Tools",
  "Weaver's Tools",
  "Woodcarver's Tools",
] as const

export const INSTRUMENTS = [
  'Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Horn',
  'Lute', 'Lyre', 'Pan Flute', 'Shawm', 'Viol',
] as const

export const GAMING_SETS = [
  'Chess Set', 'Dice Set', 'Playing Card Set', "Three-Dragon Ante Set",
] as const

export const ALL_SKILLS: SkillName[] = [
  'acrobatics', 'animalHandling', 'arcana', 'athletics',
  'deception', 'history', 'insight', 'intimidation',
  'investigation', 'medicine', 'nature', 'perception',
  'performance', 'persuasion', 'religion', 'sleightOfHand',
  'stealth', 'survival',
]

// ─── Feat types ───────────────────────────────────────────────────────────────

export type FeatChoiceType = 'skills' | 'tools' | 'instrument'

export interface FeatChoiceDef {
  type: FeatChoiceType
  count: number                // how many to pick
  label: string                // e.g. "Vyber 3 skills"
  options?: readonly string[]  // for tools/instruments; if omitted = all skills
}

export interface OriginFeatDef {
  id: string
  name: string
  description: string
  /** Additional note shown when feat needs complex choice (e.g. spells) */
  complexNote?: string
  choice?: FeatChoiceDef
  spellGrants?: SpellGrantDef[]
}

// ─── Origin Feats (2024 PHB) ──────────────────────────────────────────────────

export const ORIGIN_FEATS: OriginFeatDef[] = [
  {
    id: 'alert',
    name: 'Alert',
    description: 'You add your Proficiency Bonus to initiative. You can\'t be Surprised while conscious.',
  },
  {
    id: 'crafter',
    name: 'Crafter',
    description: 'You gain proficiency with three Artisan\'s Tools of your choice. When crafting nonmagical items, you work twice as fast and reduce costs by 20%.',
    choice: {
      type: 'tools',
      count: 3,
      label: 'Choose 3 Artisan\'s Tools',
      options: ARTISAN_TOOLS,
    },
  },
  {
    id: 'healer',
    name: 'Healer',
    description: 'When you use a Healer\'s Kit on a creature with 0 HP, you stabilize it and it regains 1d6 + 4 HP. Each creature can only be healed this way once per Long Rest.',
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'You have 3 Luck Points (restored on Long Rest). Before a d20 roll for Attack/Check/Save, you can spend 1 point to roll an extra d20 — use the higher result.',
  },
  {
    id: 'magic_initiate_cleric',
    name: 'Magic Initiate (Cleric)',
    description: 'You learn 2 cantrips and 1 1st-level spell from the Cleric list. You can cast this spell once per Long Rest (without a slot). Spellcasting ability: Wisdom.',
    spellGrants: [
      { count: 2, spellClass: 'cleric', maxLevel: 0, label: 'Choose 2 Cleric cantrips' },
      { count: 1, spellClass: 'cleric', maxLevel: 1, label: 'Choose 1 Cleric 1st-level spell' },
    ],
  },
  {
    id: 'magic_initiate_druid',
    name: 'Magic Initiate (Druid)',
    description: 'You learn 2 cantrips and 1 1st-level spell from the Druid list. You can cast this spell once per Long Rest (without a slot). Spellcasting ability: Wisdom.',
    spellGrants: [
      { count: 2, spellClass: 'druid', maxLevel: 0, label: 'Choose 2 Druid cantrips' },
      { count: 1, spellClass: 'druid', maxLevel: 1, label: 'Choose 1 Druid 1st-level spell' },
    ],
  },
  {
    id: 'magic_initiate_wizard',
    name: 'Magic Initiate (Wizard)',
    description: 'You learn 2 cantrips and 1 1st-level spell from the Wizard list. You can cast this spell once per Long Rest (without a slot). Spellcasting ability: Intelligence.',
    spellGrants: [
      { count: 2, spellClass: 'wizard', maxLevel: 0, label: 'Choose 2 Wizard cantrips' },
      { count: 1, spellClass: 'wizard', maxLevel: 1, label: 'Choose 1 Wizard 1st-level spell' },
    ],
  },
  {
    id: 'performer',
    name: 'Performer',
    description: 'You gain proficiency with one musical instrument of your choice. You have advantage on Charisma (Performance) checks when playing that instrument.',
    choice: {
      type: 'instrument',
      count: 1,
      label: 'Choose a musical instrument',
      options: INSTRUMENTS,
    },
  },
  {
    id: 'savage_attacker',
    name: 'Savage Attacker',
    description: 'Once per turn, when you hit with a weapon attack, you can reroll the damage dice and use the higher result.',
  },
  {
    id: 'skilled',
    name: 'Skilled',
    description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    choice: {
      type: 'skills',
      count: 3,
      label: 'Choose 3 skills',
    },
  },
  {
    id: 'tavern_brawler',
    name: 'Tavern Brawler',
    description: 'Your unarmed strikes deal 1d4 + STR damage. When you hit with an improvised weapon or unarmed strike, you can use a Bonus Action to grapple an adjacent creature.',
  },
  {
    id: 'tough',
    name: 'Tough',
    description: 'Your HP maximum increases by 2 for every level (retroactive from level 1). Each level-up grants 2 extra HP.',
  },
]

export function getFeatById(id: string): OriginFeatDef | undefined {
  return ORIGIN_FEATS.find(f => f.id === id)
}
