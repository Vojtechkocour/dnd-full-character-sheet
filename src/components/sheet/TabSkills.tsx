import { useCharacterStore } from '@/store/characterStore'
import type { Character, SkillName, AbilityName, ProficiencyLevel } from '@/types'
import type { CalculatedStats } from '@/types'
import { SKILL_ABILITY_MAP } from '@/types'
import { getSkillBonus, getSavingThrowBonus, formatModifier } from '@/utils/calculations'

const SKILL_LABELS: Record<SkillName, string> = {
  acrobatics: 'Acrobatics', animalHandling: 'Animal Handling', arcana: 'Arcana',
  athletics: 'Athletics', deception: 'Deception', history: 'History',
  insight: 'Insight', intimidation: 'Intimidation', investigation: 'Investigation',
  medicine: 'Medicine', nature: 'Nature', perception: 'Perception',
  performance: 'Performance', persuasion: 'Persuasion', religion: 'Religion',
  sleightOfHand: 'Sleight of Hand', stealth: 'Stealth', survival: 'Survival',
}

const ABILITY_SHORT: Record<AbilityName, string> = {
  strength: 'STR', dexterity: 'DEX', constitution: 'CON',
  intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
}

const ABILITIES: AbilityName[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

interface Props {
  character: Character
  stats: CalculatedStats
}

export default function TabSkills({ character, stats }: Props) {
  const { updateCharacter } = useCharacterStore()
  const profBonus = stats.proficiencyBonus

  function cycleSkill(skill: SkillName) {
    const current = character.skills[skill]
    const next: ProficiencyLevel = current === 'none' ? 'proficient' : current === 'proficient' ? 'expertise' : 'none'
    updateCharacter(character.id, { skills: { ...character.skills, [skill]: next } })
  }

  function toggleSave(ability: AbilityName) {
    const current = character.savingThrows[ability]
    const next: ProficiencyLevel = current === 'none' ? 'proficient' : 'none'
    updateCharacter(character.id, { savingThrows: { ...character.savingThrows, [ability]: next } })
  }

  return (
    <div className="space-y-4">
      {/* Saving Throws */}
      <div className="paper-card p-4">
        <div className="section-header">Saving Throws</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {ABILITIES.map((ability) => {
            const prof = character.savingThrows[ability]
            const bonus = getSavingThrowBonus(ability, prof, character.abilityScores, profBonus)
            return (
              <div
                key={ability}
                className="flex items-center gap-2 py-1 cursor-pointer hover:bg-parchment-200 px-1 rounded select-none"
                onClick={() => toggleSave(ability)}
              >
                <div className={`prof-dot ${prof !== 'none' ? 'filled' : ''}`} />
                <span className="font-display text-sm text-ink w-8">{formatModifier(bonus)}</span>
                <span className="font-serif text-sm text-ink flex-1">{ABILITY_SHORT[ability]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="paper-card p-4">
        <div className="section-header">
          Skills
          <span className="ml-2 font-sans text-ink-muted normal-case tracking-normal">
            ● = prof &nbsp; ◆ = expertise
          </span>
        </div>
        <div className="space-y-0.5">
          {(Object.keys(SKILL_LABELS) as SkillName[]).map((skill) => {
            const prof = character.skills[skill]
            const ability = SKILL_ABILITY_MAP[skill]
            const bonus = getSkillBonus(skill, prof, character.abilityScores, profBonus)
            return (
              <div
                key={skill}
                className="flex items-center gap-2 py-1 cursor-pointer hover:bg-parchment-200 px-1 rounded select-none"
                onClick={() => cycleSkill(skill)}
              >
                <div
                  className={`
                    w-3.5 h-3.5 rounded-full border flex-shrink-0 transition-colors
                    ${prof === 'none' ? 'border-ink/30 bg-parchment-100' : ''}
                    ${prof === 'proficient' ? 'bg-ink border-ink' : ''}
                    ${prof === 'expertise' ? 'bg-accent-gold border-accent-gold' : ''}
                  `}
                />
                <span className="font-display text-sm text-ink w-7">{formatModifier(bonus)}</span>
                <span className="font-serif text-sm text-ink flex-1">{SKILL_LABELS[skill]}</span>
                <span className="font-sans text-xs text-ink-muted">{ABILITY_SHORT[ability]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Languages & Proficiencies */}
      {(character.languages.length > 0 || character.toolProficiencies.length > 0 || character.armorProficiencies.length > 0) && (
        <div className="paper-card p-4">
          <div className="section-header">Proficiencies & Languages</div>
          {character.languages.length > 0 && (
            <p className="font-serif text-sm text-ink">
              <strong>Languages:</strong> {character.languages.join(', ')}
            </p>
          )}
          {character.armorProficiencies.length > 0 && (
            <p className="font-serif text-sm text-ink mt-1">
              <strong>Armor:</strong> {character.armorProficiencies.join(', ')}
            </p>
          )}
          {character.weaponProficiencies.length > 0 && (
            <p className="font-serif text-sm text-ink mt-1">
              <strong>Weapons:</strong> {character.weaponProficiencies.join(', ')}
            </p>
          )}
          {character.toolProficiencies.length > 0 && (
            <p className="font-serif text-sm text-ink mt-1">
              <strong>Tools:</strong> {character.toolProficiencies.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
