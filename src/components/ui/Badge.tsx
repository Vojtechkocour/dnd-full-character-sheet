import { cn } from '@/utils/cn'

interface BadgeProps {
  label: string
  className?: string
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide', className)}>
      {label}
    </span>
  )
}
