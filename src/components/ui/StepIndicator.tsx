interface Step {
  label: string
  icon: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isDone = index < currentStep
        const isActive = index === currentStep
        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-colors
                  ${isDone ? 'bg-ink border-ink text-parchment-50' : ''}
                  ${isActive ? 'bg-parchment-50 border-accent-gold text-ink' : ''}
                  ${!isDone && !isActive ? 'bg-parchment-100 border-ink/20 text-ink-muted' : ''}
                `}
              >
                {isDone ? '✓' : step.icon}
              </div>
              <span className={`text-xs mt-1 font-sans ${isActive ? 'text-ink font-medium' : 'text-ink-muted'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px mb-5 mx-1 ${index < currentStep ? 'bg-ink' : 'bg-ink/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
