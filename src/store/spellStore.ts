import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CharacterClass } from '@/types'
import type { SpellLevel, SpellSlots, PactSlots } from '@/utils/spellSlotTable'
import { getSlotsForCharacter, getPactSlotsForWarlock, isWarlock } from '@/utils/spellSlotTable'

// ─── Spell types ──────────────────────────────────────────────────────────────

export type SpellSchool =
  | 'abjuration' | 'conjuration' | 'divination' | 'enchantment'
  | 'evocation' | 'illusion' | 'necromancy' | 'transmutation'

export interface SpellComponents {
  verbal: boolean
  somatic: boolean
  material: boolean
  materialDescription?: string
}

export interface Spell {
  id: string
  name: string
  level: number
  school: SpellSchool
  castingTime: string
  range: string
  components: SpellComponents
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
  higherLevels?: string
  classes: string[]
  source: string
  damageType?: string
  savingThrow?: string
}

export const SPELL_SCHOOL_LABELS: Record<SpellSchool, string> = {
  abjuration: 'Abjuration', conjuration: 'Conjuration', divination: 'Divination',
  enchantment: 'Enchantment', evocation: 'Evocation', illusion: 'Illusion',
  necromancy: 'Necromancy', transmutation: 'Transmutation',
}

export const SPELL_SCHOOL_COLORS: Record<SpellSchool, string> = {
  abjuration: 'bg-blue-100 text-blue-800 border border-blue-300',
  conjuration: 'bg-violet-100 text-violet-800 border border-violet-300',
  divination: 'bg-sky-100 text-sky-800 border border-sky-300',
  enchantment: 'bg-pink-100 text-pink-800 border border-pink-300',
  evocation: 'bg-orange-100 text-orange-800 border border-orange-300',
  illusion: 'bg-purple-100 text-purple-800 border border-purple-300',
  necromancy: 'bg-green-100 text-green-800 border border-green-300',
  transmutation: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
}

