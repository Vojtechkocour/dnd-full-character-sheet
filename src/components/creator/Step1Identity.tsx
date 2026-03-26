import { v4 as uuidv4 } from 'uuid'
import type { Character, Alignment, Feature, SkillName, AbilityName } from '@/types'
import { SPECIES_DATA } from '@/data/species'
import { BACKGROUNDS_DATA } from '@/data/backgrounds'
import { ORIGIN_FEATS, getFeatById, ARTISAN_TOOLS, INSTRUMENTS, GAMING_SETS } from '@/data/feats'
import type { OriginFeatDef } from '@/data/feats'

const ALIGNMENTS: { value: Alignment; label: string }[] = [
  { value: 'lawfulGood', label: 'Lawful Good' },
  { value: 'neutralGood', label: 'Neutral Good' },
  { value: 'chaoticGood', label: 'Chaotic Good' },
  { value: 'lawfulNeutral', label: 'Lawful Neutral' },
  { value: 'trueNeutral', label: 'True Neutral' },
  { value: 'chaoticNeutral', label: 'Chaotic Neutral' },
  { value: 'lawfulEvil', label: 'Lawful Evil' },
  { value: 'neutralEvil', label: 'Neutral Evil' },
  { value: 'chaoticEvil', label: 'Chaotic Evil' },
  { value: 'unaligned', label: 'Unaligned' },
]


interface Props {
  character: Character
  onChange: (patch: Partial<Character>) => void
}

function buildSpeciesFeatures(character: Character): Feature[] {
  const speciesData = SPECIES_DATA.find((s) => s.id === character.speciesId)
  if (!speciesData) return []

  const features: Feature[] = []
  const source = `Species: ${speciesData.name}`

  for (const trait of speciesData.traits) {
    features.push({ id: uuidv4(), name: trait.name, source, description: trait.description })
  }

  if (speciesData.subspecies && character.speciesChoice) {
    const sub = speciesData.subspecies.options.find((o) => o.id === character.speciesChoice)
    if (sub) {
      for (const trait of sub.traits) {
        features.push({ id: uuidv4(), name: trait.name, source: `Species: ${speciesData.name} (${sub.name})`, description: trait.description })
      }
    }
  }

  return features
}

// ─── Feat Choice UI ───────────────────────────────────────────────────────────

interface FeatChoiceProps {
  feat: OriginFeatDef
  toolProficiencies: string[]
  onToolChoicesChange: (tools: string[]) => void
  previousTools?: string[]
}

