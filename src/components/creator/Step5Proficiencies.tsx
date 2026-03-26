import type { Character, SkillName, AbilityName, ProficiencyLevel } from '@/types'
import { SKILL_ABILITY_MAP } from '@/types'
import { CLASSES_DATA } from '@/data/classes'
import { ARTISAN_TOOLS, INSTRUMENTS } from '@/data/feats'
import { getSkillBonus, getSavingThrowBonus, getProficiencyBonus, getTotalLevel, formatModifier } from '@/utils/calculations'

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
  onChange: (patch: Partial<Character>) => void
}

export default function Step5Proficiencies({ character, onChange }: Props) {
  const profBonus = getProficiencyBonus(getTotalLevel(character))
  const classData = CLASSES_DATA.find(c => c.id === character.classes[0]?.class)

  const bgSkills = new Set(character.background?.skillProficiencies ?? [])
  const classSkills = new Set(
    classData
      ? (Object.keys(character.skills) as SkillName[]).filter(
          s => character.skills[s] !== 'none' && classData.skillChoices.includes(s) && !bgSkills.has(s)
        )
      : []
  )

  function toggleSkill(skill: SkillName) {
    if (bgSkills.has(skill)) return

    const current = character.skills[skill]

    if (classSkills.has(skill)) {
      const next: ProficiencyLevel = current === 'proficient' ? 'expertise' : 'proficient'
      onChange({ skills: { ...character.skills, [skill]: next } })
      return
    }

    const next: ProficiencyLevel =
      current === 'none' ? 'proficient' : current === 'proficient' ? 'expertise' : 'none'
    onChange({ skills: { ...character.skills, [skill]: next } })
  }

  function toggleSave(ability: AbilityName) {
    if (classData?.savingThrows.includes(ability)) return
    const current = character.savingThrows[ability]
    const next = current === 'none' ? 'proficient' : 'none'
    onChange({ savingThrows: { ...character.savingThrows, [ability]: next } })
  }

  const bgSkillList = [...bgSkills].map(s => SKILL_LABELS[s] ?? s)
  const classSkillList = [...classSkills].map(s => SKILL_LABELS[s] ?? s)

  function handleClassToolChoice(slotIndex: number, tool: string) {
    const oldChoice = character.classToolChoices[slotIndex] ?? ''
    const newChoices = [...character.classToolChoices]
    newChoices[slotIndex] = tool

    const withoutOld = oldChoice ? character.toolProficiencies.filter(t => t !== oldChoice) : character.toolProficiencies
    const newTools = tool ? [...withoutOld, tool] : withoutOld
    onChange({ classToolChoices: newChoices, toolProficiencies: newTools })
  }

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="paper-card p-3 bg-parchment-100/60 space-y-1.5">
        <div className="text-xs font-sans font-semibold text-ink mb-1">Acquired Skills Summary</div>
        {bgSkillList.length > 0 && (
          <div className="flex gap-2 text-xs font-sans">
            <span className="text-ink-muted shrink-0">Background:</span>
            <span className="text-ink font-medium">{bgSkillList.join(', ')}</span>
            <span className="text-ink-muted italic ml-auto shrink-0">locked</span>
          </div>
        )}
        {classSkillList.length > 0 && (
          <div className="flex gap-2 text-xs font-sans">
            <span className="text-ink-muted shrink-0">Class ({classData?.name}):</span>
            <span className="text-ink font-medium">{classSkillList.join(', ')}</span>
            <span className="text-ink-muted italic ml-auto shrink-0">{classSkillList.length}/{classData?.skillCount} · click = expertise</span>
          </div>
        )}
        {bgSkillList.length === 0 && classSkillList.length === 0 && (
          <p className="text-xs text-ink-muted italic">No skills set yet (go back and select a class and background).</p>
        )}
      </div>

      {/* Saving Throws */}
      <div>
        <div className="section-header mb-1">Saving Throws</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {ABILITIES.map((ability) => {
            const isClassSave = classData?.savingThrows.includes(ability) ?? false
            const prof = character.savingThrows[ability]
            const bonus = getSavingThrowBonus(ability, prof, character.abilityScores, profBonus)
            return (
              <div
                key={ability}
                className={`flex items-center gap-2 py-1 px-1 rounded ${
                  isClassSave ? 'cursor-default' : 'cursor-pointer hover:bg-parchment-200'
                }`}
                onClick={() => toggleSave(ability)}
              >
                <div className={`prof-dot ${prof !== 'none' ? 'filled' : ''}`} />
                <span className="font-sans text-xs text-ink-muted w-8">{ABILITY_SHORT[ability]}</span>
                <span className="font-display text-sm text-ink w-8">{formatModifier(bonus)}</span>
                {isClassSave && <span className="text-xs text-ink-muted font-sans ml-auto">(class)</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="section-header mb-1">
          Skills
          <span className="ml-2 text-ink-muted normal-case tracking-normal font-sans text-xs">
            · class skills: click = expertise · others: add/remove
          </span>
        </div>
        <div className="space-y-0.5">
          {(Object.keys(SKILL_LABELS) as SkillName[]).map((skill) => {
            const isBg = bgSkills.has(skill)
            const isClass = classSkills.has(skill)
            const prof = character.skills[skill]
            const ability = SKILL_ABILITY_MAP[skill]
            const bonus = getSkillBonus(skill, prof, character.abilityScores, profBonus)

            let sourceLabel: string | null = null
            if (isBg) sourceLabel = 'bg'
            else if (isClass) sourceLabel = 'class'

            return (
              <div
                key={skill}
                className={`flex items-center gap-2 py-1 px-1 rounded ${
                  isBg ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-parchment-200'
                }`}
                onClick={() => toggleSkill(skill)}
              >
                <div
                  className={`prof-dot flex-shrink-0
                    ${prof === 'proficient' ? 'filled' : ''}
                    ${prof === 'expertise' ? '!bg-accent-gold !border-accent-gold' : ''}
                  `}
                />
                <span className="font-display text-sm text-ink w-7">{formatModifier(bonus)}</span>
                <span className="font-serif text-sm text-ink flex-1">{SKILL_LABELS[skill]}</span>
                <span className="font-sans text-xs text-ink-muted w-8 text-right">{ABILITY_SHORT[ability]}</span>
                {sourceLabel && (
                  <span className="text-xs text-ink-muted font-sans w-8 text-right">{sourceLabel}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tool Proficiencies */}
      {classData && (classData.toolProficiencies?.length || classData.toolChoices?.length) ? (
        <div>
          <div className="section-header mb-1">Tool Proficiencies</div>

          {/* Fixed class tools */}
          {classData.toolProficiencies?.map((tool) => (
            <div key={tool} className="flex items-center gap-2 py-1 px-1 text-sm">
              <div className="prof-dot filled flex-shrink-0" />
              <span className="font-serif text-ink flex-1">{tool}</span>
              <span className="text-xs text-ink-muted font-sans">class</span>
            </div>
          ))}

          {/* Class tool choices */}
          {classData.toolChoices?.map((choice, i) => {
            const options: readonly string[] = choice.from === 'instrument' ? INSTRUMENTS : ARTISAN_TOOLS
            const label = choice.from === 'instrument' ? 'Musical Instrument' : "Artisan's Tools"
            const groupStart = classData.toolChoices!.slice(0, i).reduce((s, c) => s + c.count, 0)
            const groupSlots = Array.from({ length: choice.count }, (_, k) => groupStart + k)
            return groupSlots.map((absSlot, slotIdx) => {
              const chosen = character.classToolChoices[absSlot] ?? ''
              const otherChosen = new Set(
                groupSlots.filter(s => s !== absSlot).map(s => character.classToolChoices[s] ?? '').filter(Boolean)
              )
              return (
                <div key={`choice-${i}-${slotIdx}`} className="mt-1.5">
                  <select
                    value={chosen}
                    onChange={(e) => handleClassToolChoice(absSlot, e.target.value)}
                    className="field-box w-full text-sm"
                  >
                    <option value="">— Choose {label} —</option>
                    {options.map((opt) => (
                      otherChosen.has(opt) ? null : <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )
            })
          })}
        </div>
      ) : null}
    </div>
  )
}
