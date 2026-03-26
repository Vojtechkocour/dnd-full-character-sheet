import { type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export function SearchInput({ className, onClear, value, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">&#x1F50D;</span>
      <input
        type="search"
        value={value}
        className={cn(
          'w-full bg-parchment-100 border border-parchment-300 rounded pl-9 pr-9 py-2',
          'text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-accent-gold transition-colors',
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button type="button" onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink" aria-label="Clear">
          &#x2715;
        </button>
      )}
    </div>
  )
}
