import { useNavigate } from 'react-router-dom'
import type { Spell } from '@/store/spellStore'
import { SPELL_SCHOOL_LABELS, SPELL_SCHOOL_COLORS } from '@/store/spellStore'
import { Badge } from '../ui/Badge'
import { cn } from '@/utils/cn'

interface SpellCardProps {
  spell: Spell
  isPrepared: boolean
  isAtLimit?: boolean
  isUnavailable?: boolean
  onTogglePrepare: () => void
}

export function SpellCard({ spell, isPrepared, isAtLimit = false, isUnavailable = false, onTogglePrepare }: SpellCardProps) {
  const navigate = useNavigate()
  const levelLabel = spell.level === 0 ? 'Cantrip' : `Lv ${spell.level}`
  const blocked = !isPrepared && (isUnavailable || isAtLimit)

  return (
    <div className="bg-parchment-50 border border-parchment-400 hover:border-accent-gold rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <button onClick={() => navigate(`/spells/${spell.id}`)} className="text-left w-full p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-ink leading-tight text-base">{spell.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {spell.concentration && <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-300">C</span>}
            {spell.ritual && <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-300">R</span>}
          </div>
        </div>
        <p className="text-xs text-ink-muted mt-1">{levelLabel} &bull; {spell.castingTime} &bull; {spell.range}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge label={SPELL_SCHOOL_LABELS[spell.school]} className={SPELL_SCHOOL_COLORS[spell.school]} />
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          onClick={blocked ? undefined : onTogglePrepare}
          disabled={blocked}
          title={isUnavailable && !isPrepared ? 'Requires higher character level' : isAtLimit && !isPrepared ? 'Spell limit reached' : undefined}
          className={cn(
            'w-full text-sm py-1.5 rounded border transition-colors',
            isPrepared
              ? 'bg-accent-gold/10 border-accent-gold text-accent-gold hover:bg-accent-red/10 hover:border-accent-red hover:text-accent-red'
              : isUnavailable
                ? 'bg-transparent border-parchment-300/50 text-ink-muted/30 cursor-not-allowed'
                : isAtLimit
                  ? 'bg-transparent border-parchment-300/60 text-ink-muted/30 cursor-not-allowed'
                  : 'bg-transparent border-parchment-300 text-ink-muted hover:border-accent-gold hover:text-accent-gold'
          )}
        >
          {isPrepared ? 'Prepared' : isUnavailable ? 'Too high level' : isAtLimit ? '— at limit' : '+ Add'}
        </button>
      </div>
    </div>
  )
}
