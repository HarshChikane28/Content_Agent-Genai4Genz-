export default function Header({ onReset }) {
  return (
    <header style={{
      padding: '32px 0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
          }}>⚡</div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>AI Content Intelligence</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          lineHeight: '1.05',
          background: 'linear-gradient(135deg, #f0f0f8 30%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ViralOS
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginTop: '6px',
          letterSpacing: '0.01em',
          fontWeight: '400',
        }}>
          Analyse top LinkedIn posts. Generate content that converts.
        </p>
      </div>

      {onReset && (
        <button
          onClick={onReset}
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => e.target.style.borderColor = 'var(--border-bright)'}
          onMouseOut={e => e.target.style.borderColor = 'var(--border)'}
        >
          ← New Run
        </button>
      )}
    </header>
  )
}
