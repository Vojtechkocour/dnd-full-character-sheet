import type { Character, CharacterClass, DieSize, AbilityName, ProficiencyLevel, SkillName } from '@/types'
import { SKILL_ABILITY_MAP } from '@/types'
import { CLASSES_DATA } from '@/data/classes'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'
import { getFeatById } from '@/data/feats'

const ABILITY_SHORT: Record<string, string> = {
  strength: 'STR', dexterity: 'DEX', constitution: 'CON',
  intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
}

const SKILL_LABELS: Record<SkillName, string> = {
  acrobatics: 'Acrobatics', animalHandling: 'Animal Handling', arcana: 'Arcana',
  athletics: 'Athletics', deception: 'Deception', history: 'History',
  insight: 'Insight', intimidation: 'Intimidation', investigation: 'Investigation',
  medicine: 'Medicine', nature: 'Nature', perception: 'Perception',
  performance: 'Performance', persuasion: 'Persuasion', religion: 'Religion',
  sleightOfHand: 'Sleight of Hand', stealth: 'Stealth', survival: 'Survival',
}

interface Props {
  character: Character
  onChange: (patch: Partial<Character>) => void
}

export default function Step2Class({ character, onChange }: Props) {
  const primaryClass = character.classes[0]
  const selectedClassData = CLASSES_DATA.find((c) => c.id === primaryClass?.class)

  const bgSkills = new Set(character.background?.skillProficiencies ?? [])

  // Total non-bg skills chosen
  const totalChosen = (Object.entries(character.skills) as [SkillName, ProficiencyLevel][])
    .filter(([skill, val]) => val !== 'none' && !bgSkills.has(skill)).length

  // ── Feat skill detection ───────────────────────────────────────────────────
  const isHuman = character.speciesId === 'human'
  const bgData = BACKGROUNDS_DATA.find(b => b.name === character.background?.name)
  const bgFeatDef = bgData ? getFeatById(bgData.featId) : undefined
  const bgFeatNeedsSkills = bgFeatDef?.choice?.type === 'skills'
  const bgFeatSkillCount = bgFeatNeedsSkills ? bgFeatDef!.choice!.count : 0

  const humanOriginFeatDef = isHuman && character.originFeatChoice
    ? getFeatById(character.originFeatChoice)
    : undefined
  const humanFeatNeedsSkills = humanOriginFeatDef?.choice?.type === 'skills'
  const humanFeatSkillCount = humanFeatNeedsSkills ? humanOriginFeatDef!.choice!.count : 0

  // ── Class actions ──────────────────────────────────────────────────────────
  function selectClass(classId: CharacterClass) {
    const classData = CLASSES_DATA.find((c) => c.id === classId)
    if (!classData) return

    const level = primaryClass?.level ?? 1

    const savingThrows = { ...character.savingThrows }
    for (const key of Object.keys(savingThrows) as AbilityName[]) {
      if (savingThrows[key] === 'proficient') savingThrows[key] = 'none'
    }
    for (const save of classData.savingThrows) {
      savingThrows[save] = 'proficient'
    }

    const skills = { ...character.skills }
    for (const skill of Object.keys(skills) as SkillName[]) {
      if (!bgSkills.has(skill)) skills[skill] = 'none'
    }

    // Remove old class tools (fixed + chosen), then add new fixed tools
    const oldClassData = selectedClassData
    const toolsWithoutOldClass = character.toolProficiencies.filter(t =>
      !character.classToolChoices.includes(t) &&
      !(oldClassData?.toolProficiencies ?? []).includes(t)
    )
    const newToolProficiencies = [
      ...toolsWithoutOldClass,
      ...(classData.toolProficiencies ?? []),
    ]

    onChange({
      classes: [{ class: classId, level, hitDie: classData.hitDie as DieSize }],
      hitDice: [{ dieSize: classData.hitDie as DieSize, total: level, remaining: level }],
      savingThrows,
      skills,
      armorProficiencies: classData.armorProficiencies,
      weaponProficiencies: classData.weaponProficiencies,
      toolProficiencies: newToolProficiencies,
      classToolChoices: [],
    })
  }

  function setLevel(level: number) {
    if (!primaryClass || !selectedClassData) return
    const clamped = Math.min(20, Math.max(1, level))
    onChange({
      classes: [{ ...primaryClass, level: clamped }],
      hitDice: [{ dieSize: primaryClass.hitDie, total: clamped, remaining: clamped }],
    })
  }

  function setSubclass(subclass: string) {
    if (!primaryClass) return
    onChange({ classes: [{ ...primaryClass, subclass }, ...character.classes.slice(1)] })
  }

  function toggleSkill(skillName: SkillName, atTotalLimit: boolean) {
    if (bgSkills.has(skillName)) return
    const current = character.skills[skillName]
    const isSelected = current !== 'none'
    if (!isSelected && atTotalLimit) return
    const next: ProficiencyLevel = isSelected ? 'none' : 'proficient'
    onChange({ skills: { ...character.skills, [skillName]: next } })
  }

  return (
    <div className="space-y-5">
      {/* Class grid */}
      <div>
        <label className="section-header block">Class *</label>
        <div className="grid grid-cols-3 gap-2">
          {CLASSES_DATA.map((cls) => {
            const isSelected = primaryClass?.class === cls.id
            return (
              <button
                key={cls.id}
                onClick={() => selectClass(cls.id)}
                className={`
                  paper-card px-3 py-2.5 text-sm font-serif text-left transition-all
                  ${isSelected
                    ? 'border-accent-gold bg-parchment-200 text-ink font-semibold shadow-sm'
                    : 'hover:border-ink/30 hover:bg-parchment-100 text-ink-muted'
                  }
                `}
              >
                <div>{cls.name}</div>
                <div className="text-xs opacity-60">d{cls.hitDie} · {cls.savingThrows.map(s => s.slice(0, 3).toUpperCase()).join('/')}</div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedClassData && (
        <>
          {/* Level + Subclass */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-header block">Level</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setLevel((primaryClass?.level ?? 1) - 1)} className="w-8 h-8 paper-card text-ink-muted hover:text-ink hover:bg-parchment-200 text-lg transition-colors">−</button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={primaryClass?.level ?? 1}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="field-box flex-1 text-center text-lg font-display"
                />
                <button onClick={() => setLevel((primaryClass?.level ?? 1) + 1)} className="w-8 h-8 paper-card text-ink-muted hover:text-ink hover:bg-parchment-200 text-lg transition-colors">+</button>
              </div>
            </div>
            <div>
              <label className="section-header block">Subclass</label>
              <input
                type="text"
                value={primaryClass?.subclass ?? ''}
                onChange={(e) => setSubclass(e.target.value)}
                placeholder={`${selectedClassData.subclassLabel}...`}
                className="field-box w-full"
              />
              {(primaryClass?.level ?? 0) >= selectedClassData.subclassLevel && !primaryClass?.subclass && (
                <p className="text-xs text-accent-gold mt-1 font-sans">
                  ⚡ At this level you choose a subclass ({selectedClassData.subclassLabel})!
                </p>
              )}
            </div>
          </div>

          {/* Class info */}
          <div className="paper-card p-3 bg-parchment-100/60">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-sans text-ink-muted">
              <div><strong>Saving Throws:</strong> {selectedClassData.savingThrows.map(s => s.slice(0, 3).toUpperCase()).join(', ')}</div>
              <div><strong>Hit Die:</strong> d{selectedClassData.hitDie}</div>
              <div><strong>Prof Bonus:</strong> +{Math.ceil((primaryClass?.level ?? 1) / 4) + 1}</div>
              <div><strong>Subclass at:</strong> Level {selectedClassData.subclassLevel}</div>
              {selectedClassData.armorProficiencies.length > 0 && (
                <div className="col-span-2"><strong>Armor:</strong> {selectedClassData.armorProficiencies.join(', ')}</div>
              )}
              <div className="col-span-2"><strong>Weapons:</strong> {selectedClassData.weaponProficiencies.join(', ')}</div>
            </div>
          </div>

          {/* Skill selection */}
          {(() => {
            const totalAvailable = selectedClassData.skillCount
              + (isHuman ? 1 : 0)
              + bgFeatSkillCount
              + humanFeatSkillCount
            const atTotalLimit = totalChosen >= totalAvailable

            const parts: string[] = []
            parts.push(`${selectedClassData.skillCount} from class (${selectedClassData.name})`)
            if (isHuman) parts.push('1 from species (Skillful)')
            if (bgFeatNeedsSkills && bgFeatDef) parts.push(`${bgFeatSkillCount} from feat ${bgFeatDef.name}`)
            if (humanFeatNeedsSkills && humanOriginFeatDef) parts.push(`${humanFeatSkillCount} from feat ${humanOriginFeatDef.name}`)

            return (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="section-header">Skill Proficiencies</div>
                  <div className={`flex items-center gap-1.5 text-sm font-sans font-semibold px-2.5 py-1 rounded-full ${
                    atTotalLimit ? 'bg-ink text-parchment-50' : 'bg-parchment-200 text-ink'
                  }`}>
                    <span>{totalChosen}</span>
                    <span className="opacity-50">/</span>
                    <span>{totalAvailable}</span>
                  </div>
                </div>
                <p className="text-xs text-ink-muted font-sans mb-2">
                  {parts.join(' · ')}
                  {bgSkills.size > 0 && (
                    <> · bg: <strong className="text-ink">{[...bgSkills].map(s => SKILL_LABELS[s] ?? s).join(', ')}</strong></>
                  )}
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {(Object.keys(SKILL_LABELS) as SkillName[]).map((skill) => {
                    const isBg = bgSkills.has(skill)
                    const isClassChoice = selectedClassData.skillChoices.includes(skill)
                    const prof = character.skills[skill]
                    const isSelected = prof !== 'none'
                    const isDisabled = isBg || (!isSelected && atTotalLimit)

                    return (
                      <div
                        key={skill}
                        onClick={() => toggleSkill(skill, atTotalLimit)}
                        className={`
                          flex items-center gap-2 py-1 px-1 rounded select-none text-sm transition-opacity
                          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-parchment-200'}
                        `}
                      >
                        <div className={`prof-dot flex-shrink-0 ${isSelected ? 'filled' : ''}`} />
                        <span className={`font-serif ${isClassChoice ? 'text-ink' : 'text-ink-muted'}`}>
                          {SKILL_LABELS[skill]}
                        </span>
                        <span className="text-xs text-ink-muted font-sans ml-auto">
                          {isBg ? '(bg)' : ABILITY_SHORT[SKILL_ABILITY_MAP[skill]]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

        </>
      )}
    </div>
  )
}
