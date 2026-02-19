import { useState, useCallback } from 'react'
import RunForm from './components/RunForm.jsx'
import AnalysisResults from './components/AnalysisResults.jsx'
import GeneratedPosts from './components/GeneratedPosts.jsx'
import Header from './components/Header.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

const API_BASE = 'http://localhost:8000'

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | loading | results
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('generated')

  const handleRun = useCallback(async (formData) => {
    setPhase('loading')
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Pipeline failed')
      }

      const data = await response.json()
      setResults(data)
      setPhase('results')
      setActiveTab('generated')
    } catch (e) {
      setError(e.message)
      setPhase('idle')
    }
  }, [])

  const handleReset = () => {
    setPhase('idle')
    setResults(null)
    setError(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(124,106,247,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,106,247,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none'
      }} />

      {/* Glow blobs */}
      <div style={{
        position: 'fixed', top: '-20vh', left: '10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-10vh', right: '5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0,229,195,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <Header onReset={phase !== 'idle' ? handleReset : null} />

        {phase === 'idle' && (
          <div className="fade-up">
            <RunForm onSubmit={handleRun} error={error} />
          </div>
        )}

        {phase === 'loading' && <LoadingScreen />}

        {phase === 'results' && results && (
          <div className="fade-up">
            {/* Summary bar */}
            <div style={{
              display: 'flex', gap: '16px', marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              <StatBadge
                label="Posts Analysed"
                value={results.analyses?.length || 0}
                color="var(--accent)"
              />
              <StatBadge
                label="Posts Generated"
                value={results.generated_posts?.length || 0}
                color="var(--accent-3)"
              />
              <StatBadge
                label="Platform"
                value="LinkedIn"
                color="var(--accent-2)"
              />
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--bg-2)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
              {[
                { id: 'generated', label: '✦ Generated Posts' },
                { id: 'analysis', label: '⬡ Sentiment Analysis' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '7px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: '600',
                    letterSpacing: '0.02em',
                    transition: 'all 0.2s',
                    background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'generated' && (
              <GeneratedPosts posts={results.generated_posts} />
            )}
            {activeTab === 'analysis' && (
              <AnalysisResults analyses={results.analyses} />
            )}

            <div style={{ marginTop: '48px', paddingBottom: '60px', textAlign: 'center' }}>
              <button onClick={handleReset} style={{
                padding: '12px 32px',
                background: 'transparent',
                border: '1px solid var(--border-bright)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
              onMouseOut={e => { e.target.style.borderColor = 'var(--border-bright)'; e.target.style.color = 'var(--text-secondary)'; }}
              >
                ← Run Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 20px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '500', color }}>{value}</span>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}
