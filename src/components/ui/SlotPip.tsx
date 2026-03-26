import { cn } from '@/utils/cn'

interface SlotPipProps {
  filled: boolean
  onClick?: () => void
  disabled?: boolean
}

export function SlotPip({ filled, onClick, disabled }: SlotPipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={filled ? 'Used slot — click to recover' : 'Available slot — click to use'}
      className={cn(
        'w-6 h-6 rounded-full border-2 transition-all duration-150',
        'focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:outline-none',
        'disabled:cursor-not-allowed',
        filled
          ? 'bg-transparent border-parchment-400'
          : 'bg-accent-gold border-accent-gold/80 shadow-sm',
        !disabled && 'hover:scale-110 cursor-pointer'
      )}
    />
  )
}
