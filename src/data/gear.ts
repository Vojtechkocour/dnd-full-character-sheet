import type { GearDef } from '@/types'

export const GEAR_DATA: GearDef[] = [
  // ── Equipment Packs ───────────────────────────────────────────────────────────
  {
    name: "Explorer's Pack",
    cost: '10 GP', weight: 59,
    description: 'Contains: Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 Rations, Waterskin, 50 ft Hempen Rope. Everything needed for wilderness survival.',
  },
  {
    name: "Priest's Pack",
    cost: '19 GP', weight: 24,
    description: 'Contains: Backpack, Blanket, 10 Candles, Tinderbox, Alms Box, 2 Blocks of Incense, Censer, Vestments, 2 Rations, Waterskin. For clergy and healers.',
  },
  {
    name: "Dungeoneer's Pack",
    cost: '12 GP', weight: 61.5,
    description: 'Contains: Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 Rations, Waterskin, 50 ft Hempen Rope. Optimized for dungeon delving.',
  },
  {
    name: "Scholar's Pack",
    cost: '40 GP', weight: 10,
    description: 'Contains: Backpack, Book of Lore, Bottle of Ink, Ink Pen, 10 sheets Parchment, Bag of Sand, Penknife. For wizards and academics.',
  },
  {
    name: "Burglar's Pack",
    cost: '16 GP', weight: 44.5,
    description: "Contains: Backpack, 1000 Ball Bearings, 10 ft String, Bell, 5 Candles, Crowbar, Hammer, 10 Pitons, Hooded Lantern, 2 Oil Flasks, 5 Rations, Tinderbox, Waterskin, 50 ft Hempen Rope. For rogues and infiltrators.",
  },
  {
    name: "Entertainer's Pack",
    cost: '40 GP', weight: 38,
    description: 'Contains: Backpack, Bedroll, 2 Costumes, 5 Candles, 5 Rations, Waterskin, Disguise Kit. For performers and social adventurers.',
  },
  {
    name: "Diplomat's Pack",
    cost: '39 GP', weight: 36,
    description: "Contains: Chest, 2 Map Cases, Fine Clothes, Bottle of Ink, Ink Pen, Lamp, 2 Oil Flasks, 5 Sheets Paper, Vial of Perfume, Sealing Wax, Soap. For nobles and envoys.",
  },

  // ── Ammunition ───────────────────────────────────────────────────────────────
  {
    name: 'Arrows (20)',
    cost: '1 GP', weight: 1,
    description: 'Twenty arrows for use with a shortbow or longbow. Standard ammunition for archers.',
  },
  {
    name: 'Crossbow Bolts (20)',
    cost: '1 GP', weight: 1.5,
    description: 'Twenty bolts for use with any crossbow. Standard ammunition for crossbow users.',
  },
  {
    name: 'Sling Bullets (20)',
    cost: '4 CP', weight: 1.5,
    description: 'Twenty lead bullets for use with a sling. Cheap and easy to produce or find.',
  },

  // ── Focus Items ───────────────────────────────────────────────────────────────
  {
    name: 'Arcane Focus',
    cost: '10 GP', weight: 1,
    description: 'A crystal, orb, rod, staff, or wand that serves as a spellcasting focus. Required to cast spells without using spell components. Used by Sorcerers, Warlocks, and Wizards.',
  },
  {
    name: 'Druidic Focus',
    cost: '5 GP', weight: 1,
    description: 'A sprig of mistletoe, totem, staff, or yew wand serving as a focus for druidic magic. Required by Druids instead of material components.',
  },
  {
    name: 'Holy Symbol',
    cost: '5 GP', weight: 1,
    description: "An amulet, emblem, or reliquary bearing the symbol of a deity. Serves as a spellcasting focus for Clerics and Paladins. Can be worn or held.",
  },

  // ── Books & Writing ──────────────────────────────────────────────────────────
  {
    name: 'Spellbook',
    cost: '50 GP', weight: 3,
    description: 'A leather-bound book containing a Wizard\'s spells. Starts with 6 1st-level spells. Essential for all Wizards — without it, they cannot prepare spells.',
  },
  {
    name: 'Book',
    cost: '25 GP', weight: 5,
    description: 'A written tome on a specific subject. Might contain lore, maps, or technical knowledge useful during adventures.',
  },

  // ── Containers ───────────────────────────────────────────────────────────────
  {
    name: 'Backpack',
    cost: '2 GP', weight: 5,
    description: 'A leather pack with straps to carry equipment on your back. Can hold up to 30 lbs of gear.',
  },
  {
    name: 'Pouch',
    cost: '5 SP', weight: 1,
    description: 'A small bag used to carry coins, components, or small items. Can hold up to 6 lbs.',
  },
  {
    name: 'Chest',
    cost: '5 GP', weight: 25,
    description: 'A large wooden box with a lock. Can hold up to 300 lbs of gear. Typically kept at a base.',
  },

  // ── Clothing ─────────────────────────────────────────────────────────────────
  {
    name: "Traveler's Clothes",
    cost: '2 GP', weight: 4,
    description: 'Sturdy, practical clothing for long journeys. Protects against weather without drawing attention.',
  },
  {
    name: 'Fine Clothes',
    cost: '15 GP', weight: 6,
    description: 'Elegant attire suitable for noble courts and high society. Grants advantage on Charisma checks in formal settings.',
  },
  {
    name: 'Robe',
    cost: '1 GP', weight: 4,
    description: 'A long garment commonly worn by scholars, priests, and mages. Practical and comfortable.',
  },
  {
    name: 'Costume',
    cost: '5 GP', weight: 4,
    description: 'Theatrical clothing for a specific character or creature. Part of a performer\'s or infiltrator\'s toolkit.',
  },

  // ── Light & Fire ─────────────────────────────────────────────────────────────
  {
    name: 'Torch',
    cost: '1 CP', weight: 1,
    description: 'A wooden stick tipped with oily material. Burns for 1 hour, shedding bright light in a 20 ft radius and dim light for another 20 ft.',
  },
  {
    name: 'Candle',
    cost: '1 CP', weight: 0,
    description: 'Burns for 1 hour, shedding dim light in a 5 ft radius. Used for reading, rituals, and subtle illumination.',
  },
  {
    name: 'Hooded Lantern',
    cost: '5 GP', weight: 2,
    description: 'Burns oil for 6 hours, shedding bright light in a 30 ft radius. The hood can be closed to reduce light to a dim glow.',
  },
  {
    name: 'Oil Flask',
    cost: '1 SP', weight: 1,
    description: 'A flask of oil. Used to fuel lanterns, can be used as a thrown improvised weapon that deals fire damage when lit.',
  },
  {
    name: 'Tinderbox',
    cost: '5 SP', weight: 1,
    description: 'A small container holding flint, fire steel, and tinder. Used to start fires — takes 1 action to light a torch or smaller fire.',
  },

  // ── Tools & Supplies ─────────────────────────────────────────────────────────
  {
    name: 'Crowbar',
    cost: '2 GP', weight: 5,
    description: 'An iron bar with a curved end. Grants advantage on Strength checks where leverage can be applied.',
  },
  {
    name: 'Hammer',
    cost: '1 GP', weight: 3,
    description: 'A wooden-handled iron hammer. Used to drive pitons and perform general construction tasks.',
  },
  {
    name: 'Piton',
    cost: '5 CP', weight: 0.25,
    description: 'A metal spike driven into rock to serve as an anchor for climbing ropes.',
  },
  {
    name: 'Rope (50 ft)',
    cost: '1 GP', weight: 10,
    description: 'Fifty feet of hempen rope. Can hold up to 300 lbs. Essential for climbing, binding prisoners, and dozens of creative uses.',
  },
  {
    name: 'Mess Kit',
    cost: '2 SP', weight: 1,
    description: 'A tin box with cooking and eating utensils. Allows you to prepare and eat meals while traveling.',
  },
  {
    name: 'Healer\'s Kit',
    cost: '5 GP', weight: 3,
    description: 'Bandages, salves, and splints. Used to stabilize a dying creature (DC 10 Medicine check with advantage) or to provide basic first aid.',
  },
  {
    name: 'Thieves\' Tools',
    cost: '25 GP', weight: 1,
    description: 'Lock picks, a small file, a set of screwdrivers, and other implements. Required to pick locks and disarm traps using Dexterity.',
  },

  // ── Provisions ───────────────────────────────────────────────────────────────
  {
    name: 'Rations (1 day)',
    cost: '5 SP', weight: 2,
    description: 'Dry food for one day of travel: hardtack, dried fruit, jerky, and nuts. Lasts for an extended period without spoiling.',
  },
  {
    name: 'Waterskin',
    cost: '2 SP', weight: 5,
    description: 'A leather pouch for water, holding up to 4 pints. Essential for survival in any environment without water sources.',
  },

  // ── Miscellaneous ─────────────────────────────────────────────────────────────
  {
    name: 'Bedroll',
    cost: '1 GP', weight: 7,
    description: 'A roll of fabric used as a portable bed. Provides comfortable sleep while traveling and grants advantage on Constitution saving throws vs. exhaustion from sleeping outdoors.',
  },
  {
    name: 'Blanket',
    cost: '5 SP', weight: 3,
    description: 'A wool blanket that provides warmth during rest. Lighter than a bedroll, used in established camps.',
  },
  {
    name: 'Disguise Kit',
    cost: '25 GP', weight: 3,
    description: 'Cosmetics, hair dye, props, and a small mirror. Required to create disguises using Charisma (Deception) checks.',
  },
]

export function getGearDef(name: string): GearDef | undefined {
  return GEAR_DATA.find(g => g.name === name)
}
