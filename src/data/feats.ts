import type { SkillName, AbilityName, SpellGrantDef } from '@/types'

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

export type FeatCategory = 'origin' | 'general' | 'epicBoon'

export type FeatChoiceType = 'skills' | 'tools' | 'instrument' | 'abilityScore' | 'element'

export interface FeatChoiceDef {
  type: FeatChoiceType
  count: number                // how many to pick
  label: string                // e.g. "Vyber 3 skills"
  options?: readonly string[]  // for tools/instruments/abilityScore; if omitted = all skills
}

export interface OriginFeatDef {
  id: string
  name: string
  category?: FeatCategory      // defaults to 'origin' if omitted
  description: string
  /** Additional note shown when feat needs complex choice (e.g. spells) */
  complexNote?: string
  choice?: FeatChoiceDef
  spellGrants?: SpellGrantDef[]
  /** Auto-applied +1 to this ability — no player choice needed */
  fixedAbilityBonus?: AbilityName
  /** Feat can be taken multiple times (e.g. Elemental Adept) */
  repeatable?: boolean
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

// ─── General Feats (PHB 2024) ──────────────────────────────────────────────────

const ALL_ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const

export const GENERAL_FEATS: OriginFeatDef[] = [
  // A
  {
    id: 'actor',
    name: 'Actor',
    category: 'general',
    description: 'You can mimic the voice and mannerisms of creatures you\'ve heard for 1+ minute. Advantage on Deception and Performance checks when impersonating a person or creature.',
    fixedAbilityBonus: 'charisma',
  },
  {
    id: 'athlete',
    name: 'Athlete',
    category: 'general',
    description: 'Climbing doesn\'t cost extra movement. Standing up from prone costs only 5 ft. of movement. Long jumps don\'t require a running start.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength, Dexterity, or Constitution', options: ['strength', 'dexterity', 'constitution'] },
  },

