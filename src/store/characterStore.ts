import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from '@/types'
import { createNewCharacter } from '@/utils/defaults'

interface CharacterStore {
  characters: Character[]
  activeCharacterId: string | null

  // Actions
  addCharacter: (name?: string) => Character
  updateCharacter: (id: string, patch: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  setActiveCharacter: (id: string | null) => void
  getCharacter: (id: string) => Character | undefined
  duplicateCharacter: (id: string) => Character | undefined
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],
      activeCharacterId: null,

      addCharacter: (name) => {
        const character = createNewCharacter(name)
        set((state) => ({
          characters: [...state.characters, character],
          activeCharacterId: character.id,
        }))
        return character
      },

      updateCharacter: (id, patch) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          activeCharacterId:
            state.activeCharacterId === id ? null : state.activeCharacterId,
        }))
      },

      setActiveCharacter: (id) => {
        set({ activeCharacterId: id })
      },

      getCharacter: (id) => {
        return get().characters.find((c) => c.id === id)
      },

      duplicateCharacter: (id) => {
        const original = get().getCharacter(id)
        if (!original) return undefined
        const now = new Date().toISOString()
        const duplicate: Character = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (copy)`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          characters: [...state.characters, duplicate],
        }))
        return duplicate
      },
    }),
    {
      name: 'dnd-characters-v1',
    }
  )
)
