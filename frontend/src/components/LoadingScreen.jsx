import { useState, useEffect } from 'react'

const STEPS = [
  { id: 1, label: 'Fetching LinkedIn posts…', sub: 'Scanning top performers in your niche' },
  { id: 2, label: 'Running sentiment analysis…', sub: 'Gemini is reading the room' },
  { id: 3, label: 'Extracting audience insights…', sub: 'Finding what actually resonated' },
  { id: 4, label: 'Generating viral content…', sub: 'Crafting 3 posts built to spread' },
]

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
    }, 1800)
    return () => clearInterval(stepTimer)
  }, [])

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)
    return () => clearInterval(dotTimer)
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '48px',
    }} className="fade-up">
      {/* Spinner ring */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '2px solid var(--border)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'var(--accent)',
          borderRightColor: 'var(--accent-2)',
          animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '20px',
          borderRadius: '50%',
          border: '1px solid var(--border)',
          borderTopColor: 'var(--accent-3)',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '18px',
        }}>⚡</div>
      </div>

      {/* Steps */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {STEPS.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          return (
            <div
              key={step.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '14px 16px',
                background: isActive ? 'var(--bg-3)' : 'var(--bg-2)',
                border: `1px solid ${isActive ? 'var(--accent)' : isDone ? 'rgba(0,229,195,0.2)' : 'var(--border)'}`,
                borderRadius: '10px',
                opacity: i > currentStep ? 0.35 : 1,
                transition: 'all 0.4s ease',
              }}
            >
              {/* Status icon */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                background: isDone ? 'var(--accent-3)' : isActive ? 'var(--accent)' : 'var(--bg-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', marginTop: '1px',
                transition: 'all 0.3s',
              }}>
                {isDone ? '✓' : isActive ? <span style={{ animation: 'spin 0.9s linear infinite', display: 'inline-block' }}>◌</span> : '○'}
              </div>

              <div>
                <div style={{
                  fontSize: '14px', fontWeight: isActive ? '600' : '400',
                  color: isActive ? 'var(--text-primary)' : isDone ? 'var(--accent-3)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  transition: 'color 0.3s',
                }}>
                  {step.label}{isActive ? dots : ''}
                </div>
                {isActive && (
                  <div style={{
                    fontSize: '12px', color: 'var(--text-secondary)',
                    marginTop: '3px', fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.02em',
                  }}>
                    {step.sub}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