function FeatChoiceUI({
  feat,
  toolProficiencies,
  onToolChoicesChange,
  previousTools = [],
}: FeatChoiceProps) {
  if (!feat.choice) return null

  const { choice } = feat

  // ── Skills (Skilled feat) — moved to Step 5 ───────────────────────────────
  if (choice.type === 'skills') {
    return (
      <p className="mt-2 text-xs font-sans text-accent-gold italic">
        → You'll choose {choice.count} skills (Skilled) in the Skills step.
      </p>
    )
  }

  // ── Tools (Crafter feat) ───────────────────────────────────────────────────
  if (choice.type === 'tools') {
    const options = (choice.options ?? ARTISAN_TOOLS) as readonly string[]
    const count = choice.count // 3

    // Extract current feat tool choices from toolProficiencies
    // They are the ones that were previously chosen (stored in previousTools)
    const currentChoices: string[] = []
    for (let i = 0; i < count; i++) {
      currentChoices.push(previousTools[i] ?? '')
    }
    // Sync with actual toolProficiencies for display
    const displayChoices = currentChoices.map(c => {
      if (c && toolProficiencies.includes(c)) return c
      return ''
    })

    function handleToolSelect(index: number, tool: string) {
      const newChoices = [...displayChoices]
      newChoices[index] = tool

      // Rebuild toolProficiencies: remove old feat tools, add new ones
      const withoutOld = toolProficiencies.filter(t => !previousTools.includes(t) && !displayChoices.includes(t))
      const newTools = newChoices.filter(t => t !== '')
      onToolChoicesChange([...withoutOld, ...newTools])
    }

    return (
      <div className="mt-2 space-y-1.5">
        <p className="text-xs font-sans text-ink-muted font-semibold">{choice.label}</p>
        {displayChoices.map((chosen, idx) => {
          const otherChosen = new Set(displayChoices.filter((t, i) => i !== idx && t !== ''))
          return (
            <select
              key={idx}
              value={chosen}
              onChange={(e) => handleToolSelect(idx, e.target.value)}
              className="field-box w-full text-sm"
            >
              <option value="">— Select tool —</option>
              {options.map((opt) => {
                if (otherChosen.has(opt)) return null
                return <option key={opt} value={opt}>{opt}</option>
              })}
            </select>
          )
        })}
      </div>
    )
  }

  // ── Instrument (Performer feat) ────────────────────────────────────────────
  if (choice.type === 'instrument') {
    const options = (choice.options ?? INSTRUMENTS) as readonly string[]
    const current = previousTools[0] ?? ''

    function handleInstrumentSelect(instrument: string) {
      const withoutOld = toolProficiencies.filter(t => t !== current)
      const newTools = instrument ? [...withoutOld, instrument] : withoutOld
      onToolChoicesChange(newTools)
    }

    return (
      <div className="mt-2 space-y-1.5">
        <p className="text-xs font-sans text-ink-muted font-semibold">{choice.label}</p>
        <select
          value={current}
          onChange={(e) => handleInstrumentSelect(e.target.value)}
          className="field-box w-full text-sm"
        >
          <option value="">— Select tool —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  return null
}

// ─── Feat Card ────────────────────────────────────────────────────────────────

interface FeatCardProps {
  feat: OriginFeatDef
  character: Character
  previousFeatTools: string[]
  onToolChoicesChange: (tools: string[]) => void
}

function FeatCard({ feat, character, previousFeatTools, onToolChoicesChange }: FeatCardProps) {
  return (
    <div className="mt-2 paper-card p-3 bg-parchment-100/60 space-y-1.5">
      <div className="font-serif font-bold text-sm text-ink">{feat.name}</div>
      <p className="font-serif text-xs text-ink-muted">{feat.description}</p>
      {feat.complexNote && (
        <p className="font-serif text-xs text-ink-muted italic">{feat.complexNote}</p>
      )}
      {feat.choice && (
        <FeatChoiceUI
          feat={feat}
          toolProficiencies={character.toolProficiencies}
          onToolChoicesChange={onToolChoicesChange}
          previousTools={previousFeatTools}
        />
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Step1Identity({ character, onChange }: Props) {
  const selectedSpecies = SPECIES_DATA.find((s) => s.id === character.speciesId)
  const selectedBackground = BACKGROUNDS_DATA.find((b) => b.id === character.background?.name.toLowerCase().replace(/\s/g, '_'))
    ?? BACKGROUNDS_DATA.find((b) => b.name === character.background?.name)

  // Background feat
  const bgFeatDef = selectedBackground ? getFeatById(selectedBackground.featId) : undefined

  // Human origin feat
  const humanOriginFeatDef = character.speciesId === 'human' && character.originFeatChoice
    ? getFeatById(character.originFeatChoice)
    : undefined

  // Tool choices currently stored for the background feat
  // We need to track which tools were chosen via feat — store them by intersecting
  // toolProficiencies with what's known to be from feats. We identify feat tools
  // as any tool in toolProficiencies that matches the feat's choice options.
  function getFeatTools(feat: OriginFeatDef | undefined): string[] {
    if (!feat?.choice) return []
    const options = feat.choice.options as readonly string[] | undefined
    if (!options) return []
    return character.toolProficiencies.filter(t => options.includes(t))
  }

  const bgFeatTools = getFeatTools(bgFeatDef)
  const humanFeatTools = getFeatTools(humanOriginFeatDef)

  // Background skills (for excluding from Skilled feat dropdowns)
  const bgSkills: SkillName[] = selectedBackground?.skillProficiencies ?? []

  function handleSpeciesChange(speciesId: string, speciesChoice?: string) {
    const speciesData = SPECIES_DATA.find((s) => s.id === speciesId)
    if (!speciesData) {
      onChange({ species: '', speciesId: '', speciesChoice: undefined })
      return
    }

    // Remove old species features, keep rest
    const nonSpeciesFeatures = character.features.filter(
      (f) => !f.source.startsWith('Species:')
    )

    const patch: Partial<Character> = {
      species: speciesData.name,
      speciesId,
      speciesChoice,
    }

    // Only update features if species is fully selected (no pending subspecies choice)
    const needsSubchoice = !!speciesData.subspecies && !speciesChoice
    if (!needsSubchoice) {
      const speciesFeatures = buildSpeciesFeatures({ ...character, speciesId, speciesChoice })
      patch.features = [...nonSpeciesFeatures, ...speciesFeatures]

      // Apply speed override from subspecies
      if (speciesData.subspecies && speciesChoice) {
        const sub = speciesData.subspecies.options.find((o) => o.id === speciesChoice)
        if (sub?.speedOverride) patch.speed = sub.speedOverride
      } else {
        patch.speed = speciesData.speed
      }
    }

    // Reset human-specific choices when species changes away from human
    if (speciesId !== 'human') {
      patch.originFeatChoice = undefined
      // Remove human feat tools from toolProficiencies
      if (humanOriginFeatDef?.choice?.options) {
        const humanOptSet = new Set(humanOriginFeatDef.choice.options as readonly string[])
        patch.toolProficiencies = character.toolProficiencies.filter(t => !humanOptSet.has(t))
      }
    }

    onChange(patch)
  }

  function handleSubspeciesChange(subspeciesId: string) {
    if (!character.speciesId) return
    handleSpeciesChange(character.speciesId, subspeciesId)
  }

  function handleBackgroundChange(backgroundId: string) {
    const bgData = BACKGROUNDS_DATA.find((b) => b.id === backgroundId)

    // Remove old background features
    const nonBgFeatures = character.features.filter(
      (f) => !f.source.startsWith('Background:')
    )

    // Remove old background ASI from abilityScores
    const oldASI = character.background?.abilityScoreIncrease ?? {}
    const scoresWithoutBgASI = { ...character.abilityScores }
    for (const [ab, bonus] of Object.entries(oldASI)) {
      scoresWithoutBgASI[ab as AbilityName] = Math.max(1, scoresWithoutBgASI[ab as AbilityName] - (bonus as number))
    }

    if (!bgData) {
      const clearedSkills = { ...character.skills }
      for (const s of character.featSkillChoices) {
        if (!bgSkills.includes(s)) clearedSkills[s] = 'none'
      }
      // Remove bg feat tools AND bg own tool (fixed or previously chosen)
      const oldBgOwnTool = selectedBackground
        ? (selectedBackground.toolProficiency.includes('(choice)')
          ? character.bgToolChoice
          : selectedBackground.toolProficiency)
        : ''
      const clearedTools = character.toolProficiencies.filter(t => !bgFeatTools.includes(t) && t !== oldBgOwnTool)
      onChange({
        background: null,
        features: nonBgFeatures,
        skills: clearedSkills,
        featSkillChoices: [],
        toolProficiencies: clearedTools,
        bgToolChoice: '',
        abilityScores: scoresWithoutBgASI,
      })
      return
    }

    // Clear old feat skill choices from skills map
    const updatedSkills = { ...character.skills }
    // Remove previous feat skill choices (set back to none unless they're bg skills from new bg)
    for (const s of character.featSkillChoices) {
      const isNewBgSkill = bgData.skillProficiencies.includes(s)
      if (!isNewBgSkill) updatedSkills[s] = 'none'
    }

    // Remove old bg skills (set to none unless they're in new bg)
    for (const s of bgSkills) {
      if (!bgData.skillProficiencies.includes(s)) {
        updatedSkills[s] = 'none'
      }
    }

    // Apply new background skills
    for (const skill of bgData.skillProficiencies) {
      updatedSkills[skill] = 'proficient'
    }

    // Remove old bg feat tools AND old bg own tool
    const oldBgOwnTool = selectedBackground
      ? (selectedBackground.toolProficiency.includes('(choice)')
        ? character.bgToolChoice
        : selectedBackground.toolProficiency)
      : ''
    let clearedTools = character.toolProficiencies.filter(t => !bgFeatTools.includes(t) && t !== oldBgOwnTool)

    // Add new bg fixed tool immediately (choice tools are handled by handleBgToolChoice)
    let newBgToolChoice = ''
    if (!bgData.toolProficiency.includes('(choice)')) {
      clearedTools = [...clearedTools, bgData.toolProficiency]
    }

    // Add origin feat as a feature
    const bgFeat: Feature = {
      id: uuidv4(),
      name: bgData.originFeat,
      source: `Background: ${bgData.name}`,
      description: bgData.originFeatDescription,
    }

    onChange({
      background: {
        name: bgData.name,
        abilityScoreIncrease: {},
        originFeat: bgData.originFeat,
        skillProficiencies: bgData.skillProficiencies,
        languages: [],
        equipment: bgData.startingEquipment,
        description: bgData.description,
      },
      skills: updatedSkills,
      features: [...nonBgFeatures, bgFeat],
      featSkillChoices: [],
      toolProficiencies: clearedTools,
      bgToolChoice: newBgToolChoice,
      abilityScores: scoresWithoutBgASI,
    })
  }

  // ── Background choice tool selection ──────────────────────────────────────
  function handleBgToolChoice(tool: string) {
    const oldChoice = character.bgToolChoice
    const withoutOld = oldChoice ? character.toolProficiencies.filter(t => t !== oldChoice) : character.toolProficiencies
    const newTools = tool ? [...withoutOld, tool] : withoutOld
    onChange({ bgToolChoice: tool, toolProficiencies: newTools })
  }

  // ── Human Versatile feat selection ────────────────────────────────────────
  function handleHumanOriginFeatChange(featId: string) {
    const prev = humanOriginFeatDef
    // Remove old feat tools
    const clearedTools = prev?.choice?.options
      ? character.toolProficiencies.filter(t => !(prev.choice!.options as readonly string[]).includes(t))
      : [...character.toolProficiencies]

    // Remove old feat skill choices (for Skilled)
    const updatedSkills = { ...character.skills }
    if (prev?.choice?.type === 'skills') {
      // Remove from index 1 onwards (index 0 = human skillful)
      for (const s of character.featSkillChoices.slice(1)) {
        updatedSkills[s] = 'none'
      }
    }

    onChange({
      originFeatChoice: featId || undefined,
      toolProficiencies: clearedTools,
      skills: updatedSkills,
      featSkillChoices: character.featSkillChoices.slice(0, 1), // keep only skillful choice
    })
  }

  // ── Callbacks for bg feat ─────────────────────────────────────────────────
  function handleBgFeatToolChoices(tools: string[]) {
    onChange({ toolProficiencies: tools })
  }

  function handleHumanFeatToolChoices(tools: string[]) {
    onChange({ toolProficiencies: tools })
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="section-header block">Character Name *</label>
        <input
          type="text"
          value={character.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Aragorn, Syndra, Zephyr..."
          className="field-box w-full text-lg font-display"
        />
      </div>

      {/* Species */}
      <div>
        <label className="section-header block">Species</label>
        <select
          value={character.speciesId}
          onChange={(e) => handleSpeciesChange(e.target.value)}
          className="field-box w-full"
        >
          <option value="">— Select species —</option>
          {SPECIES_DATA.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Subspecies dropdown */}
        {selectedSpecies?.subspecies && (
          <div className="mt-2">
            <label className="text-xs text-ink-muted font-sans">{selectedSpecies.subspecies.label}</label>
            <select
              value={character.speciesChoice ?? ''}
              onChange={(e) => handleSubspeciesChange(e.target.value)}
              className="field-box w-full mt-1"
            >
              <option value="">— Select {selectedSpecies.subspecies.label.toLowerCase()} —</option>
              {selectedSpecies.subspecies.options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Species trait preview */}
        {selectedSpecies && (!selectedSpecies.subspecies || character.speciesChoice) && (
          <div className="mt-2 paper-card p-3 bg-parchment-100/60 space-y-1.5">
            <div className="flex gap-3 text-xs text-ink-muted font-sans mb-2">
              <span>Speed: {(() => {
                if (selectedSpecies.subspecies && character.speciesChoice) {
                  const sub = selectedSpecies.subspecies.options.find(o => o.id === character.speciesChoice)
                  return sub?.speedOverride ?? selectedSpecies.speed
                }
                return selectedSpecies.speed
              })()} ft</span>
              <span>Size: {selectedSpecies.size}</span>
              {(() => {
                const dv = selectedSpecies.subspecies && character.speciesChoice
                  ? selectedSpecies.subspecies.options.find(o => o.id === character.speciesChoice)?.darkvisionOverride ?? selectedSpecies.darkvision
                  : selectedSpecies.darkvision
                return dv ? <span>Darkvision: {dv} ft</span> : null
              })()}
            </div>
            {selectedSpecies.traits.map((t) => (
              <div key={t.name}>
                <span className="font-semibold font-serif text-sm text-ink">{t.name}.</span>{' '}
                <span className="font-serif text-sm text-ink-muted">{t.description}</span>
              </div>
            ))}
            {selectedSpecies.subspecies && character.speciesChoice && (() => {
              const sub = selectedSpecies.subspecies!.options.find(o => o.id === character.speciesChoice)
              return sub?.traits.map((t) => (
                <div key={t.name}>
                  <span className="font-semibold font-serif text-sm text-ink">{t.name}.</span>{' '}
                  <span className="font-serif text-sm text-ink-muted">{t.description}</span>
                </div>
              ))
            })()}
          </div>
        )}

        {/* Human special traits */}
        {character.speciesId === 'human' && (
          <div className="mt-3 space-y-3">
            {/* Skillful */}
            <div className="paper-card p-3 bg-parchment-100/60">
              <div className="font-serif font-bold text-sm text-ink mb-1">Skillful</div>
              <p className="font-serif text-xs text-ink-muted">
                You gain proficiency in one skill of your choice.
              </p>
              <p className="text-xs font-sans text-accent-gold italic mt-1">
                → You'll choose the bonus skill in the Skills step.
              </p>
            </div>

            {/* Versatile */}
            <div className="paper-card p-3 bg-parchment-100/60">
              <div className="font-serif font-bold text-sm text-ink mb-1">Versatile</div>
              <p className="font-serif text-xs text-ink-muted mb-2">
                You gain one Origin Feat of your choice.
              </p>
              <label className="text-xs font-sans text-ink-muted">Choose Origin Feat (Versatile)</label>
              <select
                value={character.originFeatChoice ?? ''}
                onChange={(e) => handleHumanOriginFeatChange(e.target.value)}
                className="field-box w-full mt-1 text-sm"
              >
                <option value="">— Select feat —</option>
                {ORIGIN_FEATS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              {/* Show chosen feat card */}
              {humanOriginFeatDef && (
                <FeatCard
                  feat={humanOriginFeatDef}
                  character={character}
                  previousFeatTools={humanFeatTools}
                  onToolChoicesChange={handleHumanFeatToolChoices}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background */}
      <div>
        <label className="section-header block">Background</label>
        <select
          value={selectedBackground?.id ?? ''}
          onChange={(e) => handleBackgroundChange(e.target.value)}
          className="field-box w-full"
        >
          <option value="">— Select background —</option>
          {BACKGROUNDS_DATA.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {selectedBackground && (
          <div className="mt-2 paper-card p-3 bg-parchment-100/60 space-y-1">
            <p className="font-serif text-xs text-ink-muted italic">{selectedBackground.description}</p>
            <div className="text-xs font-sans text-ink-muted mt-1 space-y-0.5">
              <div><strong>Skills:</strong> {selectedBackground.skillProficiencies.map(s => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())).join(', ')}</div>
              <div><strong>Tool:</strong> {selectedBackground.toolProficiency}</div>
              <div><strong>Origin Feat:</strong> {selectedBackground.originFeat}</div>
            </div>
          </div>
        )}

        {/* Background own tool — choice picker */}
        {selectedBackground && selectedBackground.toolProficiency.includes('(choice)') && (() => {
          const tp = selectedBackground.toolProficiency
          const options: readonly string[] = tp.includes('Musical Instrument')
            ? INSTRUMENTS
            : tp.includes('Artisan')
            ? ARTISAN_TOOLS
            : GAMING_SETS
          const label = tp.replace(' (choice)', '')
          return (
            <div className="mt-2">
              <label className="text-xs font-sans text-ink-muted font-semibold uppercase tracking-wide">
                Tool Proficiency Choice
              </label>
              <select
                value={character.bgToolChoice}
                onChange={(e) => handleBgToolChoice(e.target.value)}
                className="field-box w-full mt-1 text-sm"
              >
                <option value="">— Choose {label} —</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )
        })()}

        {/* Background feat card */}
        {selectedBackground && bgFeatDef && (
          <div className="mt-2">
            <label className="text-xs text-ink-muted font-sans font-semibold uppercase tracking-wide">Origin Feat</label>
            <FeatCard
              feat={bgFeatDef}
              character={character}
              previousFeatTools={bgFeatTools}
              onToolChoicesChange={handleBgFeatToolChoices}
            />
          </div>
        )}
      </div>

      {/* Row: Alignment + Age */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="section-header block">Alignment</label>
          <select
            value={character.alignment}
            onChange={(e) => onChange({ alignment: e.target.value as Alignment })}
            className="field-box w-full"
          >
            {ALIGNMENTS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="section-header block">Age</label>
          <input
            type="text"
            value={character.age}
            onChange={(e) => onChange({ age: e.target.value })}
            placeholder="25"
            className="field-box w-full"
          />
        </div>
      </div>

      {/* Appearance */}
      <div>
        <label className="section-header block">Appearance</label>
        <input
          type="text"
          value={character.appearance}
          onChange={(e) => onChange({ appearance: e.target.value })}
          placeholder="Brief appearance description..."
          className="field-box w-full"
        />
      </div>
    </div>
  )
}