export const CHARACTER_CLASS_LABELS: Record<CharacterClass, string> = {
  barbarian: 'Barbarian', bard: 'Bard', cleric: 'Cleric', druid: 'Druid',
  fighter: 'Fighter', monk: 'Monk', paladin: 'Paladin', ranger: 'Ranger',
  rogue: 'Rogue', sorcerer: 'Sorcerer', warlock: 'Warlock', wizard: 'Wizard',
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface SpellFilters {
  searchQuery: string
  levels: number[]
  classes: string[]
  schools: SpellSchool[]
  concentration: boolean | null
  ritual: boolean | null
}

const DEFAULT_FILTERS: SpellFilters = {
  searchQuery: '', levels: [], classes: [], schools: [],
  concentration: null, ritual: null,
}

// ─── Spell Character (lightweight, for spell management) ──────────────────────

export interface SpellCharacter {
  id: string
  name: string
  class: CharacterClass
  level: number
  subclass?: string
  spellcastingModifier?: number
  spellSlots: SpellSlots
  pactSlots?: PactSlots
  preparedSpellIds: string[]
  concentratingOnSpellId: string | null
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface SpellStore {
  spells: Spell[]
  spellCharacters: SpellCharacter[]
  activeSpellCharacterId: string | null
  filters: SpellFilters
  concentrationWarning: { spellId: string } | null

  setSpells: (spells: Spell[]) => void

  // Character spell management
  ensureSpellCharacter: (id: string, name: string, cls: CharacterClass, level: number, modifier?: number) => void
  updateSpellCharacter: (id: string, patch: Partial<Pick<SpellCharacter, 'name' | 'level' | 'subclass' | 'spellcastingModifier' | 'class'>>) => void
  removeSpellCharacter: (id: string) => void
  setActiveSpellCharacter: (id: string | null) => void
  getActiveSpellCharacter: () => SpellCharacter | undefined

  // Spell Slots
  useSlot: (characterId: string, level: SpellLevel) => void
  recoverSlot: (characterId: string, level: SpellLevel) => void
  longRest: (characterId: string) => void
  shortRest: (characterId: string) => void

  // Prepared Spells
  addPreparedSpell: (characterId: string, spellId: string) => void
  removePreparedSpell: (characterId: string, spellId: string) => void

  // Concentration
  startConcentration: (characterId: string, spellId: string) => void
  endConcentration: (characterId: string) => void
  dismissConcentrationWarning: () => void
  confirmConcentrationSwitch: (characterId: string, newSpellId: string) => void

  // Filters
  setFilter: (patch: Partial<SpellFilters>) => void
  resetFilters: () => void
}

export const useSpellStore = create<SpellStore>()(
  persist(
    (set, get) => ({
      spells: [],
      spellCharacters: [],
      activeSpellCharacterId: null,
      filters: DEFAULT_FILTERS,
      concentrationWarning: null,

      setSpells: (spells) => set({ spells }),

      ensureSpellCharacter: (id, name, cls, level, modifier) => {
        const existing = get().spellCharacters.find(c => c.id === id)
        if (existing) {
          // Update if changed
          if (existing.name !== name || existing.class !== cls || existing.level !== level) {
            get().updateSpellCharacter(id, { name, class: cls, level, spellcastingModifier: modifier })
          }
          return
        }
        const spellSlots = getSlotsForCharacter(cls, level)
        const pactSlots = isWarlock(cls) ? getPactSlotsForWarlock(level) : undefined
        const character: SpellCharacter = {
          id, name, class: cls, level,
          spellcastingModifier: modifier,
          spellSlots, pactSlots,
          preparedSpellIds: [],
          concentratingOnSpellId: null,
        }
        set(s => ({ spellCharacters: [...s.spellCharacters, character] }))
      },

      updateSpellCharacter: (id, patch) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== id) return c
            const updated = { ...c, ...patch }
            if (patch.level !== undefined && patch.level !== c.level) {
              updated.spellSlots = getSlotsForCharacter(updated.class, patch.level)
              if (isWarlock(updated.class)) updated.pactSlots = getPactSlotsForWarlock(patch.level)
            }
            if (patch.class !== undefined && patch.class !== c.class) {
              updated.spellSlots = getSlotsForCharacter(patch.class, updated.level)
              updated.pactSlots = isWarlock(patch.class) ? getPactSlotsForWarlock(updated.level) : undefined
            }
            return updated
          }),
        }))
      },

      removeSpellCharacter: (id) => {
        set(s => ({
          spellCharacters: s.spellCharacters.filter(c => c.id !== id),
          activeSpellCharacterId: s.activeSpellCharacterId === id ? null : s.activeSpellCharacterId,
        }))
      },

      setActiveSpellCharacter: (id) => set({ activeSpellCharacterId: id }),

      getActiveSpellCharacter: () => {
        const { spellCharacters, activeSpellCharacterId } = get()
        return spellCharacters.find(c => c.id === activeSpellCharacterId)
      },

      // ─── Spell Slots ───────────────────────────────────────────────────────
      useSlot: (characterId, level) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== characterId) return c
            if (isWarlock(c.class) && c.pactSlots && c.pactSlots.level === level) {
              if (c.pactSlots.used >= c.pactSlots.total) return c
              return { ...c, pactSlots: { ...c.pactSlots, used: c.pactSlots.used + 1 } }
            }
            const slot = c.spellSlots[level]
            if (!slot || slot.used >= slot.total) return c
            return { ...c, spellSlots: { ...c.spellSlots, [level]: { ...slot, used: slot.used + 1 } } }
          }),
        }))
      },

      recoverSlot: (characterId, level) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== characterId) return c
            if (isWarlock(c.class) && c.pactSlots && c.pactSlots.level === level) {
              if (c.pactSlots.used === 0) return c
              return { ...c, pactSlots: { ...c.pactSlots, used: c.pactSlots.used - 1 } }
            }
            const slot = c.spellSlots[level]
            if (!slot || slot.used === 0) return c
            return { ...c, spellSlots: { ...c.spellSlots, [level]: { ...slot, used: slot.used - 1 } } }
          }),
        }))
      },

      longRest: (characterId) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== characterId) return c
            const resetSlots = { ...c.spellSlots }
            for (const key of Object.keys(resetSlots) as unknown as SpellLevel[]) {
              resetSlots[key] = { ...resetSlots[key], used: 0 }
            }
            return {
              ...c, spellSlots: resetSlots,
              pactSlots: c.pactSlots ? { ...c.pactSlots, used: 0 } : undefined,
              concentratingOnSpellId: null,
            }
          }),
        }))
      },

      shortRest: (characterId) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== characterId) return c
            if (!isWarlock(c.class) || !c.pactSlots) return c
            return { ...c, pactSlots: { ...c.pactSlots, used: 0 } }
          }),
        }))
      },

      // ─── Prepared Spells ────────────────────────────────────────────────────
      addPreparedSpell: (characterId, spellId) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== characterId || c.preparedSpellIds.includes(spellId)) return c
            return { ...c, preparedSpellIds: [...c.preparedSpellIds, spellId] }
          }),
        }))
      },

      removePreparedSpell: (characterId, spellId) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c => {
            if (c.id !== characterId) return c
            return { ...c, preparedSpellIds: c.preparedSpellIds.filter(id => id !== spellId) }
          }),
        }))
      },

      // ─── Concentration ──────────────────────────────────────────────────────
      startConcentration: (characterId, spellId) => {
        const character = get().spellCharacters.find(c => c.id === characterId)
        if (!character) return
        if (character.concentratingOnSpellId && character.concentratingOnSpellId !== spellId) {
          set({ concentrationWarning: { spellId } })
          return
        }
        set(s => ({
          spellCharacters: s.spellCharacters.map(c =>
            c.id === characterId ? { ...c, concentratingOnSpellId: spellId } : c
          ),
        }))
      },

      endConcentration: (characterId) => {
        set(s => ({
          spellCharacters: s.spellCharacters.map(c =>
            c.id === characterId ? { ...c, concentratingOnSpellId: null } : c
          ),
        }))
      },

      dismissConcentrationWarning: () => set({ concentrationWarning: null }),

      confirmConcentrationSwitch: (characterId, newSpellId) => {
        set(s => ({
          concentrationWarning: null,
          spellCharacters: s.spellCharacters.map(c =>
            c.id === characterId ? { ...c, concentratingOnSpellId: newSpellId } : c
          ),
        }))
      },

      // ─── Filters ────────────────────────────────────────────────────────────
      setFilter: (patch) => set(s => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    }),
    {
      name: 'dnd-spell-store-v1',
      partialize: (state) => ({
        spellCharacters: state.spellCharacters,
        activeSpellCharacterId: state.activeSpellCharacterId,
      }),
    }
  )
)

export const selectActiveSpellCharacter = (state: SpellStore) =>
  state.spellCharacters.find(c => c.id === state.activeSpellCharacterId)