  // C
  {
    id: 'charger',
    name: 'Charger',
    category: 'general',
    description: 'You can take the Dash action as a Bonus Action. When you Dash and then make a melee weapon attack on the same turn, you can deal +1d8 damage or push the target 10 ft.',
  },
  {
    id: 'crossbow_expert',
    name: 'Crossbow Expert',
    category: 'general',
    description: 'Ignore the Loading property of crossbows. Being within 5 ft. of a hostile creature doesn\'t impose Disadvantage on ranged attack rolls. Bonus Action: attack with a Hand Crossbow after using your Attack action.',
  },
  {
    id: 'crusher',
    name: 'Crusher',
    category: 'general',
    description: 'When you deal bludgeoning damage, you can push the target 5 ft. to an unoccupied space (once per turn). On a critical hit, the next attack against that target before the end of your next turn has Advantage.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength or Constitution', options: ['strength', 'constitution'] },
  },

  // D
  {
    id: 'defense',
    name: 'Defense',
    category: 'general',
    description: 'While you are wearing armor, you gain a +1 bonus to Armor Class.',
  },
  {
    id: 'dual_wielder',
    name: 'Dual Wielder',
    category: 'general',
    description: 'While holding a weapon in each hand: +1 AC. You can use two-weapon fighting even if the weapons aren\'t Light. Draw or stow two one-handed weapons when you would normally draw or stow one.',
  },
  {
    id: 'dungeon_delver',
    name: 'Dungeon Delver',
    category: 'general',
    description: 'Advantage on Perception and Investigation checks made to detect the presence of secret doors and traps. Resistance to damage dealt by traps. Difficult terrain from traps doesn\'t slow you.',
  },
  {
    id: 'durable',
    name: 'Durable',
    category: 'general',
    description: 'When you roll Hit Dice to regain HP, the minimum HP you can regain from any die is twice your Constitution modifier (minimum 2).',
    fixedAbilityBonus: 'constitution',
  },

  // E
  {
    id: 'elemental_adept',
    name: 'Elemental Adept',
    category: 'general',
    description: 'Your spells ignore resistance to the chosen damage type. When you roll damage of that type, treat any 1 on a damage die as a 2.',
    choice: { type: 'element', count: 1, label: 'Choose a damage type', options: ['Acid', 'Cold', 'Fire', 'Lightning', 'Thunder'] },
    complexNote: 'Can be taken multiple times, choosing a different damage type each time.',
    repeatable: true,
  },

  // F
  {
    id: 'fey_touched',
    name: 'Fey Touched',
    category: 'general',
    description: 'You learn Misty Step and one 1st-level Divination or Enchantment spell of your choice. You can cast each of these spells once per Long Rest without expending a spell slot. Your spellcasting ability for them is INT, WIS, or CHA.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Intelligence, Wisdom, or Charisma', options: ['intelligence', 'wisdom', 'charisma'] },
    complexNote: 'After applying, go to Origin Spells to select your bonus spell.',
    spellGrants: [
      { count: 1, spellClass: 'wizard', maxLevel: 1, label: 'Choose 1 Divination or Enchantment 1st-level spell' },
    ],
  },

  // G
  {
    id: 'grappler',
    name: 'Grappler',
    category: 'general',
    description: 'You have Advantage on attack rolls against a creature you are Grappling. As a Bonus Action, you can try to restrain a Grappled creature (contested STR check). A restrained creature is freed if you are no longer Grappling it.',
  },
  {
    id: 'great_weapon_master',
    name: 'Great Weapon Master',
    category: 'general',
    description: 'When you score a critical hit or reduce a creature to 0 HP with a Heavy weapon, you can make one melee weapon attack as a Bonus Action. You can take a −5 penalty to attack rolls made with Heavy weapons to deal +10 damage on a hit.',
  },

  // H
  {
    id: 'heavily_armored',
    name: 'Heavily Armored',
    category: 'general',
    description: 'You gain proficiency with Heavy armor.',
    fixedAbilityBonus: 'strength',
  },
  {
    id: 'heavy_armor_master',
    name: 'Heavy Armor Master',
    category: 'general',
    description: 'While wearing Heavy armor, bludgeoning, piercing, and slashing damage from nonmagical attacks is reduced by 3.',
  },

  // I
  {
    id: 'inspiring_leader',
    name: 'Inspiring Leader',
    category: 'general',
    description: 'After a Short or Long Rest, spend 10 minutes to give an inspiring speech. Up to 6 creatures who can see and hear you each gain Temporary HP equal to your level + your Charisma modifier.',
  },

  // K
  {
    id: 'keen_mind',
    name: 'Keen Mind',
    category: 'general',
    description: 'You can accurately recall anything you\'ve seen or heard within the past month. You have Advantage on checks to detect illusions and determine whether something is an illusion.',
    fixedAbilityBonus: 'intelligence',
  },

  // L
  {
    id: 'lightly_armored',
    name: 'Lightly Armored',
    category: 'general',
    description: 'You gain proficiency with Light armor and Shields.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength or Dexterity', options: ['strength', 'dexterity'] },
  },

  // M
  {
    id: 'mage_slayer',
    name: 'Mage Slayer',
    category: 'general',
    description: 'When a creature within 5 ft. casts a spell, you can use your Reaction to make a melee weapon attack against it. Creatures you have damaged must make Concentration saves with Disadvantage.',
  },
  {
    id: 'martial_weapon_training',
    name: 'Martial Weapon Training',
    category: 'general',
    description: 'You gain proficiency with all Martial weapons.',
  },
  {
    id: 'medium_armor_master',
    name: 'Medium Armor Master',
    category: 'general',
    description: 'Wearing Medium armor doesn\'t impose Disadvantage on Stealth checks. Your maximum Dexterity bonus to AC from Medium armor increases to +3.',
  },
  {
    id: 'moderately_armored',
    name: 'Moderately Armored',
    category: 'general',
    description: 'You gain proficiency with Medium armor and Shields.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength or Dexterity', options: ['strength', 'dexterity'] },
  },
  {
    id: 'mounted_combatant',
    name: 'Mounted Combatant',
    category: 'general',
    description: 'Advantage on melee attack rolls against unmounted creatures smaller than your mount. Force any attack targeting your mount to target you instead. On a successful Dex save your mount takes no damage from area effects; half on a fail.',
  },

  // O
  {
    id: 'observant',
    name: 'Observant',
    category: 'general',
    description: 'If you can see a creature\'s mouth while it speaks, you can read its lips and understand what it says. Your Passive Perception and Passive Investigation scores each increase by 5.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Intelligence or Wisdom', options: ['intelligence', 'wisdom'] },
  },

  // P
  {
    id: 'piercer',
    name: 'Piercer',
    category: 'general',
    description: 'Once per turn when you deal piercing damage you can reroll one damage die and use either result. When you score a critical hit dealing piercing damage, roll one additional damage die.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength or Dexterity', options: ['strength', 'dexterity'] },
  },
  {
    id: 'poisoner',
    name: 'Poisoner',
    category: 'general',
    description: 'You ignore resistance to poison damage. Bonus Action: coat a weapon or up to 3 pieces of ammunition with potent poison (lasts 1 minute). Next creature hit takes +2d8 poison damage (DC 14 CON save or Poisoned until end of your next turn).',
  },
  {
    id: 'polearm_master',
    name: 'Polearm Master',
    category: 'general',
    description: 'Bonus Action: attack with the butt of a glaive, halberd, pike, quarterstaff, or spear (1d4 bludgeoning + ability mod). Reaction: make an opportunity attack when a creature enters your reach.',
  },

  // R
  {
    id: 'resilient',
    name: 'Resilient',
    category: 'general',
    description: 'Choose one ability score. You gain +1 to that ability and proficiency in saving throws using that ability.',
    choice: { type: 'abilityScore', count: 1, label: '+1 and saving throw proficiency in chosen ability', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'ritual_caster',
    name: 'Ritual Caster',
    category: 'general',
    description: 'You acquire a ritual book with 2 ritual spells from any class list. You can cast them as rituals (adding 10 minutes). When you find a spell scroll of a ritual spell, you can add it to your book.',
    complexNote: 'Track your ritual spells in the Notes or Features tab.',
  },

  // S
  {
    id: 'sentinel',
    name: 'Sentinel',
    category: 'general',
    description: 'Your opportunity attacks stop the target\'s movement (speed becomes 0). You can make an opportunity attack when a creature within 5 ft. attacks an ally. Creatures can\'t Disengage to avoid your opportunity attacks.',
  },
  {
    id: 'shadow_touched',
    name: 'Shadow Touched',
    category: 'general',
    description: 'You learn Invisibility and one 1st-level Illusion or Necromancy spell. You can cast each once per Long Rest without a spell slot. Spellcasting ability is INT, WIS, or CHA (your choice).',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Intelligence, Wisdom, or Charisma', options: ['intelligence', 'wisdom', 'charisma'] },
    complexNote: 'After applying, go to Origin Spells to select your bonus spell.',
    spellGrants: [
      { count: 1, spellClass: 'wizard', maxLevel: 1, label: 'Choose 1 Illusion or Necromancy 1st-level spell' },
    ],
  },
  {
    id: 'shield_master',
    name: 'Shield Master',
    category: 'general',
    description: 'Bonus Action: shove a creature within 5 ft. when you take the Attack action. Add your shield\'s AC bonus to Dex saves against spells targeting only you. No damage on a successful Dex save against area effects (half on fail).',
  },
  {
    id: 'skulker',
    name: 'Skulker',
    category: 'general',
    description: 'You can try to Hide when only lightly obscured. Missing with a ranged attack while Hidden doesn\'t reveal your position. Dim light doesn\'t impose Disadvantage on your Perception checks.',
  },
  {
    id: 'slasher',
    name: 'Slasher',
    category: 'general',
    description: 'When you deal slashing damage, reduce the target\'s speed by 10 ft. until the start of your next turn. On a critical hit, the target has Disadvantage on its attack rolls until the start of your next turn.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength or Dexterity', options: ['strength', 'dexterity'] },
  },
  {
    id: 'speedy',
    name: 'Speedy',
    category: 'general',
    description: 'Your Speed increases by 10 ft. You don\'t provoke Opportunity Attacks when you take the Dash action. Bonus Action: take the Dash action when you take the Attack or Magic action.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Dexterity or Constitution', options: ['dexterity', 'constitution'] },
  },
  {
    id: 'spell_sniper',
    name: 'Spell Sniper',
    category: 'general',
    description: 'The range of your spell attack rolls doubles. Your spell attacks ignore Half Cover and Three-Quarters Cover. You learn one cantrip that requires an attack roll from any class\'s spell list.',
    complexNote: 'Note your chosen cantrip in the Spells or Notes tab.',
  },

  // T
  {
    id: 'telekinetic',
    name: 'Telekinetic',
    category: 'general',
    description: 'You learn or enhance Mage Hand (invisible, 60 ft. range, usable as Bonus Action). Bonus Action: telekinetically shove a creature within 30 ft. up to 5 ft. in any direction (STR save DC 8 + prof bonus + spellcasting ability mod).',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'telepathic',
    name: 'Telepathic',
    category: 'general',
    description: 'You can speak telepathically to any creature within 60 ft. that understands at least one language. You can cast Detect Thoughts once per Long Rest without expending a spell slot.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },

  // W
  {
    id: 'war_caster',
    name: 'War Caster',
    category: 'general',
    description: 'Advantage on CON saves to maintain Concentration. You can perform somatic components even with weapons or a shield in hand. You can cast a spell (1-action casting time) as your Opportunity Attack.',
  },
  {
    id: 'weapon_master',
    name: 'Weapon Master',
    category: 'general',
    description: 'You gain proficiency with 4 weapons of your choice (Simple or Martial). When you attack with a weapon you\'re proficient with, you can add your proficiency bonus to the damage roll once per turn.',
    complexNote: 'Note your chosen weapon proficiencies in the Equipment or Notes tab.',
  },
]

