import { useState } from 'react'

const TONE_COLORS = {
  'Bold': '#e05fff',
  'Vulnerable': '#ff8c4b',
  'Data-Driven': '#00e5c3',
  'Contrarian': '#7c6af7',
  'Storytelling': '#ffba00',
}

function ViralScoreBadge({ score }) {
  const color = score >= 9 ? '#00e5c3' : score >= 8 ? '#7c6af7' : '#ffba00'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px',
      background: `${color}18`,
      border: `1px solid ${color}40`,
      borderRadius: '20px',
    }}>
      <span style={{ fontSize: '10px', color, fontFamily: 'var(--font-mono)' }}>VIRAL SCORE</span>
      <span style={{ fontSize: '14px', fontWeight: '700', color, fontFamily: 'var(--font-mono)' }}>{score}/10</span>
    </div>
  )
}

export default function GeneratedPosts({ posts }) {
  const [copiedId, setCopiedId] = useState(null)
  const [expanded, setExpanded] = useState(0)

  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        No posts generated yet.
      </div>
    )
  }

  const copyPost = (post, id) => {
    const full = [post.hook, '', post.body, '', post.cta, '', post.hashtags?.map(h => `#${h}`).join(' ')].join('\n')
    navigator.clipboard.writeText(full)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {posts.length} posts generated — click to expand
      </p>

      {posts.map((post, i) => {
        const toneColor = TONE_COLORS[post.tone] || 'var(--accent)'
        const isOpen = expanded === i

        return (
          <div
            key={i}
            className={`fade-up fade-up-${i + 1}`}
            style={{
              background: 'var(--bg-2)',
              border: `1px solid ${isOpen ? 'rgba(124,106,247,0.4)' : 'var(--border)'}`,
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
              boxShadow: isOpen ? '0 0 30px rgba(124,106,247,0.06)' : 'none',
            }}
          >
            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? -1 : i)}
              style={{
                width: '100%', padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'transparent', border: 'none', cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                {/* Number badge */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                  background: `${toneColor}22`, border: `1px solid ${toneColor}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '12px', color: toneColor,
                  fontWeight: '600',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Hook preview */}
                <span style={{
                  fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '400px',
                }}>
                  {post.hook?.split('\n')[0] || 'Generated Post'}
                </span>

                {/* Tone badge */}
                <span style={{
                  flexShrink: 0,
                  padding: '3px 10px',
                  background: `${toneColor}18`, border: `1px solid ${toneColor}40`,
                  borderRadius: '20px', fontSize: '11px', color: toneColor,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                }}>
                  {post.tone}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <ViralScoreBadge score={post.viral_score} />
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>⌄</span>
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                {/* Full post */}
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  background: 'var(--bg-3)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  lineHeight: '1.75',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  letterSpacing: '0.01em',
                }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px', color: 'var(--text-primary)' }}>
                    {post.hook}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {post.body}
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '14px' }}>
                    {post.cta}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    {post.hashtags?.map(tag => (
                      <span key={tag} style={{
                        padding: '3px 10px', background: 'var(--bg-4)',
                        border: '1px solid var(--border)', borderRadius: '20px',
                        fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={() => copyPost(post, i)}
                    style={{
                      padding: '10px 20px',
                      background: copiedId === i ? 'rgba(0,229,195,0.1)' : 'var(--accent)',
                      border: `1px solid ${copiedId === i ? 'var(--accent-3)' : 'transparent'}`,
                      borderRadius: '8px',
                      color: copiedId === i ? 'var(--accent-3)' : '#fff',
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {copiedId === i ? '✓ Copied!' : 'Copy Post'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
