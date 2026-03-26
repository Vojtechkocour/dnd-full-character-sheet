import type { ArmorDef } from '@/types'

export const ARMOR_DATA: ArmorDef[] = [
  // ── Light Armor ───────────────────────────────────────────────────────────────
  {
    name: 'Padded Armor',
    type: 'light', ac: '11 + DEX',
    stealthDisadvantage: true,
    cost: '5 GP', weight: 8,
    description: 'Quilted layers of cloth and batting. Provides minimal protection but is cheap and easy to acquire. The stitching hinders stealthy movement.',
  },
  {
    name: 'Leather Armor',
    type: 'light', ac: '11 + DEX',
    cost: '10 GP', weight: 10,
    description: 'Hardened leather shaped to protect the torso. Lightweight and quiet, making it the go-to armor for Rangers, Bards, and Rogues who need mobility.',
  },
  {
    name: 'Studded Leather Armor',
    type: 'light', ac: '12 + DEX',
    cost: '45 GP', weight: 13,
    description: 'Leather reinforced with close-set metal rivets. Better protection than plain leather while retaining quiet, mobile properties. Popular with seasoned Rogues.',
  },

  // ── Medium Armor ─────────────────────────────────────────────────────────────
  {
    name: 'Hide Armor',
    type: 'medium', ac: '12 + DEX (max 2)',
    cost: '10 GP', weight: 12,
    description: 'Thick furs and hide stitched together. Crude but effective, commonly worn by Barbarians and tribal warriors who lack access to metalwork.',
  },
  {
    name: 'Chain Shirt',
    type: 'medium', ac: '13 + DEX (max 2)',
    cost: '50 GP', weight: 20,
    description: 'Interlocking metal rings covering the torso. A good balance of protection and comfort, worn under clothing by Clerics and Fighters seeking discretion.',
  },
  {
    name: 'Scale Mail',
    type: 'medium', ac: '14 + DEX (max 2)',
    stealthDisadvantage: true,
    cost: '50 GP', weight: 45,
    description: 'Overlapping metal scales on a leather backing. Solid protection for its cost, though the clanking scales make stealth difficult.',
  },
  {
    name: 'Breastplate',
    type: 'medium', ac: '14 + DEX (max 2)',
    cost: '400 GP', weight: 20,
    description: 'A fitted metal chest piece with flexible leather beneath. Excellent protection without sacrificing mobility or stealth — the choice of wealthy warriors.',
  },
  {
    name: 'Half Plate Armor',
    type: 'medium', ac: '15 + DEX (max 2)',
    stealthDisadvantage: true,
    cost: '750 GP', weight: 40,
    description: 'Shaped metal plates covering most of the body, excluding legs. Among the best medium armor, but expensive and noisy.',
  },

  // ── Heavy Armor ──────────────────────────────────────────────────────────────
  {
    name: 'Ring Mail',
    type: 'heavy', ac: '14',
    stealthDisadvantage: true,
    cost: '30 GP', weight: 40,
    description: 'Leather armor with heavy metal rings sewn on. Inferior to chain mail in protection, but much cheaper. Mostly worn by guards and militia.',
  },
  {
    name: 'Chain Mail',
    type: 'heavy', ac: '16',
    strengthReq: 13, stealthDisadvantage: true,
    cost: '75 GP', weight: 55,
    description: 'Full-body armor of interlocking metal rings. The standard heavy armor for many adventurers, providing solid protection at a reasonable price.',
  },
  {
    name: 'Splint Armor',
    type: 'heavy', ac: '17',
    strengthReq: 15, stealthDisadvantage: true,
    cost: '200 GP', weight: 60,
    description: 'Narrow metal strips woven over a chain backing. Near-top-tier protection favored by experienced Fighters and Paladins who can afford it.',
  },
  {
    name: 'Plate Armor',
    type: 'heavy', ac: '18',
    strengthReq: 15, stealthDisadvantage: true,
    cost: '1500 GP', weight: 65,
    description: 'The pinnacle of armor craftsmanship — interlocking formed metal plates covering the entire body. The highest AC available. A symbol of elite warriors and nobles.',
  },

  // ── Shield ───────────────────────────────────────────────────────────────────
  {
    name: 'Shield',
    type: 'shield', ac: '+2',
    cost: '10 GP', weight: 6,
    description: 'A wooden or metal board carried in one hand. Provides a flat +2 bonus to AC. Cannot be used with two-handed or versatile weapons wielded two-handed.',
  },
]

export function getArmorDef(name: string): ArmorDef | undefined {
  return ARMOR_DATA.find(a => a.name === name)
}
