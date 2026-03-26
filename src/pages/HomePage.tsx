import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { calculateStats } from '@/utils/calculations'
import type { Character, AbilityName, SkillName } from '@/types'
import { SKILL_ABILITY_MAP } from '@/types'

const CLASS_LABELS: Record<string, string> = {
  barbarian: 'Barbarian', bard: 'Bard', cleric: 'Cleric', druid: 'Druid',
  fighter: 'Fighter', monk: 'Monk', paladin: 'Paladin', ranger: 'Ranger',
  rogue: 'Rogue', sorcerer: 'Sorcerer', warlock: 'Warlock', wizard: 'Wizard',
}

const SKILL_LABELS: Record<SkillName, string> = {
  acrobatics: 'Acrobatics', animalHandling: 'Animal Handling', arcana: 'Arcana',
  athletics: 'Athletics', deception: 'Deception', history: 'History',
  insight: 'Insight', intimidation: 'Intimidation', investigation: 'Investigation',
  medicine: 'Medicine', nature: 'Nature', perception: 'Perception',
  performance: 'Performance', persuasion: 'Persuasion', religion: 'Religion',
  sleightOfHand: 'Sleight of Hand', stealth: 'Stealth', survival: 'Survival',
}

// Color per ability — subtle, parchment-friendly
const ABILITY_STYLE: Record<AbilityName, string> = {
  strength:     'bg-red-100   text-red-700   border-red-200',
  dexterity:    'bg-green-100 text-green-700 border-green-200',
  constitution: 'bg-orange-100 text-orange-700 border-orange-200',
  intelligence: 'bg-blue-100  text-blue-700  border-blue-200',
  wisdom:       'bg-purple-100 text-purple-700 border-purple-200',
  charisma:     'bg-pink-100  text-pink-700  border-pink-200',
}

const ABILITY_SHORT: Record<AbilityName, string> = {
  strength: 'STR', dexterity: 'DEX', constitution: 'CON',
  intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
}

function CharacterCard({ character, onOpen, onDelete, onDuplicate }: {
  character: Character
  onOpen: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const stats = calculateStats(character)
  const classLine = character.classes
    .map((c) => `${CLASS_LABELS[c.class] ?? c.class} ${c.level}`)
    .join(' / ')

  return (
    <div className="paper-card p-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={onOpen}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl text-ink leading-tight truncate">{character.name}</h2>
          <p className="text-sm text-ink-muted font-serif mt-0.5">
            {character.species && <span>{character.species} · </span>}
            {classLine || <span className="italic">No class</span>}
            {stats.totalLevel > 0 && <span> · Level {stats.totalLevel}</span>}
          </p>
          {character.background && (
            <p className="text-xs text-ink-muted mt-0.5">{character.background.name}</p>
          )}
        </div>

        {/* Action buttons */}
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onDuplicate}
            className="p-1.5 text-ink-muted hover:text-ink rounded hover:bg-parchment-200 transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => { onDelete(); setConfirmDelete(false) }}
                className="px-2 py-1 text-xs bg-accent-red text-parchment-50 rounded font-sans"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs bg-parchment-200 text-ink rounded font-sans"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-ink-muted hover:text-accent-red rounded hover:bg-parchment-200 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      {stats.totalLevel > 0 && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-parchment-300">
          <div className="text-center">
            <div className="font-display text-base text-ink leading-none">{character.armorClass}</div>
            <div className="text-xs text-ink-muted">AC</div>
          </div>
          <div className="text-center">
            <div className="font-display text-base text-ink leading-none">{character.hitPoints.maximum}</div>
            <div className="text-xs text-ink-muted">HP</div>
          </div>
          <div className="text-center">
            <div className="font-display text-base text-ink leading-none">+{stats.proficiencyBonus}</div>
            <div className="text-xs text-ink-muted">Prof</div>
          </div>
          <div className="text-center">
            <div className="font-display text-base text-ink leading-none">{stats.passivePerception}</div>
            <div className="text-xs text-ink-muted">Passive Perc</div>
          </div>
        </div>
      )}

      {/* Skill proficiencies */}
      {(() => {
        const proficientSkills = (Object.entries(character.skills) as [SkillName, string][])
          .filter(([, level]) => level === 'proficient' || level === 'expertise')
          .sort(([a], [b]) => {
            const abilityA = SKILL_ABILITY_MAP[a]
            const abilityB = SKILL_ABILITY_MAP[b]
            return abilityA.localeCompare(abilityB) || a.localeCompare(b)
          })
        if (proficientSkills.length === 0) return null
        return (
          <div className="mt-3 pt-3 border-t border-parchment-300 flex flex-wrap gap-1">
            {proficientSkills.map(([skill, level]) => {
              const ability = SKILL_ABILITY_MAP[skill]
              return (
                <span key={skill} className="inline-flex items-center gap-1 text-xs font-sans">
                  <span className={`px-1 py-0.5 rounded border font-semibold leading-none ${ABILITY_STYLE[ability]}`}>
                    {ABILITY_SHORT[ability]}
                  </span>
                  <span className="text-ink-muted">
                    {SKILL_LABELS[skill]}
                    {level === 'expertise' && <span className="ml-0.5 text-accent-gold">★</span>}
                  </span>
                </span>
              )
            })}
          </div>
        )
      })()}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { characters, deleteCharacter, duplicateCharacter } = useCharacterStore()

  function handleNewCharacter() {
    navigate('/new')
  }

  function handleOpenCharacter(id: string) {
    navigate(`/character/${id}`)
  }

  function handleDelete(id: string) {
    deleteCharacter(id)
  }

  function handleDuplicate(id: string) {
    const dup = duplicateCharacter(id)
    if (dup) navigate(`/character/${dup.id}`)
  }

  return (
    <div className="min-h-screen bg-parchment-100 px-4 py-8">
      <div className="max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-ink">Character Vault</h1>
          <p className="text-ink-muted font-serif mt-2 italic">D&amp;D 5e · 2024 Edition</p>
          <div className="w-24 h-px bg-accent-gold mx-auto mt-4" />
        </div>

        {/* Character list */}
        {characters.length > 0 ? (
          <div className="grid gap-3 mb-6 lg:grid-cols-2">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onOpen={() => handleOpenCharacter(character.id)}
                onDelete={() => handleDelete(character.id)}
                onDuplicate={() => handleDuplicate(character.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-ink-muted">
            <div className="text-5xl mb-4">⚔</div>
            <p className="font-serif text-lg italic">No characters yet.</p>
            <p className="font-serif text-sm mt-1">Create your first character below.</p>
          </div>
        )}

        {/* New character button */}
        <button
          onClick={handleNewCharacter}
          className="w-full paper-card border-dashed p-4 text-center font-display text-ink-muted hover:text-ink hover:border-ink/40 hover:shadow-sm transition-all group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">+</span>
          <span className="ml-2 text-lg">New Character</span>
        </button>
      </div>
    </div>
  )
}
