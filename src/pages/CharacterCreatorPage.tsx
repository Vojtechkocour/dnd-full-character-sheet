import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { createNewCharacter } from '@/utils/defaults'
import type { Character } from '@/types'
import StepIndicator from '@/components/ui/StepIndicator'
import Step1Identity from '@/components/creator/Step1Identity'
import Step2Class from '@/components/creator/Step2Class'
import Step3AbilityScores from '@/components/creator/Step3AbilityScores'
import Step4Combat from '@/components/creator/Step4Combat'
import Step6Equipment from '@/components/creator/Step6Equipment'

const STEPS = [
  { label: 'Identity', icon: '①' },
  { label: 'Class', icon: '②' },
  { label: 'Ability', icon: '③' },
  { label: 'Combat', icon: '④' },
  { label: 'Equipment', icon: '⑤' },
]

export default function CharacterCreatorPage() {
  const navigate = useNavigate()
  const { addCharacter, updateCharacter } = useCharacterStore()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Character>(() => createNewCharacter())

  function patch(p: Partial<Character>) {
    setDraft((prev) => ({ ...prev, ...p }))
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1)
    else navigate('/')
  }

  function handleFinish() {
    const character = addCharacter(draft.name)
    updateCharacter(character.id, {
      ...draft,
      id: character.id,
      createdAt: character.createdAt,
    })
    navigate(`/character/${character.id}`)
  }

  function canProceed(): boolean {
    if (step === 0) return draft.name.trim().length > 0
    if (step === 1) return draft.classes.length > 0
    return true
  }

  const stepComponents = [
    <Step1Identity character={draft} onChange={patch} />,
    <Step2Class character={draft} onChange={patch} />,
    <Step3AbilityScores character={draft} onChange={patch} />,
    <Step4Combat character={draft} onChange={patch} />,
    <Step6Equipment character={draft} onChange={patch} />,
  ]

  return (
    <div className="min-h-screen bg-parchment-100 px-4 py-8">
      <div className="max-w-lg lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-ink-muted hover:text-ink text-sm font-sans mb-4 inline-flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-display text-3xl text-ink">New Character</h1>
          <div className="w-16 h-px bg-accent-gold mx-auto mt-3 mb-6" />
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {/* Step content */}
        <div className="paper-card p-5 mb-6">
          <h2 className="font-display text-xl text-ink mb-4">{STEPS[step].label}</h2>
          {stepComponents[step]}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            onClick={handleBack}
            className="px-5 py-2.5 paper-card hover:bg-parchment-200 font-serif text-ink-muted hover:text-ink transition-colors"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              px-6 py-2.5 font-serif transition-colors rounded-sm
              ${canProceed()
                ? 'bg-ink text-parchment-50 hover:bg-ink-light'
                : 'bg-ink/30 text-ink-muted cursor-not-allowed'
              }
            `}
          >
            {step === STEPS.length - 1 ? 'Create Character →' : 'Next →'}
          </button>
        </div>

        {/* Skip to sheet */}
        {step < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={handleFinish}
              className="text-xs text-ink-muted hover:text-ink font-sans underline transition-colors"
            >
              Skip and create directly
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
