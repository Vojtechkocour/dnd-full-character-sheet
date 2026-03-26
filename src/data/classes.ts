import type { AbilityName, CharacterClass, ClassStartingEquipment, DieSize, SkillName } from '@/types'

export interface ClassFeatureEntry {
  name: string
  description: string
  type: 'feature' | 'asi' | 'subclass' | 'epicBoon'
}

export interface ClassLevelData {
  features: ClassFeatureEntry[]
  proficiencyBonus?: number   // only set when it changes
}

export interface ClassToolChoice {
  from: 'instrument' | 'artisanTool'
  count: number
}

export interface ClassDataDef {
  id: CharacterClass
  name: string
  hitDie: DieSize
  savingThrows: [AbilityName, AbilityName]
  skillChoices: SkillName[]
  skillCount: number
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies?: string[]    // fixed tools granted at level 1
  toolChoices?: ClassToolChoice[] // choice slots (player picks from a list)
  startingEquipment: ClassStartingEquipment
  subclassLevel: number
  subclassLabel: string   // "Primal Path", "Arcane Tradition", etc.
  levels: Record<number, ClassLevelData>
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function asi(): ClassFeatureEntry {
  return {
    name: 'Ability Score Improvement',
    description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, take a feat you meet the prerequisites for.',
    type: 'asi',
  }
}

function epicBoon(): ClassFeatureEntry {
  return {
    name: 'Epic Boon',
    description: 'Choose an Epic Boon feat. You also gain the Ability Score Improvement benefit (+2 to one score, or +1 to two, or exchange for a feat).',
    type: 'epicBoon',
  }
}

function subclassFeature(subclassLabel: string): ClassFeatureEntry {
  return {
    name: `${subclassLabel} Feature`,
    description: `You gain a feature granted by your chosen ${subclassLabel} subclass.`,
    type: 'subclass',
  }
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export const CLASSES_DATA: ClassDataDef[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // BARBARIAN
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'barbarian',
    name: 'Barbarian',
    hitDie: 12,
    savingThrows: ['strength', 'constitution'],
    skillChoices: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    skillCount: 2,
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '75 GP', items: [], currency: { gp: 75 } },
        { label: 'Martial Melee Weapon + Handaxes + Explorer\'s Pack', items: [
          { type: 'weapon', name: 'Martial Melee Weapon', weaponChoice: 'martial-melee' },
          { type: 'weapon', name: 'Handaxe', quantity: 4 },
          { type: 'gear', name: "Explorer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Primal Path',
    levels: {
      1: { features: [
        { name: 'Rage', description: 'Enter a Rage as a Bonus Action. Gain advantage on STR checks and saves, bonus damage on STR-based attacks (+2, increases at higher levels), resistance to Bludgeoning/Piercing/Slashing damage. Lasts 1 minute. 2 uses/Long Rest (increases with level).', type: 'feature' },
        { name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier. You can use a shield and still gain this benefit.', type: 'feature' },
        { name: 'Weapon Mastery', description: 'Choose 2 weapons you are proficient with. You gain the Mastery property of those weapons. You can change your choices on a Long Rest.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Danger Sense', description: 'You have advantage on Dexterity saving throws against effects you can see (not while Blinded, Deafened, or Incapacitated).', type: 'feature' },
        { name: 'Reckless Attack', description: 'When you make your first attack on your turn, you can decide to attack recklessly: advantage on STR-based weapon attacks until next turn, but attacks against you also have advantage until then.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Primal Path', description: 'Choose your subclass: Berserker, Wild Heart, World Tree, or Zealot (or another path your DM allows). You gain a feature from your chosen path.', type: 'subclass' },
        { name: 'Primal Knowledge', description: 'Choose 1 skill from the Barbarian skill list. You gain proficiency in it (or expertise if already proficient).', type: 'feature' },
      ] },
      4: { features: [asi()] },
      5: { features: [
        { name: 'Extra Attack', description: 'You can attack twice whenever you take the Attack action.', type: 'feature' },
        { name: 'Fast Movement', description: 'Your Speed increases by 10 feet while you aren\'t wearing heavy armor.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        subclassFeature('Primal Path'),
        { name: 'Primal Knowledge', description: 'Choose 1 more skill from the Barbarian skill list.', type: 'feature' },
      ] },
      7: { features: [
        { name: 'Feral Instinct', description: 'You have advantage on Initiative rolls. If you are Surprised at the start of combat, you can act normally on your first turn if you enter your Rage before doing anything else.', type: 'feature' },
        { name: 'Instinctive Pounce', description: 'As part of the Bonus Action you take to enter Rage, you can move up to half your Speed.', type: 'feature' },
      ] },
      8: { features: [asi()] },
      9: { features: [
        { name: 'Brutal Strike', description: 'When you use Reckless Attack, you can forgo advantage on one attack roll of your choice. If that attack hits, the target takes extra 1d10 damage of the weapon\'s type, and you can cause one Brutal Strike effect (Forceful Blow or Hamstring Blow).', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [subclassFeature('Primal Path')] },
      11: { features: [
        { name: 'Relentless Rage', description: 'If you drop to 0 HP while Raging and don\'t die, you can make a DC 10 CON save (DC increases by 5 each use until Long Rest). On success, drop to 1 HP instead.', type: 'feature' },
      ] },
      12: { features: [asi(),
        { name: 'Rage (5 uses)', description: 'Your Rage uses increase to 5 per Long Rest.', type: 'feature' },
      ] },
      13: { features: [
        { name: 'Improved Brutal Strike', description: 'Your Brutal Strike now deals extra 2d10 damage instead of 1d10. Additionally, you can use two Brutal Strike effects instead of one.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Primal Path')] },
      15: { features: [
        { name: 'Persistent Rage', description: 'Your Rage is so fierce that it ends early only if you fall Unconscious or choose to end it.', type: 'feature' },
      ] },
      16: { features: [asi(),
        { name: 'Rage (6 uses)', description: 'Your Rage uses increase to 6 per Long Rest.', type: 'feature' },
      ] },
      17: { features: [
        { name: 'Improved Brutal Strike II', description: 'Your Brutal Strike damage increases to 3d10. You gain two additional Brutal Strike effect options: Staggering Blow and Sundering Blow.', type: 'feature' },
        subclassFeature('Primal Path'),
      ], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Indomitable Might', description: 'If your STR check result is less than your STR score, you can use that score in place of the result.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Primal Champion', description: 'Your Strength and Constitution each increase by 4, and their maximum is now 25.', type: 'feature' },
        { name: 'Unlimited Rage', description: 'You can enter Rage any number of times without needing to regain uses.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'bard',
    name: 'Bard',
    hitDie: 8,
    savingThrows: ['dexterity', 'charisma'],
    skillChoices: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'],
    skillCount: 3,
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolChoices: [{ from: 'instrument', count: 3 }],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '110 GP', items: [], currency: { gp: 110 } },
        { label: 'Leather Armor + Simple Weapon + Explorer\'s Pack', items: [
          { type: 'armor', name: 'Leather Armor' },
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'gear', name: "Explorer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Bard College',
    levels: {
      1: { features: [
        { name: 'Bardic Inspiration', description: 'As a Bonus Action, give a creature within 60 ft a Bardic Inspiration die (d6). They can add it to an attack roll, ability check, or saving throw within 10 minutes. Uses = CHA modifier per Long Rest.', type: 'feature' },
        { name: 'Spellcasting', description: 'You can cast Bard spells using CHA as your spellcasting ability. You know 2 cantrips and 4 spells. Refer to the Bard spell list and your spell slots.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Expertise', description: 'Choose 2 skills you are proficient in. Your proficiency bonus is doubled for those skills.', type: 'feature' },
        { name: 'Jack of All Trades', description: 'You can add half your Proficiency Bonus (rounded down) to any ability check that doesn\'t already use your Proficiency Bonus.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Bard College', description: 'Choose your subclass: College of Dance, Glamour, Lore, Valor, Whispers, or another. You gain features from your college.', type: 'subclass' },
        { name: 'Bardic Inspiration (d8)', description: 'Your Bardic Inspiration die increases to d8.', type: 'feature' },
      ] },
      4: { features: [asi()] },
      5: { features: [
        { name: 'Font of Inspiration', description: 'You regain all your Bardic Inspiration uses when you finish a Short or Long Rest.', type: 'feature' },
        { name: 'Bardic Inspiration (d8)', description: 'Bardic Inspiration die remains d8 (increases to d10 at level 10).', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        subclassFeature('Bard College'),
        { name: 'Countercharm', description: 'As an Action, you can start a performance that lasts until the end of your next turn. During that time, you and any friendly creature within 30 ft have advantage on saves against being Frightened or Charmed.', type: 'feature' },
      ] },
      7: { features: [
        { name: 'Expertise', description: 'Choose 2 more skills to gain Expertise in.', type: 'feature' },
      ] },
      8: { features: [asi()] },
      9: { features: [
        { name: 'Magical Secrets', description: 'Choose 2 spells from any class\'s spell list. Add them to your Bard spells known.', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [
        { name: 'Bardic Inspiration (d10)', description: 'Your Bardic Inspiration die increases to d10.', type: 'feature' },
        { name: 'Magical Secrets', description: 'Choose 2 more spells from any class\'s spell list.', type: 'feature' },
      ] },
      11: { features: [
        { name: 'Bardic Inspiration (d12)', description: 'Your Bardic Inspiration die increases to d12.', type: 'feature' },
      ] },
      12: { features: [asi()] },
      13: { features: [
        { name: 'Magical Secrets', description: 'Choose 2 more spells from any class\'s spell list.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Bard College')] },
      15: { features: [
        { name: 'Magical Secrets', description: 'Choose 2 more spells from any class\'s spell list.', type: 'feature' },
      ] },
      16: { features: [asi()] },
      17: { features: [
        { name: 'Magical Secrets', description: 'Choose 2 more spells from any class\'s spell list.', type: 'feature' },
      ], proficiencyBonus: 6 },
      18: { features: [
        subclassFeature('Bard College'),
        { name: 'Superior Inspiration', description: 'When you roll Initiative and have no Bardic Inspiration uses remaining, you regain 2 uses.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Words of Creation', description: 'You gain resistance to Psychic damage. You also gain the following benefit when you cast Power Word Heal or Power Word Kill.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CLERIC
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    savingThrows: ['wisdom', 'charisma'],
    skillChoices: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    skillCount: 2,
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '110 GP', items: [], currency: { gp: 110 } },
        { label: 'Chain Shirt + Shield + Simple Weapon + Holy Symbol + Priest\'s Pack', items: [
          { type: 'armor', name: 'Chain Shirt' },
          { type: 'armor', name: 'Shield' },
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'gear', name: 'Holy Symbol' },
          { type: 'gear', name: "Priest's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Divine Order / Subclass',
    levels: {
      1: { features: [
        { name: 'Spellcasting', description: 'Cast Cleric spells using WIS. You know all Cleric spells and prepare a number equal to WIS modifier + Cleric level.', type: 'feature' },
        { name: 'Divine Order', description: 'Choose Protector (Medium Armor + Shields + Martial Weapons proficiency) or Thaumaturge (know 1 extra Cleric cantrip + expertise in Arcana/Religion).', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Channel Divinity', description: 'You gain the Divine Spark and Turn Undead options. 2 uses/Short or Long Rest. Divine Spark: spend uses to heal or deal Radiant/Necrotic damage. Turn Undead: each undead within 30 ft must succeed on WIS save or be Turned for 1 min.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Divine Domain', description: 'Choose your subclass: Life, Light, Trickery, War, Death, Nature, Tempest, Knowledge, or another domain. Gain domain spells and a Channel Divinity option.', type: 'subclass' },
      ] },
      4: { features: [asi()] },
      5: { features: [
        { name: 'Smite Undead', description: 'When you use Turn Undead, you can roll a number of d8s equal to your WIS modifier and add the rolls together. Each Turned Undead takes that much Radiant damage.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [subclassFeature('Divine Domain')] },
      7: { features: [
        { name: 'Blessed Strikes', description: 'Choose one of the following: Divine Strike (once per turn, when you hit with a weapon attack, +1d8 Radiant or Necrotic damage) or Potent Spellcasting (add WIS modifier to Cleric cantrip damage).', type: 'feature' },
      ] },
      8: { features: [asi()] },
      9: { features: [
        { name: 'Commune', description: 'You can cast Commune without expending a spell slot. Once you do so, you can\'t use this feature again until you finish a Long Rest.', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [
        { name: 'Divine Intervention', description: 'As a Magic action, call for divine intervention. Roll d100 ≤ your Cleric level: divine power intervenes in a way determined by the DM. Once it intervenes, you can\'t use this feature again for 7 days. Otherwise, recharges on Long Rest.', type: 'feature' },
      ] },
      11: { features: [
        { name: 'Improved Blessed Strikes', description: 'The die for your Blessed Strikes feature increases: Divine Strike to 2d8, or Potent Spellcasting also grants advantage on Concentration checks for Cleric spells.', type: 'feature' },
      ] },
      12: { features: [asi()] },
      13: { features: [], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Divine Domain')] },
      15: { features: [
        { name: 'Improved Divine Intervention', description: 'Starting at this level, your call for divine intervention always succeeds.', type: 'feature' },
      ] },
      16: { features: [asi()] },
      17: { features: [], proficiencyBonus: 6 },
      18: { features: [subclassFeature('Divine Domain')] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Greater Divine Intervention', description: 'When you use Divine Intervention, you can cast any Cleric spell of level 9 or lower without expending a spell slot.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DRUID
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'druid',
    name: 'Druid',
    hitDie: 8,
    savingThrows: ['intelligence', 'wisdom'],
    skillChoices: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    skillCount: 2,
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields (nonmetal)'],
    weaponProficiencies: ['Simple Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '50 GP', items: [], currency: { gp: 50 } },
        { label: 'Leather Armor + Shield + Simple Weapon + Priest\'s Pack', items: [
          { type: 'armor', name: 'Leather Armor' },
          { type: 'armor', name: 'Shield' },
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'gear', name: "Priest's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Druid Circle',
    levels: {
      1: { features: [
        { name: 'Spellcasting', description: 'Cast Druid spells using WIS. Prepare WIS modifier + Druid level spells from the full Druid list.', type: 'feature' },
        { name: 'Primal Order', description: 'Choose Magician (extra cantrip from Druid list + expertise in Arcana/Nature) or Warden (Medium Armor + Martial Weapons proficiency).', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Wild Shape', description: 'As a Bonus Action, transform into a Beast with CR up to 1/4 (or higher as you level). You gain the beast\'s HP and Statistics while retaining your Druid level-based features. 2 uses/Short or Long Rest.', type: 'feature' },
        { name: 'Wild Companion', description: 'You can cast Find Familiar without a spell slot. Once used, requires a Short or Long Rest to use again.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Druid Circle', description: 'Choose your subclass: Circle of the Land, Moon, Sea, Stars, Wildfire, or another. Gain subclass features.', type: 'subclass' },
      ] },
      4: { features: [
        asi(),
        { name: 'Wild Shape (CR 1/2)', description: 'Your Wild Shape can now be any Beast with CR 1/2 or lower that doesn\'t have a Fly Speed.', type: 'feature' },
      ] },
      5: { features: [
        { name: 'Wild Shape (CR 1)', description: 'Your Wild Shape can be any Beast with CR 1 or lower. You can also have a Fly Speed.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [subclassFeature('Druid Circle')] },
      7: { features: [
        { name: 'Elemental Fury', description: 'Choose Potent Spellcasting (add WIS modifier to Druid cantrip damage) or Primal Strike (your Wild Shape attacks count as magical; once per turn deal extra 1d8 elemental damage).', type: 'feature' },
      ] },
      8: { features: [
        asi(),
        { name: 'Wild Shape (CR 2)', description: 'Your Wild Shape CR limit increases to 2.', type: 'feature' },
      ] },
      9: { features: [], proficiencyBonus: 4 },
      10: { features: [subclassFeature('Druid Circle')] },
      11: { features: [
        { name: 'Wild Shape (CR 3)', description: 'Your Wild Shape CR limit increases to 3.', type: 'feature' },
      ] },
      12: { features: [asi()] },
      13: { features: [], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Druid Circle')] },
      15: { features: [
        { name: 'Improved Elemental Fury', description: 'Your Elemental Fury increases: Potent Spellcasting damage die increases, or Primal Strike deals extra 2d8 elemental damage.', type: 'feature' },
      ] },
      16: { features: [asi()] },
      17: { features: [], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Beast Spells', description: 'You can cast Druid spells in Wild Shape form as long as the spell has no material component.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Archdruid', description: 'Unlimited uses of Wild Shape. At the start of each of your turns in Wild Shape, you regain Hit Points equal to your WIS modifier.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FIGHTER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    savingThrows: ['strength', 'constitution'],
    skillChoices: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    skillCount: 2,
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '110 GP', items: [], currency: { gp: 110 } },
        { label: 'Chain Mail + Shield + Martial Weapon + Dungeoneer\'s Pack', items: [
          { type: 'armor', name: 'Chain Mail' },
          { type: 'armor', name: 'Shield' },
          { type: 'weapon', name: 'Martial Weapon', weaponChoice: 'martial' },
          { type: 'gear', name: "Dungeoneer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Martial Archetype',
    levels: {
      1: { features: [
        { name: 'Fighting Style', description: 'Choose a Fighting Style: Archery (+2 ranged attack rolls), Blind Fighting (10 ft blindsight), Defense (+1 AC while armored), Dueling (+2 melee damage with one weapon), Great Weapon Fighting (reroll 1s/2s on damage dice for two-handed weapons), Interception, Protection, Thrown Weapon, Two-Weapon, or Unarmed Fighting.', type: 'feature' },
        { name: 'Second Wind', description: 'As a Bonus Action, regain Hit Points equal to 1d10 + Fighter level. 1 use/Short or Long Rest.', type: 'feature' },
        { name: 'Weapon Mastery', description: 'Choose 3 weapons you are proficient with. You gain the Mastery property of those weapons. You can change choices on a Long Rest.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Action Surge', description: 'On your turn, you can take one additional Action. Once used, requires Short or Long Rest (2 uses at level 17).', type: 'feature' },
        { name: 'Tactical Mind', description: 'When you fail an ability check, you can expend a use of Second Wind to add 1d10 to the check, potentially turning it into a success.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Martial Archetype', description: 'Choose your subclass: Battle Master, Champion, Eldritch Knight, Psi Warrior, or another. Gain subclass features.', type: 'subclass' },
      ] },
      4: { features: [
        asi(),
        { name: 'Weapon Mastery +1', description: 'You can now apply Mastery to 4 weapons.', type: 'feature' },
      ] },
      5: { features: [
        { name: 'Extra Attack', description: 'You can attack twice whenever you take the Attack action.', type: 'feature' },
        { name: 'Tactical Shift', description: 'Whenever you activate Second Wind, you can move up to half your Speed without provoking Opportunity Attacks.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        asi(),
        { name: 'Weapon Mastery +1', description: 'You can now apply Mastery to 5 weapons.', type: 'feature' },
      ] },
      7: { features: [subclassFeature('Martial Archetype')] },
      8: { features: [
        asi(),
        { name: 'Weapon Mastery +1', description: 'You can now apply Mastery to 6 weapons.', type: 'feature' },
      ] },
      9: { features: [
        { name: 'Indomitable', description: 'When you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll. 1 use/Long Rest (2 uses at level 13, 3 at level 17).', type: 'feature' },
        { name: 'Master of Armaments', description: 'You can change your Weapon Mastery choices during a Short or Long Rest.', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [subclassFeature('Martial Archetype')] },
      11: { features: [
        { name: 'Extra Attack (3)', description: 'You can attack three times whenever you take the Attack action.', type: 'feature' },
        { name: 'Studied Attacks', description: 'When you miss a creature with a weapon attack, you gain advantage on your next attack roll against that creature before the end of your next turn.', type: 'feature' },
      ] },
      12: { features: [
        asi(),
        { name: 'Weapon Mastery +1', description: 'You can now apply Mastery to 7 weapons.', type: 'feature' },
      ] },
      13: { features: [
        { name: 'Indomitable (2 uses)', description: 'You can now use Indomitable twice per Long Rest.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [
        asi(),
        { name: 'Weapon Mastery +1', description: 'You can now apply Mastery to 8 weapons.', type: 'feature' },
      ] },
      15: { features: [subclassFeature('Martial Archetype')] },
      16: { features: [
        asi(),
        { name: 'Weapon Mastery +1', description: 'You can now apply Mastery to 9 weapons.', type: 'feature' },
      ] },
      17: { features: [
        { name: 'Action Surge (2 uses)', description: 'You can use Action Surge twice per Short or Long Rest.', type: 'feature' },
        { name: 'Indomitable (3 uses)', description: 'You can use Indomitable three times per Long Rest.', type: 'feature' },
      ], proficiencyBonus: 6 },
      18: { features: [subclassFeature('Martial Archetype')] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Extra Attack (4)', description: 'You can attack four times whenever you take the Attack action.', type: 'feature' },
        { name: 'Weapon Mastery +1', description: 'You can apply Mastery to 10 weapons.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MONK
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'monk',
    name: 'Monk',
    hitDie: 8,
    savingThrows: ['strength', 'dexterity'],
    skillChoices: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    skillCount: 2,
    armorProficiencies: [],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons with Light and Finesse properties'],
    toolChoices: [{ from: 'artisanTool', count: 1 }],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '50 GP', items: [], currency: { gp: 50 } },
        { label: 'Simple Melee Weapon + Daggers + Explorer\'s Pack', items: [
          { type: 'weapon', name: 'Simple Melee Weapon', weaponChoice: 'simple-melee' },
          { type: 'weapon', name: 'Dagger', quantity: 5 },
          { type: 'gear', name: "Explorer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Monastic Tradition',
    levels: {
      1: { features: [
        { name: 'Martial Arts', description: 'Your unarmed strikes and monk weapons use d6 for damage (increases at higher levels). You can use DEX instead of STR for attack/damage. You can make one Unarmed Strike as a Bonus Action when you take the Attack action with a monk weapon or Unarmed Strike.', type: 'feature' },
        { name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + DEX modifier + WIS modifier.', type: 'feature' },
        { name: 'Weapon Mastery', description: 'Choose 2 Simple or Monk weapons. You gain the Mastery property of those weapons.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Monk\'s Focus (Ki Points)', description: 'You have Focus Points equal to your Monk level. Spend them on: Flurry of Blows (2 extra Unarmed Strikes after Attack action), Patient Defense (Dodge as Bonus Action), or Step of the Wind (Dash/Disengage as Bonus Action + jump distance doubles). Recharge on Short or Long Rest.', type: 'feature' },
        { name: 'Unarmored Movement', description: 'Speed increases by 10 ft while not wearing armor or a shield (increases further at levels 6, 10, 14, 18).', type: 'feature' },
        { name: 'Uncanny Metabolism', description: 'When you roll Initiative, you can regain Focus Points equal to your WIS modifier. Once per Long Rest.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Monastic Tradition', description: 'Choose your subclass: Way of the Astral Self, Elements, Mercy, Open Hand, Shadow, Sun Soul, or another. Gain subclass features.', type: 'subclass' },
        { name: 'Deflect Attacks', description: 'When you take Bludgeoning, Piercing, or Slashing damage, use your Reaction to reduce the damage by 1d10 + DEX modifier + Monk level. If reduced to 0, redirect it: spend 1 Focus Point to redirect as an attack (1d10 + DEX + Proficiency Bonus force damage, 5 ft range).', type: 'feature' },
      ] },
      4: { features: [
        asi(),
        { name: 'Slow Fall', description: 'Use your Reaction to reduce falling damage by 5 × Monk level.', type: 'feature' },
      ] },
      5: { features: [
        { name: 'Extra Attack', description: 'You can attack twice whenever you take the Attack action.', type: 'feature' },
        { name: 'Stunning Strike', description: 'When you hit with a monk weapon/unarmed strike, spend 1 Focus Point to force the target to make a CON save (DC = 8 + WIS + Proficiency Bonus) or be Stunned until start of your next turn.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        subclassFeature('Monastic Tradition'),
        { name: 'Empowered Strikes', description: 'Your Unarmed Strikes now deal Force damage and count as magical for overcoming resistance.', type: 'feature' },
        { name: 'Unarmored Movement +5', description: 'Speed bonus increases to 15 ft.', type: 'feature' },
      ] },
      7: { features: [
        { name: 'Evasion', description: 'When you are subjected to an effect that allows a DEX save to take half damage, you take no damage on success and only half on failure (if not Incapacitated).', type: 'feature' },
        { name: 'Stillness of Mind', description: 'As a Bonus Action, end the Charmed or Frightened condition on yourself.', type: 'feature' },
      ] },
      8: { features: [asi()] },
      9: { features: [
        { name: 'Acrobatic Movement', description: 'You can move along vertical surfaces and across liquids without falling during your move.', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [
        { name: 'Heightened Focus', description: 'You gain the following benefits from your Focus: Flurry of Blows can impose 1 condition (Grappled, Prone, or Pushed); Patient Defense grants more benefits; Step of the Wind improves.', type: 'feature' },
        { name: 'Self Restoration', description: 'At the end of each of your turns, you can end one of these conditions on yourself: Frightened, Poisoned, or Stunned.', type: 'feature' },
        { name: 'Unarmored Movement +10', description: 'Speed bonus increases to 20 ft.', type: 'feature' },
      ] },
      11: { features: [subclassFeature('Monastic Tradition')] },
      12: { features: [asi()] },
      13: { features: [
        { name: 'Deflect Energy', description: 'Your Deflect Attacks now also works against damage types: Acid, Cold, Fire, Force, Lightning, Thunder.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [
        { name: 'Disciplined Survivor', description: 'You gain proficiency in all saving throws.', type: 'feature' },
        { name: 'Unarmored Movement +15', description: 'Speed bonus increases to 25 ft.', type: 'feature' },
      ] },
      15: { features: [
        { name: 'Perfect Focus', description: 'When you roll Initiative and have 0 Focus Points, you regain 4 Focus Points.', type: 'feature' },
      ] },
      16: { features: [asi()] },
      17: { features: [subclassFeature('Monastic Tradition')], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Superior Defense', description: 'At the start of each of your turns, you can spend 3 Focus Points to become immune to all damage until the start of your next turn, unless you have the Incapacitated condition.', type: 'feature' },
        { name: 'Unarmored Movement +20', description: 'Speed bonus increases to 30 ft.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Body and Mind', description: 'Your Strength and Dexterity scores each increase by 4, and their maximum is now 25.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PALADIN
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    savingThrows: ['wisdom', 'charisma'],
    skillChoices: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    skillCount: 2,
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '150 GP', items: [], currency: { gp: 150 } },
        { label: 'Chain Mail + Shield + Martial Weapon + Holy Symbol + Priest\'s Pack', items: [
          { type: 'armor', name: 'Chain Mail' },
          { type: 'armor', name: 'Shield' },
          { type: 'weapon', name: 'Martial Weapon', weaponChoice: 'martial' },
          { type: 'gear', name: 'Holy Symbol' },
          { type: 'gear', name: "Priest's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Sacred Oath',
    levels: {
      1: { features: [
        { name: 'Lay On Hands', description: 'Pool of HP = 5 × Paladin level. As a Magic Action, restore any amount from the pool to a creature, OR expend 5 points to cure Poison or a disease. Recharges on Long Rest.', type: 'feature' },
        { name: 'Spellcasting', description: 'Cast Paladin spells using CHA. Prepare CHA modifier + Paladin level spells.', type: 'feature' },
        { name: 'Weapon Mastery', description: 'Choose 2 weapons you are proficient with. You gain the Mastery property of those weapons.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Divine Smite', description: 'When you hit with a melee weapon, you can expend 1–5 spell slots to deal extra Radiant damage: 2d8 for a 1st-level slot + 1d8 per slot level above 1st. Extra 1d8 against Undead or Fiends. You can also use this on critical hits.', type: 'feature' },
        { name: 'Fighting Style', description: 'Choose a Fighting Style: Defense (+1 AC), Dueling (+2 melee damage), Great Weapon Fighting, or Protection.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Sacred Oath', description: 'Choose your subclass: Oath of Devotion, Glory, the Ancients, Vengeance, Conquest, Redemption, or another. Gain Oath Spells and Channel Divinity.', type: 'subclass' },
        { name: 'Channel Divinity (1/Short Rest)', description: 'Use one of your Oath\'s Channel Divinity options or the standard Divine Sense (detect celestials, fiends, and undead within 60 ft until end of your next turn).', type: 'feature' },
      ] },
      4: { features: [asi()] },
      5: { features: [
        { name: 'Extra Attack', description: 'You can attack twice whenever you take the Attack action.', type: 'feature' },
        { name: 'Faithful Steed', description: 'You can cast Find Steed without expending a spell slot. Once cast this way, Long Rest required to cast for free again.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        { name: 'Aura of Protection', description: 'You and friendly creatures within 10 ft add your CHA modifier (min +1) to all saving throws while you are conscious.', type: 'feature' },
      ] },
      7: { features: [subclassFeature('Sacred Oath')] },
      8: { features: [asi()] },
      9: { features: [], proficiencyBonus: 4 },
      10: { features: [
        { name: 'Aura of Courage', description: 'You and friendly creatures within 10 ft can\'t be Frightened while you are conscious.', type: 'feature' },
      ] },
      11: { features: [
        { name: 'Radiant Strikes', description: 'Your weapon attacks now deal an extra 1d8 Radiant damage.', type: 'feature' },
      ] },
      12: { features: [asi()] },
      13: { features: [], proficiencyBonus: 5 },
      14: { features: [
        { name: 'Restoring Touch', description: 'When you use Lay On Hands on a creature, you can also remove one condition: Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned.', type: 'feature' },
      ] },
      15: { features: [subclassFeature('Sacred Oath')] },
      16: { features: [asi()] },
      17: { features: [], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Aura Expansion', description: 'The range of your Aura of Protection and Aura of Courage expands to 30 feet.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [subclassFeature('Sacred Oath')] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RANGER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'ranger',
    name: 'Ranger',
    hitDie: 10,
    savingThrows: ['strength', 'dexterity'],
    skillChoices: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    skillCount: 3,
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '150 GP', items: [], currency: { gp: 150 } },
        { label: 'Scale Mail + Martial Melee Weapon + Ranged Weapon + Dungeoneer\'s Pack', items: [
          { type: 'armor', name: 'Scale Mail' },
          { type: 'weapon', name: 'Martial Melee Weapon', weaponChoice: 'martial-melee' },
          { type: 'weapon', name: 'Ranged Weapon', weaponChoice: 'simple-ranged' },
          { type: 'gear', name: 'Arrows (20)' },
          { type: 'gear', name: "Dungeoneer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Ranger Conclave',
    levels: {
      1: { features: [
        { name: 'Spellcasting', description: 'Cast Ranger spells using WIS. You know a set number of spells. Gain spell slots per the Ranger table.', type: 'feature' },
        { name: 'Favored Enemy', description: 'You gain the Hunter\'s Mark spell and can cast it a number of times equal to your WIS modifier per Long Rest without a spell slot.', type: 'feature' },
        { name: 'Weapon Mastery', description: 'Choose 2 weapons you are proficient with. You gain the Mastery property of those weapons.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Deft Explorer', description: 'Choose an Expertise in one skill from the Ranger list. You also gain the Roving benefit (speed +10 ft and Climb/Swim speeds equal to your walking speed).', type: 'feature' },
        { name: 'Fighting Style', description: 'Choose a Fighting Style: Archery (+2 ranged), Defense (+1 AC), Dueling (+2 damage), or Two-Weapon Fighting.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Ranger Conclave', description: 'Choose your subclass: Hunter, Beast Master, Fey Wanderer, Gloom Stalker, or another. Gain subclass features.', type: 'subclass' },
        { name: 'Tireless', description: 'As a Magic Action, gain Temporary HP equal to 1d8 + WIS modifier. Uses = WIS modifier per Long Rest. Also: finishing a Short Rest removes Exhaustion level.', type: 'feature' },
      ] },
      4: { features: [asi()] },
      5: { features: [
        { name: 'Extra Attack', description: 'You can attack twice whenever you take the Attack action.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        { name: 'Roving (improved)', description: 'Your Speed increases by 10 ft (bonus). You gain Climb and Swim speeds equal to your Speed.', type: 'feature' },
      ] },
      7: { features: [subclassFeature('Ranger Conclave')] },
      8: { features: [asi()] },
      9: { features: [
        { name: 'Expertise', description: 'Gain Expertise in one more skill from the Ranger skill list.', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [
        { name: 'Tireless (improved)', description: 'You can use Tireless a number of times equal to twice your WIS modifier per Long Rest.', type: 'feature' },
      ] },
      11: { features: [subclassFeature('Ranger Conclave')] },
      12: { features: [asi()] },
      13: { features: [
        { name: 'Relentless Hunter', description: 'Taking damage can\'t break your Concentration on Hunter\'s Mark.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [
        { name: 'Nature\'s Veil', description: 'As a Bonus Action, you can become Invisible until the start of your next turn. Uses = WIS modifier per Long Rest.', type: 'feature' },
      ] },
      15: { features: [subclassFeature('Ranger Conclave')] },
      16: { features: [asi()] },
      17: { features: [
        { name: 'Precise Hunter', description: 'You have advantage on attack rolls against the creature currently marked by your Hunter\'s Mark.', type: 'feature' },
      ], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Feral Senses', description: 'You gain Blindsight with a range of 30 feet.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Foe Slayer', description: 'The first time you hit a creature with a weapon attack on each of your turns, you can add your WIS modifier to the attack roll or the damage roll.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROGUE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'rogue',
    name: 'Rogue',
    hitDie: 8,
    savingThrows: ['dexterity', 'intelligence'],
    skillChoices: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'],
    skillCount: 4,
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons with Finesse or Light properties', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ["Thieves' Tools"],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '110 GP', items: [], currency: { gp: 110 } },
        { label: "Leather Armor + Simple Weapon + Martial Weapon + Thieves' Tools + Burglar's Pack", items: [
          { type: 'armor', name: 'Leather Armor' },
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'weapon', name: 'Martial Weapon', weaponChoice: 'martial' },
          { type: 'gear', name: "Thieves' Tools" },
          { type: 'gear', name: "Burglar's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Roguish Archetype',
    levels: {
      1: { features: [
        { name: 'Expertise', description: 'Choose 2 skills (or Thieves\' Tools) you are proficient in. Your Proficiency Bonus is doubled for those.', type: 'feature' },
        { name: 'Sneak Attack', description: 'Once per turn, deal extra 1d6 damage to one creature you hit with an attack if you have advantage or if an ally is adjacent to the target. Increases to 2d6 at level 3, and by 1d6 every 2 levels after.', type: 'feature' },
        { name: 'Thieves\' Cant', description: 'You know thieves\' cant and can hide secret messages within normal speech.', type: 'feature' },
        { name: 'Weapon Mastery', description: 'Choose 2 weapons. You gain the Mastery property of those weapons.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Cunning Action', description: 'As a Bonus Action, take the Dash, Disengage, or Hide action.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Roguish Archetype', description: 'Choose your subclass: Arcane Trickster, Assassin, Soulknife, Swashbuckler, Thief, or another.', type: 'subclass' },
        { name: 'Sneak Attack (2d6)', description: 'Your Sneak Attack increases to 2d6.', type: 'feature' },
        { name: 'Steady Aim', description: 'As a Bonus Action, you get advantage on your next attack this turn. Your Speed is 0 until end of turn.', type: 'feature' },
      ] },
      4: { features: [asi()] },
      5: { features: [
        { name: 'Cunning Strike', description: 'When you deal Sneak Attack damage, you can expend Sneak Attack dice to apply an effect: Disarm (1d6), Poison (1d6, CON save or Poisoned), Trip (1d6, STR save or Prone), or Withdraw (1d6, Disengage as part of the hit).', type: 'feature' },
        { name: 'Sneak Attack (3d6)', description: 'Your Sneak Attack increases to 3d6.', type: 'feature' },
        { name: 'Uncanny Dodge', description: 'When an attacker you can see hits you, use your Reaction to halve the damage.', type: 'feature' },
      ], proficiencyBonus: 3 },
      6: { features: [
        { name: 'Expertise', description: 'Choose 2 more skills to gain Expertise in.', type: 'feature' },
        { name: 'Sneak Attack (4d6)', description: 'Your Sneak Attack increases to 4d6.', type: 'feature' },
      ] },
      7: { features: [
        { name: 'Evasion', description: 'When you succeed on a DEX save for half damage, take no damage instead. Failure = half damage (not Incapacitated).', type: 'feature' },
        { name: 'Reliable Talent', description: 'When you make an ability check using a skill you are proficient in, treat any roll of 9 or lower as a 10.', type: 'feature' },
        { name: 'Sneak Attack (4d6)', description: 'Your Sneak Attack remains 4d6 this level.', type: 'feature' },
      ] },
      8: { features: [
        asi(),
        { name: 'Sneak Attack (5d6)', description: 'Your Sneak Attack increases to 5d6.', type: 'feature' },
      ] },
      9: { features: [
        subclassFeature('Roguish Archetype'),
        { name: 'Sneak Attack (5d6)', description: 'Your Sneak Attack remains 5d6 this level.', type: 'feature' },
      ], proficiencyBonus: 4 },
      10: { features: [
        asi(),
        { name: 'Sneak Attack (6d6)', description: 'Your Sneak Attack increases to 6d6.', type: 'feature' },
      ] },
      11: { features: [
        { name: 'Improved Cunning Strike', description: 'You can use Cunning Strike without sacrificing Sneak Attack dice.', type: 'feature' },
        { name: 'Sneak Attack (6d6)', description: 'Your Sneak Attack remains 6d6.', type: 'feature' },
      ] },
      12: { features: [
        asi(),
        { name: 'Sneak Attack (7d6)', description: 'Your Sneak Attack increases to 7d6.', type: 'feature' },
      ] },
      13: { features: [
        subclassFeature('Roguish Archetype'),
        { name: 'Sneak Attack (7d6)', description: 'Your Sneak Attack remains 7d6.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [
        { name: 'Devious Strikes', description: 'New Cunning Strike options added: Daze (2d6, CON save or Incapacitated until end of your next turn), Knock Out (6d6, CON save or Unconscious for 1 min), and Obscure (3d6, DEX save or Blinded until end of your next turn).', type: 'feature' },
        { name: 'Sneak Attack (8d6)', description: 'Your Sneak Attack increases to 8d6.', type: 'feature' },
      ] },
      15: { features: [
        { name: 'Slippery Mind', description: 'You now have proficiency in WIS and CHA saving throws.', type: 'feature' },
        { name: 'Sneak Attack (8d6)', description: 'Your Sneak Attack remains 8d6.', type: 'feature' },
      ] },
      16: { features: [
        asi(),
        { name: 'Sneak Attack (9d6)', description: 'Your Sneak Attack increases to 9d6.', type: 'feature' },
      ] },
      17: { features: [
        subclassFeature('Roguish Archetype'),
        { name: 'Sneak Attack (9d6)', description: 'Your Sneak Attack remains 9d6.', type: 'feature' },
      ], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Elusive', description: 'No attack roll has advantage against you while you aren\'t Incapacitated.', type: 'feature' },
        { name: 'Sneak Attack (10d6)', description: 'Your Sneak Attack increases to 10d6.', type: 'feature' },
      ] },
      19: { features: [
        epicBoon(),
        { name: 'Sneak Attack (10d6)', description: 'Your Sneak Attack remains 10d6.', type: 'feature' },
      ] },
      20: { features: [
        { name: 'Stroke of Luck', description: 'If you fail an ability check, you can turn the failure into a success. If you miss an attack roll, you can turn the miss into a hit. Once used, Long Rest required.', type: 'feature' },
        { name: 'Sneak Attack (11d6)', description: 'Your Sneak Attack increases to 11d6.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SORCERER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 6,
    savingThrows: ['constitution', 'charisma'],
    skillChoices: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    skillCount: 2,
    armorProficiencies: [],
    weaponProficiencies: ['Simple Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '50 GP', items: [], currency: { gp: 50 } },
        { label: 'Simple Weapon + Daggers + Arcane Focus + Explorer\'s Pack', items: [
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'weapon', name: 'Dagger', quantity: 2 },
          { type: 'gear', name: 'Arcane Focus' },
          { type: 'gear', name: "Explorer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Sorcerous Origin',
    levels: {
      1: { features: [
        { name: 'Spellcasting', description: 'Cast Sorcerer spells using CHA. You know a fixed number of spells and cantrips.', type: 'feature' },
        { name: 'Innate Sorcery', description: 'As a Bonus Action, unleash magical power for 1 minute: advantage on spell attack rolls, and the Spell Save DC of your spells increases by 1. Uses = CHA modifier per Long Rest.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Font of Magic', description: 'You have Sorcery Points equal to your Sorcerer level. You can convert spell slots to Sorcery Points (1 point per slot level) and vice versa (flexible casting). Recharges on Long Rest.', type: 'feature' },
        { name: 'Metamagic', description: 'Choose 2 Metamagic options: Careful (protect allies from area spells), Distant (double range), Empowered (reroll damage dice), Extended (double duration), Heightened (give disadvantage on save), Quickened (Bonus Action casting), Seeking (reroll missed attacks), Subtle (no V/S components), Transmuted (change damage type), or Twinned (target a second creature).', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Sorcerous Origin', description: 'Choose your subclass: Aberrant Mind, Clockwork Soul, Draconic Bloodline, Lunar Sorcery, Shadow Magic, Storm Sorcery, Wild Magic, or another.', type: 'subclass' },
      ] },
      4: { features: [
        asi(),
        { name: 'Metamagic (+1)', description: 'Learn one additional Metamagic option.', type: 'feature' },
      ] },
      5: { features: [], proficiencyBonus: 3 },
      6: { features: [subclassFeature('Sorcerous Origin')] },
      7: { features: [
        { name: 'Sorcery Incarnate', description: 'While Innate Sorcery is active, you can use up to 2 Metamagic options on the same spell. Also: you can convert 2 Sorcery Points to gain 1 use of Innate Sorcery.', type: 'feature' },
      ] },
      8: { features: [
        asi(),
        { name: 'Metamagic (+1)', description: 'Learn one additional Metamagic option.', type: 'feature' },
      ] },
      9: { features: [], proficiencyBonus: 4 },
      10: { features: [
        { name: 'Metamagic (+1)', description: 'Learn one additional Metamagic option.', type: 'feature' },
      ] },
      11: { features: [] },
      12: { features: [asi()] },
      13: { features: [], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Sorcerous Origin')] },
      15: { features: [] },
      16: { features: [
        asi(),
        { name: 'Metamagic (+1)', description: 'Learn one additional Metamagic option.', type: 'feature' },
      ] },
      17: { features: [], proficiencyBonus: 6 },
      18: { features: [subclassFeature('Sorcerous Origin')] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Arcane Apotheosis', description: 'While Innate Sorcery is active, you can use any of your Metamagic options on each spell you cast, at no Sorcery Point cost.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WARLOCK
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    savingThrows: ['wisdom', 'charisma'],
    skillChoices: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    skillCount: 2,
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '100 GP', items: [], currency: { gp: 100 } },
        { label: "Leather Armor + Simple Weapon + Arcane Focus + Explorer's Pack", items: [
          { type: 'armor', name: 'Leather Armor' },
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'gear', name: 'Arcane Focus' },
          { type: 'gear', name: "Explorer's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Otherworldly Patron',
    levels: {
      1: { features: [
        { name: 'Eldritch Invocations', description: 'You learn 1 Eldritch Invocation from the list (Agonizing Blast, Armor of Shadows, Devil\'s Sight, etc.). You gain more at higher levels.', type: 'feature' },
        { name: 'Pact Magic', description: 'Cast Warlock spells using CHA. You have 1 Pact Magic spell slot (all the same level, based on your Warlock level). Slots recharge on Short or Long Rest.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Magical Cunning', description: 'Once per Long Rest, if you have expended all Pact Magic slots, you can regain half your total slots (rounded up).', type: 'feature' },
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Otherworldly Patron', description: 'Choose your subclass: Archfey, Celestial, Fiend, Great Old One, Undead, or another. Gain Patron Spells, a Pact Boon, and other features.', type: 'subclass' },
        { name: 'Pact Boon', description: 'Choose Pact of the Blade (summon a magical weapon), Pact of the Chain (familiar with special options), or Pact of the Tome (Book of Shadows with extra cantrips and rituals).', type: 'feature' },
      ] },
      4: { features: [
        asi(),
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      5: { features: [], proficiencyBonus: 3 },
      6: { features: [
        subclassFeature('Otherworldly Patron'),
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      7: { features: [] },
      8: { features: [
        asi(),
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      9: { features: [], proficiencyBonus: 4 },
      10: { features: [subclassFeature('Otherworldly Patron')] },
      11: { features: [
        { name: 'Mystic Arcanum (6th level)', description: 'Choose a 6th-level Warlock spell as your Mystic Arcanum. Cast it once per Long Rest without a spell slot.', type: 'feature' },
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      12: { features: [
        asi(),
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      13: { features: [
        { name: 'Mystic Arcanum (7th level)', description: 'Choose a 7th-level Warlock spell. Cast it once per Long Rest.', type: 'feature' },
      ], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Otherworldly Patron')] },
      15: { features: [
        { name: 'Mystic Arcanum (8th level)', description: 'Choose an 8th-level Warlock spell. Cast it once per Long Rest.', type: 'feature' },
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      16: { features: [asi()] },
      17: { features: [
        { name: 'Mystic Arcanum (9th level)', description: 'Choose a 9th-level Warlock spell. Cast it once per Long Rest.', type: 'feature' },
      ], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Eldritch Invocations (+1)', description: 'Learn one more Eldritch Invocation.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Eldritch Master', description: 'You can now cast one of your Mystic Arcanum spells without expending the daily use. You regain this benefit after a Long Rest.', type: 'feature' },
      ] },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WIZARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    savingThrows: ['intelligence', 'wisdom'],
    skillChoices: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    skillCount: 2,
    armorProficiencies: [],
    weaponProficiencies: ['Simple Weapons'],
    startingEquipment: {
      fixed: [],
      choose: [
        { label: '110 GP', items: [], currency: { gp: 110 } },
        { label: "Simple Weapon + Spellbook + Arcane Focus + Scholar's Pack", items: [
          { type: 'weapon', name: 'Simple Weapon', weaponChoice: 'simple' },
          { type: 'gear', name: 'Spellbook' },
          { type: 'gear', name: 'Arcane Focus' },
          { type: 'gear', name: "Scholar's Pack" },
        ]},
      ],
    },
    subclassLevel: 3,
    subclassLabel: 'Arcane Tradition',
    levels: {
      1: { features: [
        { name: 'Spellcasting', description: 'Cast Wizard spells using INT. Your spellbook contains 6 spells at 1st level. Prepare INT modifier + Wizard level spells. You can copy spells into your spellbook.', type: 'feature' },
        { name: 'Arcane Recovery', description: 'Once per day after a Short Rest, recover spell slots with a combined level equal to half your Wizard level (min 1). Slots must be level 5 or lower.', type: 'feature' },
      ], proficiencyBonus: 2 },
      2: { features: [
        { name: 'Scholar', description: 'Choose one of the following: Linguist (learn 3 languages and can create ciphers) or Sage (add double Proficiency Bonus to Arcana and History checks).', type: 'feature' },
      ] },
      3: { features: [
        { name: 'Choose Arcane Tradition', description: 'Choose your subclass: School of Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation, or Bladesinging. Gain subclass features.', type: 'subclass' },
      ] },
      4: { features: [asi()] },
      5: { features: [], proficiencyBonus: 3 },
      6: { features: [subclassFeature('Arcane Tradition')] },
      7: { features: [
        { name: 'Memorize Spell', description: 'When you prepare your spells, you can add one additional prepared spell for the day. Once used, Long Rest required.', type: 'feature' },
      ] },
      8: { features: [asi()] },
      9: { features: [], proficiencyBonus: 4 },
      10: { features: [subclassFeature('Arcane Tradition')] },
      11: { features: [] },
      12: { features: [asi()] },
      13: { features: [], proficiencyBonus: 5 },
      14: { features: [subclassFeature('Arcane Tradition')] },
      15: { features: [] },
      16: { features: [asi()] },
      17: { features: [], proficiencyBonus: 6 },
      18: { features: [
        { name: 'Spell Mastery', description: 'Choose a 1st- and a 2nd-level spell in your spellbook. You can cast those spells at their lowest level without expending a spell slot. You can change your choices on a Long Rest.', type: 'feature' },
      ] },
      19: { features: [epicBoon()] },
      20: { features: [
        { name: 'Signature Spells', description: 'Choose two 3rd-level spells in your spellbook as your signature spells. You always have them prepared and can cast each of them once without a spell slot. Regain uses on Short Rest.', type: 'feature' },
      ] },
    },
  },
]

export function getClassData(id: CharacterClass): ClassDataDef | undefined {
  return CLASSES_DATA.find((c) => c.id === id)
}

export function getLevelFeatures(classId: CharacterClass, level: number): ClassFeatureEntry[] {
  const classData = getClassData(classId)
  return classData?.levels[level]?.features ?? []
}

export function getProficiencyBonusAtLevel(level: number): number {
  return Math.ceil(level / 4) + 1
}
