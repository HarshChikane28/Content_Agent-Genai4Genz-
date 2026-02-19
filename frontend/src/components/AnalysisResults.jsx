import { useState } from 'react'

function ScoreMeter({ label, value, max = 5, color }) {
  const pct = (value / max) * 100
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color, fontWeight: '600' }}>{value}/{max}</span>
      </div>
      <div style={{ height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: '2px',
          transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: `0 0 8px ${color}80`,
        }} />
      </div>
    </div>
  )
}

export default function AnalysisResults({ analyses }) {
  const [expanded, setExpanded] = useState(0)

  if (!analyses || analyses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        No analysis data available.
      </div>
    )
  }

  // Compute averages
  const avgSentiment = (analyses.reduce((s, a) => s + (a.overall_sentiment || 3), 0) / analyses.length).toFixed(1)
  const avgUseful = (analyses.reduce((s, a) => s + (a.tool_usefulness || 3), 0) / analyses.length).toFixed(1)

  return (
    <div>
      {/* Summary averages */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px',
        padding: '20px',
        background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px',
      }}>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Avg Sentiment</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: '500', color: 'var(--accent)' }}>{avgSentiment}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>out of 5</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border)' }} />
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Avg Usefulness</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: '500', color: 'var(--accent-3)' }}>{avgUseful}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>out of 5</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border)' }} />
        <div style={{ flex: 2, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Distribution</div>
          <ScoreMeter label="Sentiment" value={parseFloat(avgSentiment)} color="var(--accent)" />
          <ScoreMeter label="Usefulness" value={parseFloat(avgUseful)} color="var(--accent-3)" />
        </div>
      </div>

      {/* Individual post cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {analyses.map((a, i) => {
          const isOpen = expanded === i
          const sentColor = a.overall_sentiment >= 4 ? 'var(--accent-3)' : a.overall_sentiment >= 3 ? 'var(--warn)' : 'var(--danger)'
          const questions = typeof a.common_questions === 'string'
            ? JSON.parse(a.common_questions || '[]')
            : (a.common_questions || [])

          return (
            <div
              key={i}
              className={`fade-up fade-up-${i + 1}`}
              style={{
                background: 'var(--bg-2)',
                border: `1px solid ${isOpen ? 'var(--border-bright)' : 'var(--border)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(isOpen ? -1 : i)}
                style={{
                  width: '100%', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {a.author || `Post #${i + 1}`}
                    </span>
                    {a.source === 'mock' && (
                      <span style={{
                        padding: '2px 8px', background: 'var(--bg-4)', borderRadius: '3px',
                        fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)',
                        letterSpacing: '0.06em',
                      }}>MOCK</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px', color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {a.text?.substring(0, 80)}…
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>❤ <span style={{ color: 'var(--text-secondary)' }}>{(a.likes || 0).toLocaleString()}</span></span>
                    <span style={{ color: 'var(--text-muted)' }}>💬 <span style={{ color: 'var(--text-secondary)' }}>{(a.comments || 0).toLocaleString()}</span></span>
                  </div>
                  {/* Sentiment score */}
                  <div style={{
                    padding: '4px 10px', borderRadius: '20px',
                    background: `${sentColor}18`, border: `1px solid ${sentColor}40`,
                    fontFamily: 'var(--font-mono)', fontSize: '12px', color: sentColor, fontWeight: '600',
                  }}>
                    {a.overall_sentiment}/5
                  </div>
                  <span style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '18px' }}>⌄</span>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {/* Scores */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Scores</div>
                      <ScoreMeter label="Overall Sentiment" value={a.overall_sentiment} color="var(--accent)" />
                      <ScoreMeter label="Tool Usefulness" value={a.tool_usefulness} color="var(--accent-3)" />
                    </div>

                    {/* Questions */}
                    {questions.length > 0 && (
                      <div style={{ flex: 2, minWidth: '260px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Audience Questions</div>
                        {questions.map((q, qi) => (
                          <div key={qi} style={{
                            padding: '8px 12px', marginBottom: '6px',
                            background: 'var(--bg-3)', borderRadius: '6px',
                            border: '1px solid var(--border)',
                            fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5',
                            fontFamily: 'var(--font-display)',
                          }}>
                            <span style={{ color: 'var(--accent)', marginRight: '6px' }}>?</span>{q}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key insights */}
                  {a.key_insights && (
                    <div style={{
                      marginTop: '16px', padding: '14px 16px',
                      background: 'rgba(124,106,247,0.06)',
                      border: '1px solid rgba(124,106,247,0.2)',
                      borderRadius: '8px',
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Key Insight</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{a.key_insights}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
