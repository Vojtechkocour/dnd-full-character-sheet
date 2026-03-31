import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import type { Character, AbilityName, SkillName } from '@/types'
import { getClassData, getLevelFeatures, getProficiencyBonusAtLevel } from '@/data/classes'
import { getAbilityModifier, calculateStats, formatModifier } from '@/utils/calculations'
import type { ClassFeatureEntry } from '@/data/classes'
import { GENERAL_FEATS, EPIC_BOON_FEATS, ALL_SKILLS } from '@/data/feats'
import type { OriginFeatDef } from '@/data/feats'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'
import { applyFeatToCharacter } from '@/utils/applyFeat'

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Strength', dexterity: 'Dexterity', constitution: 'Constitution',
  intelligence: 'Intelligence', wisdom: 'Wisdom', charisma: 'Charisma',
}
const ABILITY_KEYS: AbilityName[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

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
  onClose: () => void
}

export default function LevelUpModal({ character, onClose }: Props) {
  const { updateCharacter } = useCharacterStore()
  const stats = calculateStats(character)

  const primaryClass = character.classes[0]
  const classData = primaryClass ? getClassData(primaryClass.class) : undefined

  const currentLevel = stats.totalLevel
  const newLevel = currentLevel + 1

  if (!primaryClass || !classData || newLevel > 20) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-8 text-ink-muted font-serif italic">
          {newLevel > 20 ? 'Level 20 is the maximum!' : 'No class assigned.'}
        </div>
      </ModalShell>
    )
  }

  const hitDie = primaryClass.hitDie
  const conMod = getAbilityModifier(character.abilityScores.constitution)

  const newFeatures = getLevelFeatures(primaryClass.class, newLevel)
  const hasASI = newFeatures.some((f) => f.type === 'asi' || f.type === 'epicBoon')
  const isEpicBoonLevel = newFeatures.some((f) => f.type === 'epicBoon')
  const hasSubclass = newFeatures.some((f) => f.type === 'subclass')

  const oldProfBonus = getProficiencyBonusAtLevel(currentLevel)
  const newProfBonus = getProficiencyBonusAtLevel(newLevel)
  const profBonusIncreased = newProfBonus > oldProfBonus

  // ── Feat availability ──────────────────────────────────────────────────────
  const bgFeatId = BACKGROUNDS_DATA.find(b => b.name === character.background?.name)?.featId
  const alreadyTaken = new Set(
    [bgFeatId, character.originFeatChoice, ...(character.takenFeatIds ?? [])].filter(Boolean)
  )
  const featPool = isEpicBoonLevel ? EPIC_BOON_FEATS : GENERAL_FEATS
  const availableFeats = featPool.filter(f => f.repeatable || !alreadyTaken.has(f.id))

  // ── Tough bonus (if already taken) ────────────────────────────────────────
  const hasToughFeat = bgFeatId === 'tough' || character.originFeatChoice === 'tough'
    || (character.takenFeatIds ?? []).includes('tough')
  const toughBonus = hasToughFeat ? 2 : 0
  const avgHP = Math.ceil(hitDie / 2) + 1 + conMod + toughBonus
  const maxHP = hitDie + conMod + toughBonus

  // ── State ─────────────────────────────────────────────────────────────────
  const [hpChoice, setHpChoice] = useState<number>(avgHP)
  const [rolledHP, setRolledHP] = useState<number | null>(null)
  const [asiMode, setAsiMode] = useState<'+2' | '+1/+1' | 'feat'>('+2')
  const [asi2Target, setAsi2Target] = useState<AbilityName>('strength')
  const [asi1aTarget, setAsi1aTarget] = useState<AbilityName>('strength')
  const [asi1bTarget, setAsi1bTarget] = useState<AbilityName>('dexterity')
  const [featuresToAdd, setFeaturesToAdd] = useState<Set<string>>(
    () => new Set(newFeatures.filter((f) => f.type !== 'subclass').map((f) => f.name))
  )
  // Feat selection state
  const [selectedFeatId, setSelectedFeatId] = useState<string | null>(null)
  const [featSkillChoices, setFeatSkillChoices] = useState<SkillName[]>([])
  const [featToolChoices, setFeatToolChoices] = useState<string[]>([])
  const [featInstrumentChoice, setFeatInstrumentChoice] = useState<string>('')
  const [featAbilityChoice, setFeatAbilityChoice] = useState<string>('')

  const selectedFeat = featPool.find(f => f.id === selectedFeatId) ?? null

  const featChoiceComplete = !selectedFeat
    ? false
    : !selectedFeat.choice
      ? true
      : selectedFeat.choice.type === 'skills'
        ? featSkillChoices.length >= selectedFeat.choice.count
        : selectedFeat.choice.type === 'tools'
          ? featToolChoices.length >= selectedFeat.choice.count
          : selectedFeat.choice.type === 'abilityScore' || selectedFeat.choice.type === 'element'
            ? featAbilityChoice !== ''
            : featInstrumentChoice !== ''

  const confirmDisabled = hasASI && asiMode === 'feat' && !featChoiceComplete

  function handleSelectFeat(feat: OriginFeatDef) {
    setSelectedFeatId(feat.id)
    setFeatSkillChoices([])
    setFeatToolChoices([])
    setFeatInstrumentChoice('')
    setFeatAbilityChoice('')
  }

  function toggleSkill(skill: SkillName) {
    setFeatSkillChoices(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill)
      if (!selectedFeat?.choice || prev.length >= selectedFeat.choice.count) return prev
      return [...prev, skill]
    })
  }

  function toggleTool(tool: string) {
    setFeatToolChoices(prev => {
      if (prev.includes(tool)) return prev.filter(t => t !== tool)
      if (!selectedFeat?.choice || prev.length >= selectedFeat.choice.count) return prev
      return [...prev, tool]
    })
  }

  function rollDie() {
    const roll = Math.floor(Math.random() * hitDie) + 1
    const total = Math.max(1, roll + conMod)
    setRolledHP(total)
    setHpChoice(total)
  }

  function toggleFeature(name: string) {
    setFeaturesToAdd((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function applyLevelUp() {
    const newLevel_ = newLevel

    // 1. Increase class level
    const updatedClasses = character.classes.map((c, i) =>
      i === 0 ? { ...c, level: c.level + 1 } : c
    )

    // 2. Increase HP
    const newHPMax = character.hitPoints.maximum + Math.max(1, hpChoice)

    // 3. Update hit dice
    const updatedHitDice = character.hitDice.map((hd, i) =>
      i === 0 ? { ...hd, total: hd.total + 1, remaining: hd.remaining + 1 } : hd
    )

    // 4. Apply ASI or Feat
    const updatedScores = { ...character.abilityScores }
    let featPatch: Partial<Character> = {}

    if (hasASI) {
      if (asiMode === '+2') {
        updatedScores[asi2Target] = Math.min(20, updatedScores[asi2Target] + 2)
      } else if (asiMode === '+1/+1') {
        updatedScores[asi1aTarget] = Math.min(20, updatedScores[asi1aTarget] + 1)
        updatedScores[asi1bTarget] = Math.min(20, updatedScores[asi1bTarget] + 1)
      } else if (asiMode === 'feat' && selectedFeat) {
        featPatch = applyFeatToCharacter(
          character,
          selectedFeat,
          {
            skillChoices: featSkillChoices,
            toolChoices: featToolChoices,
            instrumentChoice: featInstrumentChoice,
            abilityChoice: featAbilityChoice || undefined,
          },
          newLevel_,
        )
      }
    }

    // 5. Add selected features
    const newFeatureObjects = newFeatures
      .filter((f) => featuresToAdd.has(f.name) && f.type !== 'subclass')
      .map((f): import('@/types').Feature => ({
        id: uuidv4(),
        name: f.name,
        source: `${classData!.name} ${newLevel_}`,
        description: f.description,
      }))

    // Merge feat patch (array fields require concat, not overwrite)
    const mergedFeatures = [
      ...character.features,
      ...newFeatureObjects,
      ...(featPatch.features?.filter(f => !character.features.some(ef => ef.id === f.id)) ?? []),
    ]

    updateCharacter(character.id, {
      classes: updatedClasses,
      hitPoints: featPatch.hitPoints ?? {
        ...character.hitPoints,
        maximum: newHPMax,
        current: character.hitPoints.current + Math.max(1, hpChoice),
      },
      hitDice: updatedHitDice,
      abilityScores: updatedScores,
      features: mergedFeatures,
      ...(featPatch.takenFeatIds ? { takenFeatIds: featPatch.takenFeatIds } : {}),
      ...(featPatch.skills ? { skills: featPatch.skills } : {}),
      ...(featPatch.toolProficiencies ? { toolProficiencies: featPatch.toolProficiencies } : {}),
    })

    onClose()
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Title */}
      <div className="text-center mb-6">
        <div className="text-ink-muted font-sans text-xs uppercase tracking-widest mb-1">{classData.name}</div>
        <h2 className="font-display text-3xl text-ink">
          Level {currentLevel} → <span className="text-accent-gold">{newLevel}</span>
        </h2>
        {profBonusIncreased && (
          <div className="mt-2 inline-block bg-parchment-200 border border-parchment-400 px-3 py-1 rounded-sm text-sm font-sans text-ink-muted">
            ⬆ Proficiency Bonus: +{oldProfBonus} → <strong>+{newProfBonus}</strong>
          </div>
        )}
      </div>

      {/* HP section */}
      <div className="paper-card p-4 mb-4">
        <div className="section-header">Hit Points</div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setHpChoice(avgHP); setRolledHP(null) }}
            className={`flex-1 py-3 paper-card text-center transition-colors ${hpChoice === avgHP && rolledHP === null ? 'border-ink bg-parchment-200' : 'hover:bg-parchment-100'}`}
          >
            <div className="font-display text-xl text-ink">{avgHP >= 1 ? `+${avgHP}` : '+1'}</div>
            <div className="text-xs text-ink-muted font-sans">Average</div>
            <div className="text-xs text-ink-muted font-sans">⌀d{hitDie} {conMod >= 0 ? `+${conMod}` : conMod} CON</div>
          </button>

          <button
            onClick={rollDie}
            className={`flex-1 py-3 paper-card text-center transition-colors ${rolledHP !== null ? 'border-ink bg-parchment-200' : 'hover:bg-parchment-100'}`}
          >
            <div className="font-display text-xl text-ink">{rolledHP !== null ? `+${rolledHP}` : `🎲 d${hitDie}`}</div>
            <div className="text-xs text-ink-muted font-sans">{rolledHP !== null ? 'Rolled!' : 'Roll die'}</div>
            <div className="text-xs text-ink-muted font-sans">Max: +{Math.max(1, maxHP)}</div>
          </button>
        </div>
        <div className="mt-3 text-sm font-serif text-ink-muted text-center">
          HP Max: {character.hitPoints.maximum} → <strong className="text-ink">{character.hitPoints.maximum + Math.max(1, hpChoice)}</strong>
        </div>
      </div>

      {/* ASI section */}
      {hasASI && (
        <div className="paper-card p-4 mb-4">
          <div className="section-header">Ability Score Improvement</div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setAsiMode('+2')}
              className={`px-3 py-1.5 text-sm paper-card font-sans transition-colors ${asiMode === '+2' ? 'bg-ink text-parchment-50 border-ink' : 'hover:bg-parchment-200 text-ink-muted'}`}
            >
              +2 to one
            </button>
            <button
              onClick={() => setAsiMode('+1/+1')}
              className={`px-3 py-1.5 text-sm paper-card font-sans transition-colors ${asiMode === '+1/+1' ? 'bg-ink text-parchment-50 border-ink' : 'hover:bg-parchment-200 text-ink-muted'}`}
            >
              +1 to two
            </button>
            <button
              onClick={() => setAsiMode('feat')}
              className={`px-3 py-1.5 text-sm paper-card font-sans transition-colors ${asiMode === 'feat' ? 'bg-ink text-parchment-50 border-ink' : 'hover:bg-parchment-200 text-ink-muted'}`}
            >
              Vybrat feat
            </button>
          </div>

          {asiMode === '+2' && (
            <div>
              <label className="text-xs text-ink-muted font-sans">Choose ability (+2)</label>
              <select
                value={asi2Target}
                onChange={(e) => setAsi2Target(e.target.value as AbilityName)}
                className="field-box w-full mt-1"
              >
                {ABILITY_KEYS.map((a) => (
                  <option key={a} value={a}>
                    {ABILITY_LABELS[a]} ({character.abilityScores[a]} → {Math.min(20, character.abilityScores[a] + 2)}) [{formatModifier(getAbilityModifier(character.abilityScores[a]))} → {formatModifier(getAbilityModifier(Math.min(20, character.abilityScores[a] + 2)))}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {asiMode === '+1/+1' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-ink-muted font-sans">First ability (+1)</label>
                <select value={asi1aTarget} onChange={(e) => setAsi1aTarget(e.target.value as AbilityName)} className="field-box w-full mt-1">
                  {ABILITY_KEYS.map((a) => <option key={a} value={a}>{ABILITY_LABELS[a]} ({character.abilityScores[a]} → {Math.min(20, character.abilityScores[a] + 1)})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-ink-muted font-sans">Second ability (+1)</label>
                <select value={asi1bTarget} onChange={(e) => setAsi1bTarget(e.target.value as AbilityName)} className="field-box w-full mt-1">
                  {ABILITY_KEYS.filter(a => a !== asi1aTarget).map((a) => <option key={a} value={a}>{ABILITY_LABELS[a]} ({character.abilityScores[a]} → {Math.min(20, character.abilityScores[a] + 1)})</option>)}
                </select>
              </div>
            </div>
          )}

          {asiMode === 'feat' && (
            <FeatPickerPanel
              availableFeats={availableFeats}
              selectedFeat={selectedFeat}
              onSelectFeat={handleSelectFeat}
              character={character}
              featSkillChoices={featSkillChoices}
              featToolChoices={featToolChoices}
              featInstrumentChoice={featInstrumentChoice}
              featAbilityChoice={featAbilityChoice}
              onToggleSkill={toggleSkill}
              onToggleTool={toggleTool}
              onSelectInstrument={setFeatInstrumentChoice}
              onSelectAbility={setFeatAbilityChoice}
              isEpicBoon={isEpicBoonLevel}
            />
          )}
        </div>
      )}

      {/* New features */}
      {newFeatures.length > 0 && (
        <div className="paper-card p-4 mb-4">
          <div className="section-header">
            New Features
            <span className="ml-2 font-sans text-ink-muted normal-case tracking-normal">click to add</span>
          </div>
          <div className="space-y-2">
            {newFeatures.map((feature) => (
              <FeatureRow
                key={feature.name}
                feature={feature}
                selected={featuresToAdd.has(feature.name)}
                isSubclass={feature.type === 'subclass'}
                onToggle={() => feature.type !== 'subclass' && toggleFeature(feature.name)}
              />
            ))}
          </div>
          {hasSubclass && !primaryClass.subclass && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-sm text-xs font-sans text-amber-800">
              ⚡ Don't forget to choose a subclass ({classData.subclassLabel}) on the character sheet!
            </div>
          )}
        </div>
      )}

      {/* Confirm */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 paper-card font-serif hover:bg-parchment-200 text-ink-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={applyLevelUp}
          disabled={confirmDisabled}
          className={`flex-1 py-2.5 font-serif rounded-sm transition-colors ${
            confirmDisabled
              ? 'bg-ink/40 text-parchment-50/60 cursor-not-allowed'
              : 'bg-ink text-parchment-50 hover:bg-ink-light'
          }`}
        >
          Confirm Level Up →
        </button>
      </div>
    </ModalShell>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-parchment-50 border border-parchment-400 rounded-xl shadow-xl my-4">
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function FeatureRow({ feature, selected, isSubclass, onToggle }: {
  feature: ClassFeatureEntry
  selected: boolean
  isSubclass: boolean
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const typeColors: Record<string, string> = {
    asi: 'text-accent-gold border-accent-gold/40 bg-amber-50',
    epicBoon: 'text-accent-gold border-accent-gold/40 bg-amber-50',
    subclass: 'text-purple-700 border-purple-300 bg-purple-50',
    feature: '',
  }

  return (
    <div className={`paper-card p-3 transition-colors ${!isSubclass ? 'cursor-pointer hover:bg-parchment-200' : 'opacity-80'} ${selected && !isSubclass ? 'border-ink' : ''}`}>
      <div className="flex items-start gap-2" onClick={isSubclass ? () => setExpanded(e => !e) : () => { onToggle(); setExpanded(e => !e) }}>
        {!isSubclass && (
          <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 ${selected ? 'bg-ink border-ink' : 'border-ink/30'}`}>
            {selected && <span className="text-parchment-50 text-xs leading-none flex items-center justify-center h-full">✓</span>}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm text-ink">{feature.name}</span>
            {feature.type !== 'feature' && (
              <span className={`text-xs px-1.5 py-0.5 rounded border font-sans ${typeColors[feature.type] ?? ''}`}>
                {feature.type === 'asi' ? 'ASI' : feature.type === 'epicBoon' ? 'Epic Boon' : 'Subclass'}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v) }}
          className="text-ink-muted text-xs flex-shrink-0"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>
      {expanded && (
        <p className="font-serif text-xs text-ink-muted mt-2 ml-6 leading-relaxed">
          {feature.description}
        </p>
      )}
    </div>
  )
}

function FeatPickerPanel({
  availableFeats,
  selectedFeat,
  onSelectFeat,
  character,
  featSkillChoices,
  featToolChoices,
  featInstrumentChoice,
  featAbilityChoice,
  onToggleSkill,
  onToggleTool,
  onSelectInstrument,
  onSelectAbility,
  isEpicBoon,
}: {
  availableFeats: OriginFeatDef[]
  selectedFeat: OriginFeatDef | null
  onSelectFeat: (feat: OriginFeatDef) => void
  character: Character
  featSkillChoices: SkillName[]
  featToolChoices: string[]
  featInstrumentChoice: string
  featAbilityChoice: string
  onToggleSkill: (skill: SkillName) => void
  onToggleTool: (tool: string) => void
  onSelectInstrument: (instrument: string) => void
  onSelectAbility: (val: string) => void
  isEpicBoon: boolean
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (availableFeats.length === 0) {
    return (
      <p className="text-sm font-serif text-ink-muted italic text-center py-3">
        {isEpicBoon ? 'Všechny Epic Boon featy jsou již vzaty.' : 'Všechny General featy jsou již vzaty.'}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Feat list */}
      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
        {availableFeats.map(feat => {
          const isSelected = selectedFeat?.id === feat.id
          const isExpanded = expandedId === feat.id
          return (
            <div
              key={feat.id}
              className={`paper-card p-3 cursor-pointer transition-colors hover:bg-parchment-200 ${isSelected ? 'border-ink bg-parchment-200' : ''}`}
              onClick={() => { onSelectFeat(feat); setExpandedId(feat.id) }}
            >
              <div className="flex items-start gap-2">
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 ${isSelected ? 'bg-ink border-ink' : 'border-ink/30'}`}>
                  {isSelected && <span className="text-parchment-50 text-xs leading-none flex items-center justify-center h-full">✓</span>}
                </div>
                <div className="flex-1">
                  <span className="font-display text-sm text-ink">{feat.name}</span>
                  {feat.spellGrants && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded border text-blue-700 border-blue-300 bg-blue-50 font-sans">
                      Kouzla
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : feat.id) }}
                  className="text-ink-muted text-xs flex-shrink-0"
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>
              {isExpanded && (
                <p className="font-serif text-xs text-ink-muted mt-2 ml-6 leading-relaxed">
                  {feat.description}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Sub-choices for selected feat */}
      {selectedFeat?.choice && (
        <div className="paper-card p-3 bg-parchment-100/60">
          <div className="text-xs font-sans text-ink-muted mb-2 font-semibold uppercase tracking-wide">
            {selectedFeat.choice.label}
            {selectedFeat.choice.count > 1 && selectedFeat.choice.type !== 'abilityScore' && selectedFeat.choice.type !== 'element' && (
              <span className="ml-1 normal-case font-normal">
                ({selectedFeat.choice.type === 'skills' ? featSkillChoices.length : featToolChoices.length}/{selectedFeat.choice.count} vybráno)
              </span>
            )}
          </div>

          {selectedFeat.choice.type === 'abilityScore' && selectedFeat.choice.options && (
            <select
              value={featAbilityChoice}
              onChange={(e) => onSelectAbility(e.target.value)}
              className="field-box w-full"
            >
              <option value="">— Vyber ability score —</option>
              {(selectedFeat.choice.options as readonly string[]).map(ability => (
                <option key={ability} value={ability}>
                  {ABILITY_LABELS[ability as keyof typeof ABILITY_LABELS] ?? ability}
                  {` (${character.abilityScores[ability as keyof typeof character.abilityScores]} → ${Math.min(20, character.abilityScores[ability as keyof typeof character.abilityScores] + 1)})`}
                </option>
              ))}
            </select>
          )}

          {selectedFeat.choice.type === 'element' && selectedFeat.choice.options && (
            <select
              value={featAbilityChoice}
              onChange={(e) => onSelectAbility(e.target.value)}
              className="field-box w-full"
            >
              <option value="">— Vyber damage type —</option>
              {(selectedFeat.choice.options as readonly string[]).map(el => (
                <option key={el} value={el}>{el}</option>
              ))}
            </select>
          )}

          {selectedFeat.choice.type === 'skills' && (
            <div className="grid grid-cols-2 gap-1">
              {(ALL_SKILLS as SkillName[]).map(skill => {
                const isProficient = character.skills[skill] !== 'none'
                const isChosen = featSkillChoices.includes(skill)
                const canSelect = !isChosen && featSkillChoices.length < selectedFeat.choice!.count
                return (
                  <label
                    key={skill}
                    className={`flex items-center gap-1.5 text-xs font-sans cursor-pointer py-0.5 ${isProficient ? 'text-ink-muted' : 'text-ink'} ${!canSelect && !isChosen ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChosen}
                      disabled={!isChosen && !canSelect}
                      onChange={() => onToggleSkill(skill)}
                      className="accent-ink"
                    />
                    {SKILL_LABELS[skill]}
                    {isProficient && <span className="text-ink-muted">(✓)</span>}
                  </label>
                )
              })}
            </div>
          )}

          {selectedFeat.choice.type === 'tools' && selectedFeat.choice.options && (
            <div className="grid grid-cols-2 gap-1">
              {(selectedFeat.choice.options as readonly string[]).map(tool => {
                const isChosen = featToolChoices.includes(tool)
                const canSelect = !isChosen && featToolChoices.length < selectedFeat.choice!.count
                return (
                  <label
                    key={tool}
                    className={`flex items-center gap-1.5 text-xs font-sans cursor-pointer py-0.5 text-ink ${!canSelect && !isChosen ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChosen}
                      disabled={!isChosen && !canSelect}
                      onChange={() => onToggleTool(tool)}
                      className="accent-ink"
                    />
                    {tool}
                  </label>
                )
              })}
            </div>
          )}

          {selectedFeat.choice.type === 'instrument' && selectedFeat.choice.options && (
            <select
              value={featInstrumentChoice}
              onChange={(e) => onSelectInstrument(e.target.value)}
              className="field-box w-full"
            >
              <option value="">— Vyber nástroj —</option>
              {(selectedFeat.choice.options as readonly string[]).map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Magic Initiate notice */}
      {selectedFeat?.spellGrants && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-sm text-xs font-sans text-blue-800">
          🔮 Po potvrzení přejdi do <strong>Origin Spells</strong> a vyber svá kouzla z tohoto featu.
        </div>
      )}
    </div>
  )
}
