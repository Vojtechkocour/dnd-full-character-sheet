import { useMemo } from 'react'
import type { Spell, SpellFilters } from '@/store/spellStore'

export function useSpellFilter(spells: Spell[], filters: SpellFilters): Spell[] {
  return useMemo(() => {
    return spells.filter((spell) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        if (!spell.name.toLowerCase().includes(q) && !spell.description.toLowerCase().includes(q)) return false
      }
      if (filters.levels.length > 0 && !filters.levels.includes(spell.level)) return false
      if (filters.schools.length > 0 && !filters.schools.includes(spell.school)) return false
      if (filters.classes.length > 0 && !filters.classes.some((c) => spell.classes.includes(c))) return false
      if (filters.concentration !== null && spell.concentration !== filters.concentration) return false
      if (filters.ritual !== null && spell.ritual !== filters.ritual) return false
      return true
    })
  }, [spells, filters])
}