// ─── Epic Boon Feats (PHB 2024) ──────────────────────────────────────────────

export const EPIC_BOON_FEATS: OriginFeatDef[] = [
  {
    id: 'boon_of_combat_prowess',
    name: 'Boon of Combat Prowess',
    category: 'epicBoon',
    description: 'When you miss with a melee attack roll, you can make it hit instead. Once you use this feature, you can\'t use it again until the start of your next turn.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_dimensional_travel',
    name: 'Boon of Dimensional Travel',
    category: 'epicBoon',
    description: 'As a Bonus Action, you can teleport up to 30 ft. to an unoccupied space you can see. You can do this once per turn without a spell slot; additional uses expend a spell slot.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_energy_resistance',
    name: 'Boon of Energy Resistance',
    category: 'epicBoon',
    description: 'Choose 2 damage types from: acid, cold, fire, force, lightning, necrotic, poison, psychic, radiant, thunder. You have Resistance to them. You can change your choices on a Long Rest.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
    complexNote: 'Note your chosen damage types in the Features tab. You can swap them on Long Rest.',
  },
  {
    id: 'boon_of_fate',
    name: 'Boon of Fate',
    category: 'epicBoon',
    description: 'When a creature within 60 ft. makes a d20 Test, you can add or subtract 2d4 from the result (Reaction). Once per Short or Long Rest.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_fortitude',
    name: 'Boon of Fortitude',
    category: 'epicBoon',
    description: 'Your Hit Point maximum increases by 40.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_irresistible_offense',
    name: 'Boon of Irresistible Offense',
    category: 'epicBoon',
    description: 'Your weapon attacks deal bludgeoning, piercing, or slashing damage that overcomes immunity. When you score a critical hit with a weapon, deal +2d10 force damage.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Strength or Dexterity', options: ['strength', 'dexterity'] },
  },
  {
    id: 'boon_of_night_spirit',
    name: 'Boon of Night Spirit',
    category: 'epicBoon',
    description: 'While in dim light or darkness, you can become Invisible as a Bonus Action (ends in bright light). While invisible this way, you have a Fly Speed equal to your walking Speed.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_peerless_aim',
    name: 'Boon of Peerless Aim',
    category: 'epicBoon',
    description: 'When you miss with a ranged attack roll, you can make it hit instead. Once you use this feature, you can\'t use it again until the start of your next turn.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_recovery',
    name: 'Boon of Recovery',
    category: 'epicBoon',
    description: 'You gain Second Wind (Bonus Action: regain 1d10 + level HP). Once per Long Rest, when you are reduced to 0 HP, you instead drop to 1 HP.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_skill',
    name: 'Boon of Skill',
    category: 'epicBoon',
    description: 'You gain proficiency in all skills.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_speed',
    name: 'Boon of Speed',
    category: 'epicBoon',
    description: 'Your Speed increases by 30 ft. You can take the Disengage action as a Bonus Action. You can\'t be Grappled or Restrained by nonmagical means.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
  {
    id: 'boon_of_spell_recall',
    name: 'Boon of Spell Recall',
    category: 'epicBoon',
    description: 'When you cast a spell using a 1st–4th level spell slot, roll 1d4. On a roll of 4, the slot is not expended.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to Intelligence, Wisdom, or Charisma', options: ['intelligence', 'wisdom', 'charisma'] },
  },
  {
    id: 'boon_of_truesight',
    name: 'Boon of Truesight',
    category: 'epicBoon',
    description: 'You have Truesight with a range of 60 feet.',
    choice: { type: 'abilityScore', count: 1, label: '+1 to any ability score', options: ALL_ABILITIES as unknown as string[] },
  },
]

// ─── Combined ─────────────────────────────────────────────────────────────────

export const ALL_FEATS: OriginFeatDef[] = [...ORIGIN_FEATS, ...GENERAL_FEATS, ...EPIC_BOON_FEATS]

export function getFeatById(id: string): OriginFeatDef | undefined {
  return ALL_FEATS.find(f => f.id === id)
}
