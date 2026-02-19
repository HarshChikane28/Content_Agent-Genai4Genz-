import { useState } from 'react'

const EXAMPLE_NICHES = [
  'AI & Productivity', 'B2B SaaS', 'Personal Branding',
  'Startup Founders', 'Marketing Strategy', 'Career Growth'
]

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--bg-3)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-display)',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: '8px',
  fontWeight: '600',
}

export default function RunForm({ onSubmit, error }) {
  const [niche, setNiche] = useState('')
  const [keywords, setKeywords] = useState('')
  const [numPosts, setNumPosts] = useState(5)
  const [useMock, setUseMock] = useState(true)
  const [focused, setFocused] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!niche.trim()) return

    onSubmit({
      niche: niche.trim(),
      platform: 'LinkedIn',
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      num_posts: parseInt(numPosts),
      use_mock: useMock,
      // Apify token is now read from .env variables
    })
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Hero text */}
      <div style={{ marginBottom: '48px' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>How it works</p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { n: '01', t: 'Scrape', d: 'Pull top LinkedIn posts in your niche' },
            { n: '02', t: 'Analyse', d: 'Gemini scores sentiment & extracts insights' },
            { n: '03', t: 'Generate', d: '3 viral posts crafted from what worked' },
          ].map(s => (
            <div key={s.n} style={{
              flex: '1', minWidth: '160px',
              padding: '16px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', marginBottom: '6px', letterSpacing: '0.1em' }}>{s.n}</div>
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{s.t}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={labelStyle}>Your Niche *</label>
          <input
            value={niche}
            onChange={e => setNiche(e.target.value)}
            onFocus={() => setFocused('niche')}
            onBlur={() => setFocused(null)}
            placeholder="e.g. B2B SaaS, AI & Productivity, Personal Branding"
            required
            style={{ ...inputStyle, borderColor: focused === 'niche' ? 'var(--accent)' : 'var(--border)' }}
          />
          {/* Quick niche pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {EXAMPLE_NICHES.map(n => (
              <button
                type="button"
                key={n}
                onClick={() => setNiche(n)}
                style={{
                  padding: '4px 12px',
                  background: niche === n ? 'var(--accent)' : 'var(--bg-3)',
                  border: `1px solid ${niche === n ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '20px',
                  color: niche === n ? '#fff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  transition: 'all 0.15s',
                }}
              >{n}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Keywords (optional, comma-separated)</label>
          <input
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onFocus={() => setFocused('kw')}
            onBlur={() => setFocused(null)}
            placeholder="viral content, thought leadership, AI tools"
            style={{ ...inputStyle, borderColor: focused === 'kw' ? 'var(--accent)' : 'var(--border)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Posts to Analyse</label>
            <select
              value={numPosts}
              onChange={e => setNumPosts(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {[3, 5, 8, 10].map(n => (
                <option key={n} value={n}>{n} posts</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data Source</label>
            <select
              value={useMock ? 'mock' : 'apify'}
              onChange={e => setUseMock(e.target.value === 'mock')}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="mock">Mock Data (demo)</option>
              <option value="apify">Real Apify Scraper</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '14px 16px',
            background: 'rgba(255,77,106,0.08)',
            border: '1px solid rgba(255,77,106,0.3)',
            borderRadius: '8px',
            color: 'var(--danger)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
          }}>
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!niche.trim()}
          style={{
            padding: '16px',
            background: niche.trim()
              ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
              : 'var(--bg-4)',
            border: 'none',
            borderRadius: '10px',
            color: niche.trim() ? '#fff' : 'var(--text-muted)',
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: '700',
            letterSpacing: '0.04em',
            cursor: niche.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: niche.trim() ? '0 0 30px rgba(124,106,247,0.3)' : 'none',
            animation: niche.trim() ? 'pulse-glow 3s ease-in-out infinite' : 'none',
          }}
          onMouseOver={e => { if (niche.trim()) e.target.style.transform = 'translateY(-1px)' }}
          onMouseOut={e => { e.target.style.transform = 'translateY(0)' }}
        >
          Run Pipeline →
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '-12px', letterSpacing: '0.04em' }}>
          Mock mode works without any API keys • Add GEMINI_API_KEY & APIFY_API_KEY to .env for real AI
        </p>
      </form>
    </div>
  )
}
