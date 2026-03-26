import type { SkillName } from '@/types'

export interface SpeciesTrait {
  name: string
  description: string
}

export interface SubspeciesOption {
  id: string
  name: string
  traits: SpeciesTrait[]
  speedOverride?: number
  darkvisionOverride?: number
  bonusSkill?: SkillName
}

export interface SpeciesDataDef {
  id: string
  name: string
  speed: number
  size: 'Small' | 'Medium' | 'Small or Medium'
  darkvision?: number
  description: string
  traits: SpeciesTrait[]
  subspecies?: {
    label: string   // "Lineage", "Draconic Ancestry", "Giant Ancestry", "Legacy"
    options: SubspeciesOption[]
  }
}

export const SPECIES_DATA: SpeciesDataDef[] = [
  // ─── Aasimar ───────────────────────────────────────────────────────────────
  {
    id: 'aasimar',
    name: 'Aasimar',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    description: 'Mortals who carry a spark of the Upper Planes within their souls.',
    traits: [
      {
        name: 'Celestial Resistance',
        description: 'You have resistance to Necrotic damage and Radiant damage.',
      },
      {
        name: 'Healing Hands',
        description: 'As a Magic action, you touch a creature and heal it for a number of d4s equal to your Proficiency Bonus. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      },
      {
        name: 'Light Bearer',
        description: 'You know the Light cantrip. Charisma is your spellcasting ability for it.',
      },
      {
        name: 'Celestial Revelation',
        description: 'When you reach character level 3, you can transform as a Bonus Action using one of the following options (chosen when you gain this trait): Heavenly Wings (fly speed = walking speed), Inner Radiance (+radiant damage = Prof Bonus 1/turn, emit light), or Necrotic Shroud (frighten nearby creatures, +necrotic damage = Prof Bonus 1/turn). Lasts 1 minute. Once used, Long Rest required.',
      },
    ],
  },

  // ─── Dragonborn ────────────────────────────────────────────────────────────
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    description: 'Born of dragons, dragonborn walk proudly through a world that greets them with fearful incomprehension.',
    traits: [
      {
        name: 'Draconic Ancestry',
        description: 'Your lineage stems from a particular kind of dragon. Choose a dragon type from your Draconic Ancestry — this determines your Breath Weapon damage type and damage resistance.',
      },
      {
        name: 'Breath Weapon',
        description: 'When you take the Attack action, you can replace one attack with this Breath Weapon. Choose a 15-foot Cone or a 30-foot Line (width 5 ft). Each creature in the area makes a Dexterity saving throw (DC = 8 + CON modifier + Proficiency Bonus). On failed save, the creature takes 1d10 damage (type from ancestry), increasing to 2d10 at character level 5, 3d10 at level 11, and 4d10 at level 17. On successful save, half damage. Recharges on Short or Long Rest.',
      },
      {
        name: 'Damage Resistance',
        description: 'You have resistance to the damage type associated with your Draconic Ancestry.',
      },
      {
        name: 'Draconic Flight',
        description: 'Starting at character level 5, you can use a Bonus Action to manifest spectral wings. For 10 minutes, you have a Fly Speed equal to your Speed. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      },
    ],
    subspecies: {
      label: 'Draconic Ancestry',
      options: [
        { id: 'black', name: 'Black (Acid)', traits: [{ name: 'Acid Ancestry', description: 'Breath Weapon and Damage Resistance are Acid.' }] },
        { id: 'blue', name: 'Blue (Lightning)', traits: [{ name: 'Lightning Ancestry', description: 'Breath Weapon and Damage Resistance are Lightning.' }] },
        { id: 'brass', name: 'Brass (Fire)', traits: [{ name: 'Fire Ancestry', description: 'Breath Weapon and Damage Resistance are Fire.' }] },
        { id: 'bronze', name: 'Bronze (Lightning)', traits: [{ name: 'Lightning Ancestry', description: 'Breath Weapon and Damage Resistance are Lightning.' }] },
        { id: 'copper', name: 'Copper (Acid)', traits: [{ name: 'Acid Ancestry', description: 'Breath Weapon and Damage Resistance are Acid.' }] },
        { id: 'gold', name: 'Gold (Fire)', traits: [{ name: 'Fire Ancestry', description: 'Breath Weapon and Damage Resistance are Fire.' }] },
        { id: 'green', name: 'Green (Poison)', traits: [{ name: 'Poison Ancestry', description: 'Breath Weapon and Damage Resistance are Poison.' }] },
        { id: 'red', name: 'Red (Fire)', traits: [{ name: 'Fire Ancestry', description: 'Breath Weapon and Damage Resistance are Fire.' }] },
        { id: 'silver', name: 'Silver (Cold)', traits: [{ name: 'Cold Ancestry', description: 'Breath Weapon and Damage Resistance are Cold.' }] },
        { id: 'white', name: 'White (Cold)', traits: [{ name: 'Cold Ancestry', description: 'Breath Weapon and Damage Resistance are Cold.' }] },
      ],
    },
  },

  // ─── Dwarf ─────────────────────────────────────────────────────────────────
  {
    id: 'dwarf',
    name: 'Dwarf',
    speed: 30,
    size: 'Medium',
    darkvision: 120,
    description: 'Bold and hardy, dwarves are known for their skill in warfare and their ability to endure great hardship.',
    traits: [
      {
        name: 'Dwarven Resilience',
        description: 'You have resistance to Poison damage. You also have advantage on saving throws you make to avoid or end the Poisoned condition.',
      },
      {
        name: 'Dwarven Toughness',
        description: 'Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.',
      },
      {
        name: 'Stonecunning',
        description: 'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
      },
      {
        name: 'Tool Proficiency',
        description: 'You gain proficiency with one of the following tools of your choice: Mason\'s Tools, Smith\'s Tools, or Brewer\'s Supplies.',
      },
    ],
  },

  // ─── Elf ───────────────────────────────────────────────────────────────────
  {
    id: 'elf',
    name: 'Elf',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    description: 'Elves are a magical people of otherworldly grace, living in places of ethereal beauty.',
    traits: [
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws you make to avoid or end the Charmed condition on yourself. Magic can\'t put you to sleep.',
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
      },
      {
        name: 'Trance',
        description: 'You don\'t need to sleep. Instead, you meditate deeply for 4 hours a day (a "trance"), after which you gain the same benefit a human does from 8 hours of sleep. You are immune to any spell or effect that would put you to sleep.',
      },
      {
        name: 'Elven Lineage',
        description: 'You gain additional traits based on your chosen lineage (Drow, High Elf, or Wood Elf). These grant spellcasting abilities that scale with character level.',
      },
    ],
    subspecies: {
      label: 'Elven Lineage',
      options: [
        {
          id: 'drow',
          name: 'Drow',
          darkvisionOverride: 120,
          traits: [
            { name: 'Drow Magic', description: 'You know the Dancing Lights cantrip (CHA). At character level 3: Faerie Fire 1/long rest (CHA). At level 5: Darkness 1/long rest (CHA).' },
          ],
        },
        {
          id: 'high_elf',
          name: 'High Elf',
          traits: [
            { name: 'High Elf Cantrip', description: 'You know one cantrip of your choice from the Wizard spell list. Intelligence is your spellcasting ability for it.' },
            { name: 'High Elf Magic', description: 'At character level 3: Detect Magic 1/long rest (INT). At level 5: Misty Step 1/long rest (INT).' },
          ],
        },
        {
          id: 'wood_elf',
          name: 'Wood Elf',
          speedOverride: 35,
          traits: [
            { name: 'Fleet of Foot', description: 'Your Speed is 35 feet.' },
            { name: 'Wood Elf Magic', description: 'You know the Druidcraft cantrip (WIS). At character level 3: Longstrider 1/long rest (WIS). At level 5: Pass Without Trace 1/long rest (WIS).' },
          ],
        },
      ],
    },
  },

  // ─── Gnome ─────────────────────────────────────────────────────────────────
  {
    id: 'gnome',
    name: 'Gnome',
    speed: 30,
    size: 'Small',
    darkvision: 60,
    description: 'A gnome\'s energy and enthusiasm for living shines through every inch of their tiny body.',
    traits: [
      {
        name: 'Gnomish Cunning',
        description: 'You have advantage on Intelligence, Wisdom, and Charisma saving throws.',
      },
      {
        name: 'Gnomish Lineage',
        description: 'You gain additional traits based on your chosen lineage (Forest or Rock Gnome).',
      },
    ],
    subspecies: {
      label: 'Gnomish Lineage',
      options: [
        {
          id: 'forest',
          name: 'Forest Gnome',
          traits: [
            { name: 'Minor Illusion', description: 'You know the Minor Illusion cantrip. Intelligence is your spellcasting ability for it.' },
            { name: 'Speak with Animals', description: 'You can cast Speak with Animals a number of times equal to your Proficiency Bonus per Long Rest, requiring no spell slots. Intelligence is your spellcasting ability.' },
          ],
        },
        {
          id: 'rock',
          name: 'Rock Gnome',
          traits: [
            { name: 'Prestidigitation', description: 'You know the Prestidigitation cantrip. Intelligence is your spellcasting ability for it.' },
            { name: 'Tinker', description: 'You have proficiency with Tinker\'s Tools. Using those tools, you can spend 1 hour and 10 GP worth of materials to construct a Tiny clockwork device (AC 5, 1 HP). You can have up to three such devices active at a time.' },
          ],
        },
      ],
    },
  },

  // ─── Goliath ───────────────────────────────────────────────────────────────
  {
    id: 'goliath',
    name: 'Goliath',
    speed: 35,
    size: 'Medium',
    description: 'Goliaths wander a bleak realm of rock, wind, and cold. Their bodies look as if they are carved from mountain stone.',
    traits: [
      {
        name: 'Giant Ancestry',
        description: 'You are part of a lineage that descended from a Giant. Choose one of the following Giant Ancestry options (determines your magical ability).',
      },
      {
        name: 'Large Form',
        description: 'Starting at character level 5, you can change your size to Large as a Bonus Action. This transformation lasts 10 minutes or until you end it (no action required). During this time, your Speed is 10 feet greater. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      },
      {
        name: 'Powerful Build',
        description: 'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift. You also have advantage on any saving throw you make to avoid or end the Prone condition.',
      },
    ],
    subspecies: {
      label: 'Giant Ancestry',
      options: [
        { id: 'cloud', name: 'Cloud Giant', traits: [{ name: 'Cloud\'s Jaunt', description: 'As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see. Once used, Long Rest required.' }] },
        { id: 'fire', name: 'Fire Giant', traits: [{ name: 'Fire\'s Burn', description: 'When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target. Once used, Short or Long Rest required.' }] },
        { id: 'frost', name: 'Frost Giant', traits: [{ name: 'Frost\'s Chill', description: 'When you hit a target with an attack roll and deal damage, you can give that target the Slowed condition until the start of your next turn. Once used, Short or Long Rest required.' }] },
        { id: 'hill', name: 'Hill Giant', traits: [{ name: 'Hill\'s Tumble', description: 'When you hit a Large or smaller creature with an attack roll and deal damage, you can give that target the Prone condition. Once used, Short or Long Rest required.' }] },
        { id: 'stone', name: 'Stone Giant', traits: [{ name: 'Stone\'s Endurance', description: 'When you take damage, you can use your Reaction to roll 1d12. Add your Constitution modifier to the number rolled and reduce the damage by that total. Once used, Short or Long Rest required.' }] },
        { id: 'storm', name: 'Storm Giant', traits: [{ name: 'Storm\'s Thunder', description: 'When you take damage from a creature within 60 feet, you can use your Reaction to deal 1d8 Thunder damage to that creature. Once used, Short or Long Rest required.' }] },
      ],
    },
  },

  // ─── Halfling ──────────────────────────────────────────────────────────────
  {
    id: 'halfling',
    name: 'Halfling',
    speed: 30,
    size: 'Small',
    description: 'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense.',
    traits: [
      {
        name: 'Brave',
        description: 'You have advantage on saving throws you make to avoid or end the Frightened condition on yourself.',
      },
      {
        name: 'Halfling Nimbleness',
        description: 'You can move through the space of any creature that is a size larger than yours, but you can\'t stop there.',
      },
      {
        name: 'Luck',
        description: 'When you roll a 1 on the d20 of a d20 Test, you can reroll the die, and you must use the new roll.',
      },
      {
        name: 'Naturally Stealthy',
        description: 'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.',
      },
      {
        name: 'Halfling Lineage',
        description: 'You gain additional traits based on your chosen lineage.',
      },
    ],
    subspecies: {
      label: 'Halfling Lineage',
      options: [
        {
          id: 'lightfoot',
          name: 'Lightfoot',
          traits: [
            { name: 'Easily Overlooked', description: 'You are proficient in the Stealth skill. If you are already proficient in that skill, you instead gain Expertise in it.' },
          ],
        },
        {
          id: 'stout',
          name: 'Stout',
          traits: [
            { name: 'Stout Resilience', description: 'You have advantage on saving throws you make to avoid or end the Poisoned condition on yourself. You also have resistance to Poison damage.' },
          ],
        },
      ],
    },
  },

  // ─── Human ─────────────────────────────────────────────────────────────────
  {
    id: 'human',
    name: 'Human',
    speed: 30,
    size: 'Medium',
    description: 'Humans are the most adaptable and ambitious people among the common races.',
    traits: [
      {
        name: 'Resourceful',
        description: 'You gain Inspiration whenever you finish a Long Rest.',
      },
      {
        name: 'Skillful',
        description: 'You gain proficiency in one skill of your choice.',
      },
      {
        name: 'Versatile',
        description: 'You gain the Origin feat of your choice. (Applied during character creation — choose any Origin feat.)',
      },
    ],
  },

  // ─── Orc ───────────────────────────────────────────────────────────────────
  {
    id: 'orc',
    name: 'Orc',
    speed: 30,
    size: 'Medium',
    darkvision: 120,
    description: 'Orcs trace their creation to Gruumsh, a powerful god who roamed a wild and savage world.',
    traits: [
      {
        name: 'Adrenaline Rush',
        description: 'You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus. You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
      },
      {
        name: 'Powerful Build',
        description: 'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.',
      },
      {
        name: 'Relentless Endurance',
        description: 'When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      },
    ],
  },

  // ─── Tiefling ──────────────────────────────────────────────────────────────
  {
    id: 'tiefling',
    name: 'Tiefling',
    speed: 30,
    size: 'Medium',
    darkvision: 60,
    description: 'To be greeted with stares and whispers, to suffer violence and insult on the street — this is the lot of the tiefling.',
    traits: [
      {
        name: 'Hellish Resistance',
        description: 'You have resistance to Fire damage.',
      },
      {
        name: 'Fiendish Legacy',
        description: 'You gain additional spellcasting based on your chosen legacy (Abyssal, Chthonic, or Infernal).',
      },
    ],
    subspecies: {
      label: 'Fiendish Legacy',
      options: [
        {
          id: 'abyssal',
          name: 'Abyssal',
          traits: [
            { name: 'Abyssal Magic', description: 'You know the Poison Spray cantrip (CHA). At character level 3: Ray of Sickness 1/long rest (CHA). At level 5: Hold Person 1/long rest (CHA).' },
            { name: 'Abyssal Resistance', description: 'You also have resistance to Poison damage.' },
          ],
        },
        {
          id: 'chthonic',
          name: 'Chthonic',
          traits: [
            { name: 'Chthonic Magic', description: 'You know the Chill Touch cantrip (CHA). At character level 3: False Life 1/long rest (CHA). At level 5: Ray of Enfeeblement 1/long rest (CHA).' },
            { name: 'Chthonic Resistance', description: 'You also have resistance to Necrotic damage.' },
          ],
        },
        {
          id: 'infernal',
          name: 'Infernal',
          traits: [
            { name: 'Infernal Magic', description: 'You know the Fire Bolt cantrip (CHA). At character level 3: Hellish Rebuke 1/long rest (CHA). At level 5: Darkness 1/long rest (CHA).' },
          ],
        },
      ],
    },
  },
]
