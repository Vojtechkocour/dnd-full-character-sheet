import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import type { Character, Feature } from '@/types'

interface Props {
  character: Character
}

function FeatureCard({ feature, onUpdate, onDelete }: {
  feature: Feature
  onUpdate: (patch: Partial<Feature>) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  function useCharge() {
    if (feature.usesMax === undefined || feature.usesRemaining === undefined) return
    if (feature.usesRemaining > 0) {
      onUpdate({ usesRemaining: feature.usesRemaining - 1 })
    }
  }

  function restoreCharge() {
    if (feature.usesMax === undefined) return
    onUpdate({ usesRemaining: feature.usesMax })
  }

  return (
    <div className="paper-card p-3">
      <div
        className="flex items-start justify-between gap-2 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="font-display text-base text-ink">{feature.name}</div>
          <div className="text-xs text-ink-muted font-sans">{feature.source}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Uses tracker */}
          {feature.usesMax !== undefined && (
            <div className="flex gap-1">
              {Array.from({ length: feature.usesMax }).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); onUpdate({ usesRemaining: i < (feature.usesRemaining ?? 0) ? feature.usesRemaining! - 1 : i + 1 }) }}
                  className={`w-4 h-4 rounded-full border transition-colors ${
                    i < (feature.usesRemaining ?? 0)
                      ? 'bg-ink border-ink'
                      : 'border-ink/30 bg-parchment-100'
                  }`}
                />
              ))}
            </div>
          )}
          <span className="text-ink-muted text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-parchment-300 space-y-2">
          <p className="font-serif text-sm text-ink whitespace-pre-wrap">{feature.description || 'No description.'}</p>
          {feature.usesMax !== undefined && (
            <div className="flex gap-2">
              <button onClick={useCharge} className="text-xs px-2 py-1 paper-card hover:bg-parchment-200 font-sans">
                Use
              </button>
              <button onClick={restoreCharge} className="text-xs px-2 py-1 paper-card hover:bg-parchment-200 font-sans">
                Restore ({feature.recharge ?? 'manual'})
              </button>
            </div>
          )}
          <button
            onClick={onDelete}
            className="text-xs text-accent-red hover:underline font-sans"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function TabFeatures({ character }: Props) {
  const { updateCharacter } = useCharacterStore()
  const [showForm, setShowForm] = useState(false)
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({ name: '', source: '', description: '' })

  function addFeature() {
    if (!newFeature.name) return
    const feature: Feature = {
      id: uuidv4(),
      name: newFeature.name,
      source: newFeature.source ?? '',
      description: newFeature.description ?? '',
      usesMax: newFeature.usesMax,
      usesRemaining: newFeature.usesMax,
      recharge: newFeature.recharge,
    }
    updateCharacter(character.id, { features: [...character.features, feature] })
    setNewFeature({ name: '', source: '', description: '' })
    setShowForm(false)
  }

  function updateFeature(id: string, patch: Partial<Feature>) {
    updateCharacter(character.id, {
      features: character.features.map((f) => f.id === id ? { ...f, ...patch } : f),
    })
  }

  function deleteFeature(id: string) {
    updateCharacter(character.id, {
      features: character.features.filter((f) => f.id !== id),
    })
  }

  return (
    <div className="space-y-3">
      {character.features.length === 0 && !showForm && (
        <div className="text-center py-8 text-ink-muted">
          <p className="font-serif italic">No features yet.</p>
        </div>
      )}

      {character.features.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          onUpdate={(patch) => updateFeature(feature.id, patch)}
          onDelete={() => deleteFeature(feature.id)}
        />
      ))}

      {showForm ? (
        <div className="paper-card p-4 space-y-3">
          <div className="section-header">New Feature</div>
          <input
            type="text"
            placeholder="Name *"
            value={newFeature.name ?? ''}
            onChange={(e) => setNewFeature((f) => ({ ...f, name: e.target.value }))}
            className="field-box w-full"
          />
          <input
            type="text"
            placeholder="Source (Fighter 1, Feat: Alert...)"
            value={newFeature.source ?? ''}
            onChange={(e) => setNewFeature((f) => ({ ...f, source: e.target.value }))}
            className="field-box w-full"
          />
          <textarea
            placeholder="Description..."
            value={newFeature.description ?? ''}
            onChange={(e) => setNewFeature((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="field-box w-full resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted font-sans">Max uses (optional)</label>
              <input
                type="number"
                min={1}
                value={newFeature.usesMax ?? ''}
                onChange={(e) => setNewFeature((f) => ({ ...f, usesMax: e.target.value ? Number(e.target.value) : undefined }))}
                className="field-box w-full"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted font-sans">Recharge</label>
              <select
                value={newFeature.recharge ?? ''}
                onChange={(e) => setNewFeature((f) => ({ ...f, recharge: e.target.value as Feature['recharge'] || undefined }))}
                className="field-box w-full"
              >
                <option value="">—</option>
                <option value="shortRest">Short Rest</option>
                <option value="longRest">Long Rest</option>
                <option value="dawn">Dawn</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addFeature}
              disabled={!newFeature.name}
              className="px-4 py-2 bg-ink text-parchment-50 font-serif text-sm rounded-sm disabled:opacity-40"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 paper-card font-serif text-sm hover:bg-parchment-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full paper-card border-dashed p-3 text-center font-serif text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
        >
          + Add Feature / Feat
        </button>
      )}
    </div>
  )
}
