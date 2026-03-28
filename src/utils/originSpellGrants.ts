import type { Character, SpellGrantDef } from '@/types'
import type { Spell } from '@/store/spellStore'
import { ORIGIN_FEATS } from '@/data/feats'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'
import { SPECIES_DATA } from '@/data/species'

// ─── Fixed spell grants (auto-added at certain character levels) ───────────────

export interface ActiveFixedGrant {
  spellId: string
  spellName: string
  usesPerLongRest: number | null
  sourceName: string
}

export function getActiveFixedSpellGrants(character: Character, allSpells: Spell[]): ActiveFixedGrant[] {
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0)
  const results: ActiveFixedGrant[] = []

  function resolveGrants(grants: { spellName: string; requiredLevel: number; usesPerLongRest: number | null }[], sourceName: string) {
    for (const grant of grants) {
      if (totalLevel < grant.requiredLevel) continue
      const spell = allSpells.find(s => s.name.toLowerCase() === grant.spellName.toLowerCase())
      if (!spell) continue
      results.push({ spellId: spell.id, spellName: spell.name, usesPerLongRest: grant.usesPerLongRest, sourceName })
    }
  }

  // Species-level fixed grants (e.g. Aasimar Light)
  const speciesData = SPECIES_DATA.find(s => s.id === character.speciesId)
  if (speciesData?.fixedSpellGrants) {
    resolveGrants(speciesData.fixedSpellGrants, speciesData.name)
  }

  // Subspecies fixed grants
  if (character.speciesChoice && speciesData?.subspecies) {
    const subOption = speciesData.subspecies.options.find(o => o.id === character.speciesChoice)
    if (subOption?.fixedSpellGrants) {
      resolveGrants(subOption.fixedSpellGrants, subOption.name)
    }
  }

  return results
}

export interface ResolvedGrant {
  grantDef: SpellGrantDef
  sourceName: string        // e.g. "Magic Initiate (Cleric)", "High Elf"
  alreadyChosenIds: string[]
  isSatisfied: boolean
}

export function getOriginSpellGrants(character: Character, allSpells: Spell[]): ResolvedGrant[] {
  const results: ResolvedGrant[] = []

  // ── Background ────────────────────────────────────────────────────────────
  if (character.background) {
    const bgData = BACKGROUNDS_DATA.find(b => b.name === character.background!.name)
    if (bgData) {
      const feat = ORIGIN_FEATS.find(f => f.id === bgData.featId)
      if (feat?.spellGrants) {
        for (const grantDef of feat.spellGrants) {
          const alreadyChosenIds = character.originSpellChoices.filter(id => {
            const spell = allSpells.find(s => s.id === id)
            return spell
              && spell.classes.includes(grantDef.spellClass)
              && spell.level === grantDef.maxLevel
          })
          results.push({
            grantDef,
            sourceName: feat.name,
            alreadyChosenIds,
            isSatisfied: alreadyChosenIds.length >= grantDef.count,
          })
        }
      }
    }
  }

  // ── Species / Subspecies ──────────────────────────────────────────────────
  if (character.speciesChoice) {
    const speciesData = SPECIES_DATA.find(s => s.id === character.speciesId)
    if (speciesData?.subspecies) {
      const subOption = speciesData.subspecies.options.find(o => o.id === character.speciesChoice)
      if (subOption?.spellGrants) {
        for (const grantDef of subOption.spellGrants) {
          const alreadyChosenIds = character.originSpellChoices.filter(id => {
            const spell = allSpells.find(s => s.id === id)
            return spell
              && spell.classes.includes(grantDef.spellClass)
              && spell.level === grantDef.maxLevel
          })
          results.push({
            grantDef,
            sourceName: subOption.name,
            alreadyChosenIds,
            isSatisfied: alreadyChosenIds.length >= grantDef.count,
          })
        }
      }
    }
  }

  // ── Level-up feat choices (e.g. Magic Initiate taken at ASI level) ─────────
  for (const featId of (character.takenFeatIds ?? [])) {
    const feat = ORIGIN_FEATS.find(f => f.id === featId)
    if (!feat?.spellGrants) continue
    for (const grantDef of feat.spellGrants) {
      const alreadyChosenIds = character.originSpellChoices.filter(id => {
        const spell = allSpells.find(s => s.id === id)
        return spell
          && spell.classes.includes(grantDef.spellClass)
          && spell.level === grantDef.maxLevel
      })
      results.push({
        grantDef,
        sourceName: feat.name,
        alreadyChosenIds,
        isSatisfied: alreadyChosenIds.length >= grantDef.count,
      })
    }
  }

  return results
}
