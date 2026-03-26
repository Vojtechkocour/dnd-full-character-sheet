import type { SpellFilters as SpellFiltersType, SpellSchool } from '@/store/spellStore'
import { SPELL_SCHOOL_LABELS, CHARACTER_CLASS_LABELS } from '@/store/spellStore'

interface SpellFiltersProps {
  filters: SpellFiltersType
  onChange: (patch: Partial<SpellFiltersType>) => void
  onReset: () => void
}

const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const SCHOOLS = Object.keys(SPELL_SCHOOL_LABELS) as SpellSchool[]
const CLASSES = Object.keys(CHARACTER_CLASS_LABELS)

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
}

export function SpellFilters({ filters, onChange, onReset }: SpellFiltersProps) {
  const activeCount = filters.levels.length + filters.schools.length + filters.classes.length
    + (filters.concentration !== null ? 1 : 0) + (filters.ritual !== null ? 1 : 0)

  return (
    <div className="bg-parchment-50 border border-parchment-400 rounded-xl p-4 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-light uppercase tracking-wide">
          Filters {activeCount > 0 && <span className="text-accent-gold">({activeCount})</span>}
        </h3>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-ink-muted hover:text-ink transition-colors">Reset</button>
        )}
      </div>

      <div>
        <p className="text-xs text-ink-muted mb-2">Level</p>
        <div className="flex flex-wrap gap-1">
          {LEVELS.map(lvl => (
            <button key={lvl} onClick={() => onChange({ levels: toggleItem(filters.levels, lvl) })}
              className={`w-8 h-8 rounded text-xs transition-colors ${
                filters.levels.includes(lvl) ? 'bg-accent-gold text-parchment-50 font-bold' : 'bg-parchment-200 text-ink-muted hover:bg-parchment-300'
              }`}>{lvl === 0 ? 'C' : lvl}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-ink-muted mb-2">School</p>
        <div className="flex flex-wrap gap-1">
          {SCHOOLS.map(school => (
            <button key={school} onClick={() => onChange({ schools: toggleItem(filters.schools, school) })}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                filters.schools.includes(school) ? 'bg-accent-gold text-parchment-50 font-bold' : 'bg-parchment-200 text-ink-muted hover:bg-parchment-300'
              }`}>{SPELL_SCHOOL_LABELS[school]}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-ink-muted mb-2">Class</p>
        <div className="flex flex-wrap gap-1">
          {CLASSES.map(cls => (
            <button key={cls} onClick={() => onChange({ classes: toggleItem(filters.classes, cls) })}
              className={`px-2 py-1 rounded text-xs transition-colors capitalize ${
                filters.classes.includes(cls) ? 'bg-accent-gold text-parchment-50 font-bold' : 'bg-parchment-200 text-ink-muted hover:bg-parchment-300'
              }`}>{CHARACTER_CLASS_LABELS[cls as keyof typeof CHARACTER_CLASS_LABELS]}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onChange({ concentration: filters.concentration === true ? null : true })}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${
            filters.concentration === true ? 'bg-yellow-600 text-white' : 'bg-parchment-200 text-ink-muted hover:bg-parchment-300'
          }`}>Concentration</button>
        <button onClick={() => onChange({ ritual: filters.ritual === true ? null : true })}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${
            filters.ritual === true ? 'bg-purple-600 text-white' : 'bg-parchment-200 text-ink-muted hover:bg-parchment-300'
          }`}>Ritual</button>
      </div>
    </div>
  )
}
