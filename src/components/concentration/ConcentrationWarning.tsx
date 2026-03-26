import { useSpellStore } from '@/store/spellStore'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface ConcentrationWarningProps {
  characterId: string
}

export function ConcentrationWarning({ characterId }: ConcentrationWarningProps) {
  const warning = useSpellStore(s => s.concentrationWarning)
  const spells = useSpellStore(s => s.spells)
  const character = useSpellStore(s => s.spellCharacters.find(c => c.id === characterId))
  const dismiss = useSpellStore(s => s.dismissConcentrationWarning)
  const confirm = useSpellStore(s => s.confirmConcentrationSwitch)

  if (!warning || !character) return null

  const currentSpell = character.concentratingOnSpellId
    ? spells.find(s => s.id === character.concentratingOnSpellId) : null
  const newSpell = spells.find(s => s.id === warning.spellId)

  return (
    <Modal open={true} onClose={dismiss} title="Break Concentration">
      <div className="space-y-4">
        <p className="text-ink-light">
          You are concentrating on{' '}
          <span className="text-yellow-700 font-semibold">{currentSpell?.name ?? 'a spell'}</span>.
          Casting{' '}
          <span className="text-accent-gold font-semibold">{newSpell?.name ?? 'a new spell'}</span>{' '}
          will break concentration.
        </p>
        <p className="text-ink-muted text-sm">Switch concentration?</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => confirm(characterId, warning.spellId)}>Switch</Button>
          <Button variant="ghost" onClick={dismiss}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
