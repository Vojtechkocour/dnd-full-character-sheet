import { useCharacterStore } from '@/store/characterStore'
import type { Character } from '@/types'

interface Props {
  character: Character
}

function TextArea({ label, value, onChange, rows = 3 }: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div>
      <label className="section-header block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="field-box w-full resize-none"
      />
    </div>
  )
}

export default function TabNotes({ character }: Props) {
  const { updateCharacter } = useCharacterStore()
  const u = (patch: Partial<Character>) => updateCharacter(character.id, patch)

  return (
    <div className="space-y-4">
      {/* Personality */}
      <div className="paper-card p-4 space-y-4">
        <div className="section-header text-base">Personality</div>
        <TextArea
          label="Personality Traits"
          value={character.personalityTraits}
          onChange={(v) => u({ personalityTraits: v })}
        />
        <TextArea
          label="Ideals"
          value={character.ideals}
          onChange={(v) => u({ ideals: v })}
          rows={2}
        />
        <TextArea
          label="Bonds"
          value={character.bonds}
          onChange={(v) => u({ bonds: v })}
          rows={2}
        />
        <TextArea
          label="Flaws"
          value={character.flaws}
          onChange={(v) => u({ flaws: v })}
          rows={2}
        />
      </div>

      {/* Backstory */}
      <div className="paper-card p-4">
        <TextArea
          label="Backstory"
          value={character.backstory}
          onChange={(v) => u({ backstory: v })}
          rows={6}
        />
      </div>

      {/* Physical */}
      <div className="paper-card p-4">
        <div className="section-header">Physical Description</div>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['age', 'Age'],
            ['height', 'Height'],
            ['weight', 'Weight'],
            ['eyes', 'Eyes'],
            ['skin', 'Skin'],
            ['hair', 'Hair'],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className="text-xs text-ink-muted font-sans">{label}</label>
              <input
                type="text"
                value={character[field]}
                onChange={(e) => u({ [field]: e.target.value })}
                className="field-box w-full"
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs text-ink-muted font-sans">Appearance Notes</label>
          <textarea
            value={character.appearance}
            onChange={(e) => u({ appearance: e.target.value })}
            rows={3}
            className="field-box w-full resize-none mt-1"
          />
        </div>
      </div>
    </div>
  )
}
