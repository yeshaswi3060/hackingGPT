import React, { useState, useEffect, useRef, useCallback } from 'react'

// ─── MIDNIGHT GREEN Design System ────────────────────────────────────────────
const G = {
  bg:       '#000000',
  bg1:      '#060806',
  bg2:      '#0a0f0a',
  bg3:      '#0f160f',
  border:   'rgba(0,255,136,0.08)',
  borderHov:'rgba(0,255,136,0.22)',
  accent:   '#00ff88',
  accentDim:'#00cc6a',
  accentGlow:'rgba(0,255,136,0.12)',
  accentBg: 'rgba(0,255,136,0.06)',
  textPri:  '#e8fef0',
  textSec:  '#4b6b55',
  textMut:  '#2a3d30',
  red:      '#ff4444',
  redDim:   'rgba(255,68,68,0.12)',
  redBorder:'rgba(255,68,68,0.25)',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(b) {
  if (b < 1024) return `${b}B`
  if (b < 1048576) return `${(b / 1024).toFixed(0)}KB`
  return `${(b / 1048576).toFixed(1)}MB`
}

function timeStr(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Syntax-aware message renderer ───────────────────────────────────────────
function Prose({ text }) {
  if (!text) return null
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const nl = part.indexOf('\n')
          const lang = nl > 3 ? part.slice(3, nl).trim() : ''
          const code = part.slice(nl + 1).replace(/```$/, '').trimEnd()
          return (
            <pre key={i} style={{
              background: '#050d07', border: `1px solid ${G.border}`,
              borderLeft: `3px solid ${G.accentDim}`,
              borderRadius: '8px', padding: '14px 18px', margin: '10px 0',
              fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: G.accent,
              overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.65
            }}>
              {lang && <div style={{ color: G.textSec, fontSize: '0.7rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.12em' }}>{lang.toUpperCase()}</div>}
              {code}
            </pre>
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} style={{ background: G.accentBg, color: G.accent, padding: '2px 7px', borderRadius: '5px', fontFamily: 'var(--font-mono)', fontSize: '0.88em', border: `1px solid ${G.border}` }}>{part.slice(1, -1)}</code>
        }
        return part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((s, j) => {
          if (s.startsWith('**') && s.endsWith('**')) return <strong key={j} style={{ color: '#ffffff', fontWeight: 700 }}>{s.slice(2, -2)}</strong>
          if (s.startsWith('*') && s.endsWith('*')) return <em key={j} style={{ color: G.textPri, opacity: 0.8 }}>{s.slice(1, -1)}</em>
          return <span key={j}>{s}</span>
        })
      })}
    </>
  )
}

// ─── Summary Card (renders ---SUMMARY--- blocks) ──────────────────────────────
function SummaryCard({ raw }) {
  const sections = {
    done:    { icon: '✅', title: 'What Was Done',            color: G.accent },
    files:   { icon: '📁', title: 'Files Created / Modified', color: '#60a5fa' },
    next:    { icon: '⚠️', title: 'What You Need To Do Next', color: '#fbbf24' },
    findings:{ icon: '🔍', title: 'Key Findings',             color: '#a78bfa' },
  }
  // Parse sections from raw summary text
  const parsed = {}
  const sectionRe = /##\s*[✅📁⚠️🔍]\s*(What Was Done|Files Created.*?|What You Need.*?|Key Findings)([\s\S]*?)(?=##\s*[✅📁⚠️🔍]|$)/gi
  let m
  while ((m = sectionRe.exec(raw)) !== null) {
    const title = m[1].trim().toLowerCase()
    const content = m[2].trim()
    if (title.includes('done'))     parsed.done = content
    if (title.includes('files'))    parsed.files = content
    if (title.includes('need'))     parsed.next = content
    if (title.includes('findings')) parsed.findings = content
  }

  return (
    <div style={{ marginTop: '12px', border: `1px solid ${G.accentDim}`, borderRadius: '12px', overflow: 'hidden', boxShadow: `0 0 30px rgba(0,255,136,0.08)` }}>
      {/* Header */}
      <div style={{ background: G.accentBg, borderBottom: `1px solid ${G.border}`, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: G.accent, boxShadow: `0 0 8px ${G.accent}` }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 900, color: G.accent, letterSpacing: '0.16em' }}>TASK COMPLETE — MISSION REPORT</span>
      </div>
      {/* Section grid */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#020804' }}>
        {Object.entries(sections).map(([key, meta]) => {
          const content = parsed[key]
          if (!content) return null
          const lines = content.split('\n').filter(l => l.trim())
          return (
            <div key={key} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderLeft: `3px solid ${meta.color}`, borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 900, color: meta.color, letterSpacing: '0.12em', marginBottom: '8px' }}>{meta.icon} {meta.title.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {lines.map((line, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: G.textPri, lineHeight: 1.6, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: meta.color, flexShrink: 0, marginTop: '2px', fontSize: '0.75rem' }}>›</span>
                    <span>{line.replace(/^[-•*]\s*/, '').replace(/^\[.*?\]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Task parser ─────────────────────────────────────────────────────────────
function parseTasks(text) {
  const lines = text.split('\n')
  const tasks = []
  for (const line of lines) {
    const m = line.match(/^\s*-\s+\[([ xX])\]\s+(.+)$/)
    if (m) {
      const done = m[1].toLowerCase() === 'x'
      const taskText = m[2].trim()
      if (taskText.length > 2 && taskText.length < 300) {
        tasks.push({ text: taskText, done, id: Math.random().toString(36).slice(2) })
      }
    }
  }
  return tasks.slice(0, 30)
}

// ─── Tool Block ───────────────────────────────────────────────────────────────
function ToolBlock({ ev }) {
  const [expanded, setExpanded] = useState(false)
  const { type, data, timestamp } = ev
  const isStart = type === 'TOOL_START'
  const isResult = type === 'TOOL_RESULT'

  const toolMeta = {
    shell:               { icon: '⚡', label: 'EXEC',   color: G.accent },
    read_file:           { icon: '📄', label: 'READ',   color: '#60a5fa' },
    write_file:          { icon: '✏️',  label: 'WRITE',  color: '#a78bfa' },
    list_dir:            { icon: '📁', label: 'LIST',   color: '#60a5fa' },
    grep_search:         { icon: '🔍', label: 'SEARCH', color: '#fbbf24' },
    replace_file_content:{ icon: '🔧', label: 'PATCH',  color: '#f97316' },
    web_search:          { icon: '🌐', label: 'WEB',    color: '#06b6d4' },
  }
  const meta = toolMeta[data.tool] || { icon: '🔧', label: 'TOOL', color: G.accentDim }

  if (isStart) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '10px 16px', borderRadius: '10px', margin: '4px 0',
        background: G.accentBg, border: `1px solid ${G.border}`,
        borderLeft: `3px solid ${meta.color}`,
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.14em', color: meta.color }}>{meta.label}</span>
            <span style={{ fontSize: '0.7rem', color: G.textSec }}>{timeStr(timestamp)}</span>
          </div>
          <code style={{ fontSize: '0.85rem', color: G.textPri, fontFamily: 'var(--font-mono)', wordBreak: 'break-all', lineHeight: 1.4, opacity: 0.9 }}>
            {data.command || data.path || data.query || ''}
          </code>
        </div>
        {/* Pulsing dot */}
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: meta.color, boxShadow: `0 0 8px ${meta.color}`, flexShrink: 0, animation: 'mgPulse 1.2s infinite' }} />
      </div>
    )
  }

  if (isResult) {
    const isErr = data.returncode !== undefined && data.returncode !== 0
    const output = (data.output || data.content || '').trim()
    const isLong = output.length > 300

    return (
      <div style={{
        padding: '10px 16px', borderRadius: '10px', margin: '4px 0',
        background: isErr ? G.redDim : 'rgba(0,255,136,0.04)',
        border: `1px solid ${isErr ? G.redBorder : G.border}`,
        borderLeft: `3px solid ${isErr ? G.red : G.accentDim}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.12em', color: isErr ? G.red : G.accent }}>
            {isErr ? '✗ FAILED' : '✓ DONE'}
            {data.returncode !== undefined && <span style={{ opacity: 0.6, marginLeft: '8px', fontWeight: 600 }}>exit:{data.returncode}</span>}
          </span>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} style={{
              background: 'transparent', border: `1px solid ${G.border}`, color: G.textSec,
              cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px',
              borderRadius: '6px', transition: 'all 0.15s', letterSpacing: '0.05em'
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent }}
              onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.textSec }}
            >
              {expanded ? '▴ COLLAPSE' : '▾ EXPAND'}
            </button>
          )}
        </div>
        {data.items ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: G.textPri, lineHeight: 1.8 }}>
            {data.items.slice(0, 25).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: item.isDir ? '#60a5fa' : G.accentDim, fontSize: '0.75rem' }}>{item.isDir ? '▸' : '·'}</span>
                <span style={{ color: item.isDir ? '#93c5fd' : G.textPri }}>{item.name}</span>
                {!item.isDir && item.size ? <span style={{ color: G.textSec, fontSize: '0.72rem', marginLeft: 'auto' }}>{formatBytes(item.size)}</span> : null}
              </div>
            ))}
            {data.items.length > 25 && <div style={{ color: G.textSec, marginTop: '4px', fontSize: '0.78rem', fontStyle: 'italic' }}>+ {data.items.length - 25} more</div>}
          </div>
        ) : output ? (
          <pre style={{
            margin: 0, fontSize: '0.83rem', fontFamily: 'var(--font-mono)',
            color: isErr ? '#ff8888' : G.accent,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: expanded ? '600px' : '180px', overflowY: 'auto',
            lineHeight: 1.65, transition: 'max-height 0.3s ease'
          }}>{output}</pre>
        ) : <span style={{ fontSize: '0.82rem', color: G.textSec, fontStyle: 'italic' }}>(no output)</span>}
      </div>
    )
  }
  return null
}

// ─── Format raw model string to display label ─────────────────────────────────
function formatModelLabel(raw) {
  if (!raw) return 'MULTI-MODEL'
  const s = raw.toLowerCase()
  if (s.includes('nemotron-super') || s.includes('nemotron-ultra') || s.includes('nemotron')) return 'NEMOTRON'
  if (s.includes('deepseek-v3')) return 'DEEPSEEK-V3'
  if (s.includes('deepseek')) return 'DEEPSEEK'
  if (s.includes('gemini-2.0-flash')) return 'GEMINI-FLASH'
  if (s.includes('gemini')) return 'GEMINI'
  if (s.includes('llama-3.3')) return 'LLAMA-3.3'
  if (s.includes('llama')) return 'LLAMA-3.1'
  if (s.includes('gpt-4')) return 'GPT-4'
  if (s.includes('claude')) return 'CLAUDE'
  const parts = raw.split('/')
  return parts[parts.length - 1].toUpperCase().slice(0, 20)
}

// ─── Thinking live-stream component ──────────────────────────────────────────
function ThinkingStream({ content }) {
  const scrollRef = React.useRef(null)
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [content])
  const clean = (content || '')
    .replace(/<\/?thought>/gi, '')
    .replace(/---TASK_PLAN---[\s\S]*?---END_PLAN---/g, '')
    .trim()
  return (
    <div ref={scrollRef} style={{
      maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden',
      fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.7,
      color: G.accent, scrollbarWidth: 'thin', opacity: 0.85,
    }}>
      {clean || <span style={{ color: G.textSec, fontStyle: 'italic' }}>Initializing…</span>}
      <span style={{ display: 'inline-block', width: '8px', height: '0.9em', background: G.accent, marginLeft: '3px', verticalAlign: 'middle', animation: 'mgBlink 0.9s step-end infinite', boxShadow: `0 0 6px ${G.accent}` }} />
    </div>
  )
}

// ─── AI Bubble ────────────────────────────────────────────────────────────────
function AIBubble({ content, timestamp, isThinking, streamingContent, modelLabel }) {
  const [showThought, setShowThought] = useState(true)
  const raw = content || ''
  let display = raw, thoughtText = ''

  const thoughtMatch = display.match(/<thought>([\s\S]*?)(?:<\/thought>|$)/)
  if (thoughtMatch) { thoughtText += thoughtMatch[1].trim() + '\n\n'; display = display.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/g, '').trim() }
  const planMatch = display.match(/---TASK_PLAN---([\s\S]*?)(?:---END_PLAN---|$)/)
  if (planMatch) { thoughtText += 'AGENT PLAN:\n' + planMatch[1].trim() + '\n\n'; display = display.replace(/---TASK_PLAN---[\s\S]*?(?:---END_PLAN---|$)/g, '').trim() }
  const toolMatch = display.match(/<tool_call>([\s\S]*?)(?:<\/tool_call>|$)/)
  if (toolMatch) {
    let tc = toolMatch[1].trim()
    try { const p = JSON.parse(tc); thoughtText += `CALLING:\n${JSON.stringify(p, null, 2)}\n\n` } catch { thoughtText += `PREPARING:\n${tc}\n\n` }
    display = display.replace(/<tool_call>[\s\S]*?(?:<\/tool_call>|$)/g, '').trim()
  }
  // Strip raw <tool_result> XML that sometimes leaks into display
  display = display.replace(/<tool_result>[\s\S]*?<\/tool_result>/g, '').trim()
  // Strip any stray XML manifest blocks
  display = display.replace(/<\?xml[\s\S]*?<\/manifest>/gi, '[XML stripped]').trim()

  // Extract ---SUMMARY--- block for special card rendering
  let summaryText = ''
  const summaryMatch = display.match(/---SUMMARY---([\s\S]*?)---END_SUMMARY---/)
  if (summaryMatch) {
    summaryText = summaryMatch[1].trim()
    display = display.replace(/---SUMMARY---[\s\S]*?---END_SUMMARY---/g, '').trim()
  }

  thoughtText = thoughtText.trim()
  const label = modelLabel || 'AI'
  const avatarChar = label.charAt(0)

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '5px 0', animation: 'mgFadeUp 0.25s ease-out' }}>
      {/* Avatar — first letter of model name */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        background: `linear-gradient(135deg, #004422, #006633)`,
        border: `1px solid ${G.accentDim}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 900, color: G.accent,
        boxShadow: `0 0 12px rgba(0,255,136,0.2)`, marginTop: '2px',
        letterSpacing: '-0.02em'
      }}>{avatarChar}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Label — dynamic model name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 900, color: G.accent, letterSpacing: '0.14em' }}>{label}</span>
          <span style={{ fontSize: '0.68rem', color: G.textSec }}>{timeStr(timestamp)}</span>
        </div>

        {/* Bubble */}
        <div style={{
          background: G.bg2,
          border: `1px solid ${G.border}`,
          borderLeft: `3px solid ${isThinking ? G.accentDim : G.accent}`,
          borderRadius: '2px 12px 12px 12px',
          padding: '14px 18px',
          fontSize: '0.92rem', color: G.textPri, lineHeight: 1.75,
          boxShadow: isThinking ? `inset 0 0 30px rgba(0,255,136,0.03)` : 'none',
        }}>
          {isThinking ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Pulsing header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: G.accent, boxShadow: `0 0 6px ${G.accent}`, animation: `mgPulse 1s ${d}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.16em', color: G.accent, textTransform: 'uppercase' }}>Thinking</span>
              </div>
              {/* Scrolling stream */}
              <div style={{
                background: '#020804', borderRadius: '8px',
                border: `1px solid ${G.border}`,
                padding: '12px 14px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '28px',
                  background: `linear-gradient(to bottom, #020804, transparent)`,
                  zIndex: 1, pointerEvents: 'none'
                }} />
                <ThinkingStream content={streamingContent} />
              </div>
            </div>
          ) : (
            <>
              {thoughtText && (
                <div style={{ marginBottom: '12px', background: '#020804', border: `1px solid ${G.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div onClick={() => setShowThought(!showThought)} style={{
                    padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    background: G.accentBg, borderBottom: showThought ? `1px solid ${G.border}` : 'none',
                    transition: 'background 0.15s'
                  }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(0,255,136,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = G.accentBg}
                  >
                    <span style={{ fontSize: '0.72rem', color: G.accentDim, width: '10px' }}>{showThought ? '▾' : '▸'}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: G.accent, letterSpacing: '0.12em' }}>🧠 AGENT REASONING</span>
                  </div>
                  {showThought && (
                    <div style={{ padding: '12px 16px', color: G.accentDim, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: '#010603' }}>
                      {thoughtText}
                    </div>
                  )}
                </div>
              )}
              {display ? <Prose text={display} /> : <span style={{ color: G.textSec, fontStyle: 'italic', fontSize: '0.88rem' }}>Executing tools autonomously…</span>}
              {summaryText && <SummaryCard raw={summaryText} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── User Bubble ──────────────────────────────────────────────────────────────
function UserBubble({ content, timestamp }) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexDirection: 'row-reverse', padding: '5px 0', animation: 'mgFadeUp 0.2s ease-out' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', marginTop: '2px'
      }}>👤</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.68rem', color: G.textSec }}>{timeStr(timestamp)}</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>YOU</span>
        </div>
        <div style={{
          background: '#111411', border: '1px solid rgba(255,255,255,0.08)',
          borderRight: `3px solid rgba(255,255,255,0.15)`,
          borderRadius: '12px 2px 12px 12px',
          padding: '12px 16px', fontSize: '0.92rem', color: '#f0f0f0',
          lineHeight: 1.65, maxWidth: '88%', wordBreak: 'break-word'
        }}>{content}</div>
      </div>
    </div>
  )
}

// ─── Task Panel ───────────────────────────────────────────────────────────────
function TaskPanel({ tasks, onToggle }) {
  if (!tasks.length) return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: G.textSec, fontSize: '0.85rem' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '12px', opacity: 0.4 }}>📋</div>
      Tasks appear once the agent creates a plan.
    </div>
  )
  const done = tasks.filter(t => t.done).length
  const pct = Math.round((done / tasks.length) * 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${G.border}`, background: G.bg2, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: G.textSec, letterSpacing: '0.14em' }}>PROGRESS</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: G.accent }}>{done}/{tasks.length}</span>
        </div>
        <div style={{ height: '3px', background: G.textMut, borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: G.accent, borderRadius: '2px', transition: 'width 0.5s ease', boxShadow: `0 0 8px ${G.accent}` }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {tasks.map((task, i) => (
          <div key={task.id} onClick={() => onToggle(i)} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
            marginBottom: '4px', transition: 'all 0.15s',
            background: task.done ? G.accentBg : 'transparent',
            border: `1px solid ${task.done ? G.border : 'transparent'}`,
          }}
            onMouseOver={e => { if (!task.done) e.currentTarget.style.background = G.bg3 }}
            onMouseOut={e => { e.currentTarget.style.background = task.done ? G.accentBg : 'transparent' }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '3px',
              background: task.done ? G.accent : 'transparent',
              border: `2px solid ${task.done ? G.accent : G.textMut}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', boxShadow: task.done ? `0 0 8px ${G.accentGlow}` : 'none'
            }}>
              {task.done && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{
              fontSize: '0.85rem', lineHeight: 1.5, color: task.done ? G.accentDim : G.textPri,
              textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1,
            }}>{task.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Memory Panel ─────────────────────────────────────────────────────────────
function MemoryPanel({ memories, onAdd, onDelete, onClear }) {
  const [input, setInput] = useState('')
  const typeColor = {
    finding: G.accent, credential: '#fbbf24', error: G.red, note: '#60a5fa',
    ip_address: G.accentDim, open_port: '#06b6d4', cve: '#f97316', flag_captured: G.accent,
    server_version: '#a78bfa', aws_key: '#fbbf24', jwt_token: '#ec4899', db_connection: '#14b8a6',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${G.border}`, background: G.bg2, display: 'flex', gap: '8px', flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { onAdd(input.trim()); setInput('') } }}
          placeholder="Add memory… (Enter)"
          style={{
            flex: 1, background: G.bg3, border: `1px solid ${G.border}`,
            borderRadius: '7px', padding: '7px 12px', color: G.textPri, fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s', fontFamily: 'var(--font-sans)'
          }}
          onFocus={e => e.target.style.borderColor = G.accent}
          onBlur={e => e.target.style.borderColor = G.border}
        />
        {memories.length > 0 && (
          <button onClick={onClear} style={{ background: G.redDim, border: `1px solid ${G.redBorder}`, borderRadius: '7px', color: G.red, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 900, padding: '7px 10px', letterSpacing: '0.06em', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,68,68,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = G.redDim}
          >CLEAR</button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {memories.length === 0 ? (
          <div style={{ textAlign: 'center', color: G.textSec, fontSize: '0.82rem', padding: '40px 20px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px', opacity: 0.4 }}>🧠</div>
            No memories yet. Agent auto-saves findings here.
          </div>
        ) : memories.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '9px 12px', borderRadius: '8px',
            background: G.bg2, border: `1px solid ${G.border}`,
            transition: 'border-color 0.15s',
          }}
            onMouseOver={e => e.currentTarget.style.borderColor = G.borderHov}
            onMouseOut={e => e.currentTarget.style.borderColor = G.border}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.12em', color: typeColor[m.type] || G.accentDim, display: 'block', marginBottom: '3px', textTransform: 'uppercase' }}>{m.type}</span>
              <span style={{ fontSize: '0.82rem', color: G.textPri, lineHeight: 1.5, wordBreak: 'break-word' }}>{m.content}</span>
            </div>
            <button onClick={() => onDelete(i)} style={{ background: 'transparent', border: 'none', color: G.textSec, cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0 4px', transition: 'color 0.15s' }}
              onMouseOver={e => e.currentTarget.style.color = G.red}
              onMouseOut={e => e.currentTarget.style.color = G.textSec}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── File Tree ────────────────────────────────────────────────────────────────
function FileNode({ item, depth, onOpen, activeFile }) {
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState([])
  const isActive = !item.isDir && activeFile === item.path
  const SKIP = new Set(['.git', '__pycache__', 'node_modules', '.venv', 'venv', 'dist', 'build', '.next'])

  const toggle = async () => {
    if (!item.isDir) { onOpen(item); return }
    if (!open) {
      try {
        const r = await fetch(`/api/ide/filesystem?path=${encodeURIComponent(item.path)}`)
        const d = await r.json()
        setChildren((d.items || []).filter(x => !SKIP.has(x.name)))
      } catch { setChildren([]) }
    }
    setOpen(!open)
  }

  const ext = item.name.split('.').pop()?.toLowerCase()
  const extColor = { js: '#f7df1e', jsx: '#61dafb', ts: '#3178c6', tsx: '#61dafb', py: G.accentDim, json: '#cbcb41', md: '#60a5fa', css: '#a855f7', html: '#f97316', sh: G.accent, env: '#fbbf24' }[ext] || G.textSec

  return (
    <div>
      <div onClick={toggle} style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: `5px 12px 5px ${10 + depth * 14}px`,
        cursor: 'pointer', borderRadius: '6px', userSelect: 'none',
        background: isActive ? G.accentBg : 'transparent',
        color: isActive ? G.accent : item.isDir ? '#8ab4a0' : G.textPri,
        fontSize: '0.85rem', transition: 'all 0.12s', margin: '1px 4px',
        borderLeft: isActive ? `2px solid ${G.accent}` : '2px solid transparent',
      }}
        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = G.bg3 }}
        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
      >
        {item.isDir
          ? <span style={{ fontSize: '0.72rem', color: G.textSec, width: '10px' }}>{open ? '▾' : '▸'}</span>
          : <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: extColor, flexShrink: 0, marginLeft: '2px' }} />
        }
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
        {!item.isDir && item.size > 0 && <span style={{ fontSize: '0.68rem', color: G.textSec, flexShrink: 0 }}>{formatBytes(item.size)}</span>}
      </div>
      {item.isDir && open && children.map((c, i) => <FileNode key={i} item={c} depth={depth + 1} onOpen={onOpen} activeFile={activeFile} />)}
    </div>
  )
}

// ─── Terminal Input ───────────────────────────────────────────────────────────
function TerminalInput({ onRun }) {
  const [cmd, setCmd] = useState('')
  const [hist, setHist] = useState([])
  const [hIdx, setHIdx] = useState(-1)
  const run = (e) => {
    e.preventDefault()
    if (!cmd.trim()) return
    setHist(prev => [cmd.trim(), ...prev.slice(0, 49)]); setHIdx(-1)
    onRun(cmd.trim()); setCmd('')
  }
  return (
    <form onSubmit={run} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderTop: `1px solid ${G.border}`, background: G.bg, flexShrink: 0 }}>
      <span style={{ color: G.accent, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', flexShrink: 0, fontWeight: 700 }}>$</span>
      <input value={cmd} onChange={e => setCmd(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'ArrowUp') { const ni = Math.min(hIdx + 1, hist.length - 1); setHIdx(ni); setCmd(hist[ni] || '') }
          if (e.key === 'ArrowDown') { const ni = Math.max(hIdx - 1, -1); setHIdx(ni); setCmd(ni < 0 ? '' : hist[ni]) }
        }}
        placeholder="shell command…"
        style={{ flex: 1, background: 'transparent', border: 'none', color: G.textPri, fontFamily: 'var(--font-mono)', fontSize: '0.88rem', outline: 'none' }}
      />
      <button type="submit" style={{ background: G.accentBg, border: `1px solid ${G.border}`, color: G.accent, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.08em', transition: 'all 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.background = G.accentGlow; e.currentTarget.style.borderColor = G.accent }}
        onMouseOut={e => { e.currentTarget.style.background = G.accentBg; e.currentTarget.style.borderColor = G.border }}
      >RUN</button>
    </form>
  )
}

// ─── File Viewer ──────────────────────────────────────────────────────────────
function FileViewer({ file, onClose }) {
  const [content, setContent] = useState('Loading…')
  const [truncated, setTruncated] = useState(false)
  useEffect(() => {
    if (!file) return
    setContent('Loading…')
    setTruncated(false)
    fetch(`/api/ide/read-file?path=${encodeURIComponent(file.path)}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || '(empty)'); setTruncated(!!d.truncated) })
      .catch(() => setContent('Error reading file'))
  }, [file?.path])
  if (!file) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', height: '90vh', background: G.bg1, border: `1px solid ${G.border}`, borderTop: `2px solid ${G.accent}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: `0 0 80px rgba(0,255,136,0.08)` }}>
        <div style={{ padding: '14px 22px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: '14px', background: G.bg2, flexShrink: 0 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: G.textPri }}>{file.name}</span>
          <code style={{ fontSize: '0.78rem', color: G.textSec, fontFamily: 'var(--font-mono)', flex: 1 }}>{file.path}</code>
          <button onClick={onClose} style={{ background: G.redDim, border: `1px solid ${G.redBorder}`, color: G.red, width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,68,68,0.22)'}
            onMouseOut={e => e.currentTarget.style.background = G.redDim}
          >✕</button>
        </div>
        {truncated && (
          <div style={{ padding: '8px 22px', background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>⚠ FILE TRUNCATED — showing first 25,000 characters only</span>
          </div>
        )}
        <pre style={{ flex: 1, margin: 0, padding: '22px 28px', overflow: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: G.accent, lineHeight: 1.7, whiteSpace: 'pre-wrap', background: G.bg }}>{content}</pre>
      </div>
    </div>
  )
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ workspaceInput, setWorkspaceInput, onStart, onExit }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: G.bg,
      backgroundImage: `radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,255,136,0.04) 0%, transparent 60%)`,
    }}>
      <div style={{ width: '520px', animation: 'mgFadeUp 0.4s ease-out' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '48px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #001a0d, #003319)',
            border: `1px solid ${G.accentDim}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', boxShadow: `0 0 30px rgba(0,255,136,0.15)`
          }}>⚡</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: G.accent }}>Agentic IDE</h1>
            <p style={{ color: G.textSec, fontSize: '0.78rem', margin: '4px 0 0', letterSpacing: '0.12em', fontWeight: 700 }}>NEMOTRON-PRO · MULTI-MODEL ENGINE</p>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
          {[
            ['🧠', 'Memory System', 'Auto-saves findings across sessions'],
            ['📋', 'Task Planner', 'Live task tracking with progress'],
            ['⚡', 'Shell Executor', 'Runs any command autonomously'],
            ['📁', 'Live Filesystem', 'Real-time file tree and viewer'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{
              background: G.bg1, border: `1px solid ${G.border}`,
              borderRadius: '10px', padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              transition: 'border-color 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = G.borderHov}
              onMouseOut={e => e.currentTarget.style.borderColor = G.border}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: G.textPri, marginBottom: '3px' }}>{title}</div>
                <div style={{ fontSize: '0.75rem', color: G.textSec, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Workspace input */}
        <label style={{ fontSize: '0.65rem', fontWeight: 900, color: G.textSec, letterSpacing: '0.16em', display: 'block', marginBottom: '8px' }}>WORKSPACE PATH</label>
        <input
          autoFocus value={workspaceInput}
          onChange={e => setWorkspaceInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onStart()}
          placeholder="C:\Users\yesha\Desktop\testingGPT"
          style={{
            width: '100%', padding: '14px 16px', background: G.bg1,
            border: `1px solid ${G.border}`, borderRadius: '10px',
            color: G.textPri, fontSize: '0.9rem', outline: 'none',
            fontFamily: 'var(--font-mono)', transition: 'all 0.15s', boxSizing: 'border-box', marginBottom: '10px'
          }}
          onFocus={e => { e.target.style.borderColor = G.accent; e.target.style.boxShadow = `0 0 0 2px rgba(0,255,136,0.08)` }}
          onBlur={e => { e.target.style.borderColor = G.border; e.target.style.boxShadow = 'none' }}
        />

        {/* Quick paths */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {['C:\\Users\\yesha\\Desktop\\testingGPT', 'C:\\Users\\yesha\\Desktop', 'C:\\Users\\yesha'].map(p => (
            <button key={p} onClick={() => setWorkspaceInput(p)} style={{
              background: 'transparent', border: `1px solid ${G.border}`,
              borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
              fontSize: '0.75rem', color: G.textSec, fontFamily: 'var(--font-mono)', fontWeight: 700,
              transition: 'all 0.15s', letterSpacing: '0.02em'
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent }}
              onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.textSec }}
            >{p.split('\\').pop() || p}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onExit} style={{
            flex: 1, padding: '14px', background: 'transparent',
            border: `1px solid ${G.border}`, borderRadius: '10px', color: G.textSec,
            cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', transition: 'all 0.15s'
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = G.borderHov; e.currentTarget.style.color = G.textPri }}
            onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.textSec }}
          >← Return</button>
          <button onClick={onStart} style={{
            flex: 2.5, padding: '14px', background: G.accentBg,
            border: `1px solid ${G.accentDim}`, borderRadius: '10px', color: G.accent,
            cursor: 'pointer', fontWeight: 900, fontSize: '0.95rem',
            boxShadow: `0 0 20px rgba(0,255,136,0.1)`, transition: 'all 0.15s', letterSpacing: '0.04em'
          }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.12)'; e.currentTarget.style.boxShadow = `0 0 30px rgba(0,255,136,0.18)` }}
            onMouseOut={e => { e.currentTarget.style.background = G.accentBg; e.currentTarget.style.boxShadow = `0 0 20px rgba(0,255,136,0.1)` }}
          >Launch Intelligence Engine ⚡</button>
        </div>
      </div>
    </div>
  )
}

// ─── SYSTEM PROMPT (frontend copy, not sent — agent uses server-side prompt) ──
const _UNUSED_SYSTEM_PROMPT = null // System prompt is in server.py IDE_SYSTEM_PROMPT

// ─── MAIN IDE ─────────────────────────────────────────────────────────────────
export default function AgenticIDE({ onExit }) {
  const [workspace, setWorkspace] = useState('')
  const [workspaceInput, setWorkspaceInput] = useState('C:\\Users\\yesha\\Desktop\\testingGPT')
  const [sessionStarted, setSessionStarted] = useState(false)
  const [fsItems, setFsItems] = useState([])
  const [fsLoading, setFsLoading] = useState(false)
  const [activeFile, setActiveFile] = useState(null)
  const [sideTab, setSideTab] = useState('files')
  const [chatItems, setChatItems] = useState([])
  const [ideInput, setIdeInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeModel, setActiveModel] = useState('')  // raw model string
  const [activeModelLabel, setActiveModelLabel] = useState('AI')  // display name
  const [memories, setMemories] = useState([])
  const [tasks, setTasks] = useState([])
  const [termLog, setTermLog] = useState([])
  const [agentStatus, setAgentStatus] = useState('') // live breadcrumb
  const sseRef = useRef(null)
  const chatBottomRef = useRef(null)
  const termBottomRef = useRef(null)
  const inputRef = useRef(null)
  const cwdRef = useRef(workspaceInput)

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatItems])
  useEffect(() => { termBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [termLog])

  // ── SSE ──────────────────────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    sseRef.current?.close()
    const sse = new EventSource('/api/ide/events')
    sseRef.current = sse
    sse.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        if (ev.type === 'HEARTBEAT') return
        if (ev.type === 'MODEL_SELECTED') {
          const rawModel = ev.data.raw || ev.data.model || ''
          const label = ev.data.model || formatModelLabel(rawModel)
          setActiveModel(rawModel)
          setActiveModelLabel(label)
          return
        }

        if (ev.type === 'SESSION_STARTED') {
          cwdRef.current = ev.data.workspace
          setWorkspace(ev.data.workspace)
          loadFS(ev.data.workspace)
          setTermLog(prev => [...prev, { type: 'sys', text: `Session: ${ev.data.workspace}`, time: ev.timestamp }])
        }

        if (ev.type === 'USER_MESSAGE') {
          setChatItems(prev => {
            if (prev.some(i => i.type === 'user' && i.content === ev.data.content)) return prev
            return [...prev.filter(i => i.type !== 'thinking'), { type: 'user', content: ev.data.content, timestamp: ev.timestamp }]
          })
        }

        if (ev.type === 'THINKING') {
          setAgentStatus('Thinking…')
          setChatItems(prev => {
            const filtered = prev.filter(i => i.type !== 'thinking' && i.type !== 'streaming')
            return [...filtered, { type: 'thinking', timestamp: ev.timestamp }]
          })
        }

        if (ev.type === 'AI_MESSAGE_PARTIAL') {
          const cleanPartial = (ev.data.content || '')
            .replace(/<\/?thought>/gi, '')
            .replace(/---TASK_PLAN---[\s\S]*?---END_PLAN---/g, '')
            .replace(/\[using [^\]]+\]/g, '')
            .trim()
          setChatItems(prev => {
            // Find existing thinking item — update its streamingContent in-place (no full re-filter)
            const thinkIdx = prev.findIndex(i => i.type === 'thinking')
            if (thinkIdx !== -1) {
              const next = [...prev]
              next[thinkIdx] = { ...next[thinkIdx], streamingContent: cleanPartial }
              return next
            }
            // No thinking item yet — add streaming item
            const streamIdx = prev.findIndex(i => i.type === 'streaming')
            if (streamIdx !== -1) {
              const next = [...prev]
              next[streamIdx] = { ...next[streamIdx], content: cleanPartial }
              return next
            }
            return [...prev, { type: 'streaming', content: cleanPartial, timestamp: ev.timestamp }]
          })
        }

        if (ev.type === 'THOUGHT') {
          const thoughtContent = ev.data.content || ''
          setChatItems(prev => {
            const lastAI = [...prev].reverse().find(i => i.type === 'ai')
            if (lastAI) return prev.map(i => i === lastAI ? { ...i, thought: (i.thought || '') + thoughtContent + '\n\n' } : i)
            return [...prev, { type: 'ai', content: '', thought: thoughtContent, timestamp: ev.timestamp }]
          })
        }

        if (ev.type === 'AI_MESSAGE') {
          const content = ev.data.content || ''
          setAgentStatus('')
          const planMatch = content.match(/---TASK_PLAN---\s*([\s\S]*?)\s*---END_PLAN---/)
          if (planMatch) { const parsed = parseTasks(planMatch[1]); if (parsed.length) setTasks(parsed) }
          const doneMatches = [...content.matchAll(/- \[x\] (.+)/gi)]
          if (doneMatches.length && !planMatch) {
            setTasks(prev => prev.map(t => {
              const matched = doneMatches.some(m => t.text.toLowerCase().includes(m[1].toLowerCase().trim().slice(0, 40)))
              return matched ? { ...t, done: true } : t
            }))
          }
          const memMatch = content.match(/---MEMORY---\s*([\s\S]*?)\s*---END_MEMORY---/g)
          if (memMatch) {
            memMatch.forEach(block => {
              const typeM = block.match(/TYPE:\s*(\w+)/); const contentM = block.match(/CONTENT:\s*(.+)/)
              if (typeM && contentM) {
                setMemories(prev => { const nm = { type: typeM[1], content: contentM[1].trim() }; return prev.some(m => m.content === nm.content) ? prev : [...prev, nm] })
              }
            })
          }
          const displayContent = content.replace(/---TASK_PLAN---[\s\S]*?---END_PLAN---/g, '').replace(/---MEMORY---[\s\S]*?---END_MEMORY---/g, '').trim()
          setChatItems(prev => {
            const filtered = prev.filter(i => i.type !== 'thinking' && i.type !== 'streaming')
            return [...filtered, { type: 'ai', content: displayContent || content, timestamp: ev.timestamp, modelLabel: activeModelLabel }]
          })
        }

        if (ev.type === 'TOOL_START') {
          const toolName = ev.data.tool
          const detail = ev.data.command || ev.data.path || ev.data.query || ''
          setAgentStatus(`${toolName}: ${detail.slice(0, 60)}`)
          setChatItems(prev => {
            const filtered = prev.filter(i => i.type !== 'thinking')
            return [...filtered, { type: 'tool_start', data: ev.data, timestamp: ev.timestamp }]
          })
          if (ev.data.tool === 'shell') setTermLog(prev => [...prev, { type: 'cmd', text: ev.data.command, time: ev.timestamp }])
          if (['write_file', 'list_dir'].includes(ev.data.tool)) setTimeout(() => loadFS(cwdRef.current), 1200)
        }

        if (ev.type === 'TOOL_RESULT') {
          setChatItems(prev => [...prev, { type: 'tool_result', data: ev.data, timestamp: ev.timestamp }])
          if (ev.data.tool === 'shell' && ev.data.output) setTermLog(prev => [...prev, { type: 'out', text: ev.data.output.trim(), error: ev.data.returncode !== 0, time: ev.timestamp }])
          if (ev.data.tool === 'write_file') setTimeout(() => loadFS(cwdRef.current), 1500)
          if (ev.data.tool === 'replace_file_content' && ev.data.success) setTimeout(() => loadFS(cwdRef.current), 800)
        }

        if (['DONE', 'ERROR', 'STOPPED'].includes(ev.type)) {
          setChatItems(prev => prev.filter(i => i.type !== 'thinking' && i.type !== 'streaming'))
          setIsRunning(false)
          setAgentStatus('')
          if (ev.type === 'ERROR') {
            setChatItems(prev => [...prev, { type: 'ai', content: `⚠️ **Agent Error:** ${ev.data.message}\n\nCheck that the backend server is running.`, timestamp: ev.timestamp }])
          }
          setTermLog(prev => [...prev, { type: 'sys', text: ev.type === 'DONE' ? `✓ Done (${ev.data.iterations || 0} iters)` : `⚡ ${ev.type}`, time: ev.timestamp }])
        }
      } catch (err) { console.error('[IDE SSE]', err) }
    }
    sse.onerror = () => { setTimeout(connectSSE, 3000) }
  }, [])

  useEffect(() => { connectSSE(); return () => sseRef.current?.close() }, [connectSSE])

  const loadFS = async (path) => {
    if (!path) return
    setFsLoading(true)
    try {
      const SKIP = new Set(['.git', '__pycache__', 'node_modules', '.venv', 'venv', 'dist', 'build', '.next'])
      const r = await fetch(`/api/ide/filesystem?path=${encodeURIComponent(path)}`)
      const d = await r.json()
      setFsItems((d.items || []).filter(i => !SKIP.has(i.name)))
    } catch { setFsItems([]) } finally { setFsLoading(false) }
  }

  const startSession = () => {
    const ws = workspaceInput.trim() || 'C:\\Users\\yesha\\Desktop\\testingGPT'
    cwdRef.current = ws
    setWorkspace(ws)
    setSessionStarted(true)   // ← enter IDE immediately, always
    loadFS(ws)
    // Fire-and-forget server init (errors shown inside chat, not as blocking alert)
    fetch('/api/ide/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: ws }) })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .catch(err => {
        setChatItems([{ type: 'ai', content: `⚠️ **Could not reach backend server.**\n\nMake sure \`server.py\` is running:\n\`\`\`\npython server.py\n\`\`\`\nError: ${err}`, timestamp: new Date().toISOString() }])
      })
  }

  const sendPrompt = async (e, directText = null) => {
    if (e) e.preventDefault()
    const msg = (directText !== null ? directText : ideInput).trim()
    if (!msg || isRunning) return
    setIdeInput(''); setIsRunning(true); inputRef.current?.focus()
    setChatItems(prev => [...prev.filter(i => i.type !== 'thinking'), { type: 'user', content: msg, timestamp: new Date().toISOString() }])
    try {
      await fetch('/api/ide/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) })
    } catch (err) {
      setChatItems(prev => [...prev, { type: 'ai', content: `Connection failed: ${err.message}`, timestamp: new Date().toISOString() }])
      setIsRunning(false)
    }
  }

  const stopAgent = async () => { setIsRunning(false); await fetch('/api/ide/stop', { method: 'POST' }).catch(() => {}) }

  const runManualCmd = async (cmd) => {
    setTermLog(prev => [...prev, { type: 'cmd', source: 'user', text: cmd, time: new Date().toISOString() }])
    try {
      const r = await fetch('/api/ide/run-command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: cmd, cwd: cwdRef.current }) })
      const d = await r.json()
      setTermLog(prev => [...prev, { type: 'out', text: (d.output || '').trim() || '(no output)', error: d.returncode !== 0, time: new Date().toISOString() }])
      loadFS(cwdRef.current)
    } catch (err) { setTermLog(prev => [...prev, { type: 'out', text: `Error: ${err.message}`, error: true, time: new Date().toISOString() }]) }
  }

  // ── Setup Screen ─────────────────────────────────────────────────────────────
  if (!sessionStarted) {
    return <SetupScreen workspaceInput={workspaceInput} setWorkspaceInput={setWorkspaceInput} onStart={startSession} onExit={onExit} />
  }

  const tasksDone = tasks.filter(t => t.done).length
  const tasksPct = tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 0

  const sideTabData = [
    { id: 'files',    icon: '📁', label: 'FILES' },
    { id: 'tasks',    icon: '✓',  label: 'TASKS' },
    { id: 'memory',   icon: '🧠', label: 'MEM' },
    { id: 'terminal', icon: '⚡', label: 'TERM' },
  ]

  // ── Main IDE ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: G.bg, color: G.textPri, overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────────── */}
      <div style={{ width: '260px', minWidth: '220px', maxWidth: '320px', borderRight: `1px solid ${G.border}`, display: 'flex', flexDirection: 'column', background: G.bg1 }}>

        {/* Left header */}
        <div style={{ height: '48px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: G.accent, boxShadow: `0 0 8px ${G.accent}` }} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: G.textSec, letterSpacing: '0.14em', marginBottom: '1px' }}>WORKSPACE</div>
            <div style={{ fontSize: '0.78rem', color: G.textPri, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={workspace}>{workspace.split('\\').pop() || workspace}</div>
          </div>
          {tasks.length > 0 && (
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: tasksDone === tasks.length ? G.accent : G.textSec, background: G.bg3, padding: '3px 8px', borderRadius: '6px', border: `1px solid ${G.border}` }}>
              {tasksDone}/{tasks.length}
            </div>
          )}
          <button onClick={onExit} style={{ width: '26px', height: '26px', background: G.redDim, border: `1px solid ${G.redBorder}`, color: G.red, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0, transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,68,68,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = G.redDim}
          >✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
          {sideTabData.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setSideTab(id)} style={{
              flex: 1, padding: '9px 4px', background: sideTab === id ? G.accentBg : 'transparent',
              border: 'none', borderBottom: `2px solid ${sideTab === id ? G.accent : 'transparent'}`,
              color: sideTab === id ? G.accent : G.textSec,
              cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
            }}>
              <span>{icon}</span>
              <span style={{ fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.1em' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {sideTab === 'files' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
                <div style={{ padding: '4px 14px 8px', fontSize: '0.65rem', color: G.textSec, fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.12em' }}>
                  {workspace.split('\\').pop()}
                </div>
                {fsLoading ? (
                  <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ height: '14px', borderRadius: '4px', background: `rgba(0,255,136,0.06)`, animation: 'mgPulse 1.4s ease-in-out infinite', animationDelay: `${n*0.1}s`, width: `${60 + n*8}%` }} />
                    ))}
                  </div>
                ) : fsItems.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: G.textSec, fontSize: '0.82rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '10px', opacity: 0.3 }}>📂</div>
                    <div>Folder is empty</div>
                    <div style={{ fontSize: '0.72rem', marginTop: '6px', opacity: 0.6 }}>or path not found</div>
                  </div>
                ) : fsItems.map((item, i) => <FileNode key={i} item={item} depth={0} onOpen={setActiveFile} activeFile={activeFile?.path} />)}
              </div>
              <div style={{ padding: '8px 12px', borderTop: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', color: G.textSec, fontFamily: 'var(--font-mono)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={workspace}>{workspace}</span>
                <button onClick={() => loadFS(workspace)} style={{ background: 'transparent', border: `1px solid ${G.border}`, color: G.textSec, cursor: 'pointer', fontSize: '0.9rem', width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.textSec }}
                >⟳</button>
              </div>
            </>
          )}
          {sideTab === 'tasks' && <TaskPanel tasks={tasks} onToggle={i => setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))} />}
          {sideTab === 'memory' && (
            <MemoryPanel
              memories={memories}
              onAdd={content => {
                const m = { type: 'note', content }
                setMemories(prev => [...prev, m])
                fetch('/api/ide/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) }).catch(() => {})
              }}
              onDelete={i => {
                // Fix: single DELETE clears all, then POST only remaining — no flood
                setMemories(prev => {
                  const updated = prev.filter((_, idx) => idx !== i)
                  fetch('/api/ide/memories', { method: 'DELETE' })
                    .then(() => {
                      // Re-add remaining memories in a single batch using Promise.all
                      return Promise.all(updated.map(m =>
                        fetch('/api/ide/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) })
                      ))
                    }).catch(() => {})
                  return updated
                })
              }}
              onClear={() => { setMemories([]); fetch('/api/ide/memories', { method: 'DELETE' }).catch(() => {}) }}
            />
          )}
          {sideTab === 'terminal' && (
            <>
              <div style={{ flex: 1, minHeight: 0, maxHeight: '300px', overflowY: 'auto', padding: '14px 14px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <div style={{ color: G.accentDim, marginBottom: '10px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.14em' }}>TERMINAL · LIVE STREAM</div>
                {termLog.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: G.textSec }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '8px', opacity: 0.3 }}>⚡</div>
                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>No commands yet.<br/>Type below or let the agent run.</div>
                  </div>
                ) : termLog.map((entry, i) => (
                  <div key={i} style={{ marginBottom: '5px' }}>
                    {entry.type === 'cmd' && <div style={{ color: G.accent }}><span style={{ color: G.textSec, fontSize: '0.72rem' }}>[{entry.source === 'user' ? 'YOU' : 'AI'}] </span>$ {entry.text}</div>}
                    {entry.type === 'out' && <pre style={{ margin: 0, color: entry.error ? '#ff8888' : G.accent, whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '4px 0 4px 12px', borderLeft: `2px solid ${entry.error ? 'rgba(255,68,68,0.4)' : 'rgba(0,255,136,0.25)'}`, marginBottom: '8px', opacity: 0.85 }}>{entry.text}</pre>}
                    {entry.type === 'sys' && <div style={{ color: G.textSec, fontStyle: 'italic', fontSize: '0.75rem', marginBottom: '4px' }}>// {entry.text}</div>}
                  </div>
                ))}
                <div ref={termBottomRef} />
              </div>
              <TerminalInput onRun={runManualCmd} />
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: G.bg }}>

        {/* Top bar — 48px, ultra thin */}
        <div style={{ height: '48px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: '14px', background: G.bg1, flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #001a0d, #003319)', border: `1px solid ${G.accentDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: G.accent, boxShadow: `0 0 10px rgba(0,255,136,0.2)` }}>{activeModelLabel.charAt(0) || 'A'}</div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: G.textPri, letterSpacing: '-0.01em' }}>AGENTIC IDE</div>
              <div style={{ fontSize: '0.58rem', color: G.textSec, letterSpacing: '0.1em', fontWeight: 700 }}>
                {activeModelLabel} · AUTONOMOUS
              </div>
            </div>
          </div>

          {/* Status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: isRunning ? G.accentBg : G.bg2, border: `1px solid ${isRunning ? G.border : G.textMut}`, borderRadius: '20px', padding: '4px 12px', transition: 'all 0.3s' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? G.accent : G.textSec, boxShadow: isRunning ? `0 0 8px ${G.accent}` : 'none', animation: isRunning ? 'mgPulse 1.5s infinite' : 'none', transition: 'all 0.3s' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isRunning ? G.accent : G.textSec, letterSpacing: '0.12em' }}>{isRunning ? 'RUNNING' : 'READY'}</span>
          </div>

          {/* Live status breadcrumb */}
          {agentStatus && (
            <div style={{ fontSize: '0.72rem', color: G.accentDim, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, opacity: 0.8 }}>
              › {agentStatus}
            </div>
          )}

          {/* Task progress */}
          {tasks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: G.accentBg, border: `1px solid ${G.border}`, borderRadius: '20px', padding: '4px 12px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: G.accentDim, letterSpacing: '0.1em' }}>TASKS {tasksDone}/{tasks.length}</span>
              <div style={{ width: '48px', height: '3px', background: G.textMut, borderRadius: '2px' }}>
                <div style={{ width: `${tasksPct}%`, height: '100%', background: G.accent, borderRadius: '2px', transition: 'width 0.4s ease', boxShadow: `0 0 4px ${G.accent}` }} />
              </div>
            </div>
          )}

          {/* Memory count */}
          {memories.length > 0 && (
            <div onClick={() => setSideTab('memory')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: G.accentBg, border: `1px solid ${G.border}`, borderRadius: '20px', padding: '4px 12px', transition: 'all 0.15s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = G.accent}
              onMouseOut={e => e.currentTarget.style.borderColor = G.border}
            >
              <span style={{ fontSize: '0.75rem' }}>🧠</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: G.accentDim, letterSpacing: '0.1em' }}>{memories.length}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isRunning && (
              <button onClick={stopAgent} style={{ background: G.redDim, border: `1px solid ${G.redBorder}`, color: G.red, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '7px', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,68,68,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = G.redDim}
              >
                <div style={{ width: '8px', height: '8px', background: G.red, borderRadius: '2px' }} /> STOP
              </button>
            )}
            <button onClick={() => { setChatItems([]); setTasks([]); setTermLog([]) }} style={{ background: 'transparent', border: `1px solid ${G.border}`, color: G.textSec, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G.borderHov; e.currentTarget.style.color = G.textPri }}
              onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.textSec }}
            >CLEAR</button>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px clamp(12px, 3vw, 32px) 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chatItems.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', padding: '40px', minHeight: 0 }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #001a0d, #003319)', border: `1px solid ${G.accentDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: `0 0 40px rgba(0,255,136,0.12)` }}>⚡</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: G.accent, marginBottom: '10px', letterSpacing: '-0.02em' }}>Intelligence Engine Ready</div>
                <div style={{ fontSize: '0.9rem', color: G.textSec, lineHeight: 1.7, maxWidth: '500px' }}>
                  Describe your task. The agent will plan, execute shell commands, read and write files, and complete the work fully autonomously.
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '600px' }}>
                {[
                  { icon: '🔍', text: 'Scan all Python files for security vulnerabilities' },
                  { icon: '🚀', text: 'Run all tests, fix failures, show final results' },
                  { icon: '📊', text: 'Give me a full overview of this project structure' },
                  { icon: '🛡️', text: 'Check all network ports and analyze running services' },
                ].map((s, i) => (
                  <button key={i} onClick={() => setIdeInput(s.text)} style={{
                    background: G.bg1, border: `1px solid ${G.border}`,
                    borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', gap: '10px', alignItems: 'flex-start',
                    transition: 'all 0.15s', color: 'inherit'
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = G.accentBg; e.currentTarget.style.borderColor = G.border }}
                    onMouseOut={e => { e.currentTarget.style.background = G.bg1; e.currentTarget.style.borderColor = G.border }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                    <span style={{ fontSize: '0.82rem', color: G.textPri, fontWeight: 500, lineHeight: 1.5 }}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatItems.map((item, i) => {
              if (item.type === 'user') return <UserBubble key={i} content={item.content} timestamp={item.timestamp} />
              if (item.type === 'ai') return <AIBubble key={i} content={item.content} timestamp={item.timestamp} modelLabel={item.modelLabel || activeModelLabel} />
              if (item.type === 'thinking') return <AIBubble key={i} isThinking streamingContent={item.streamingContent} timestamp={item.timestamp} modelLabel={activeModelLabel} />
              if (item.type === 'streaming') return <AIBubble key={i} content={item.content} timestamp={item.timestamp} modelLabel={activeModelLabel} />
              if (item.type === 'tool_start' || item.type === 'tool_result')
                return <ToolBlock key={i} ev={{ type: item.type === 'tool_start' ? 'TOOL_START' : 'TOOL_RESULT', data: item.data, timestamp: item.timestamp }} />
              return null
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input area */}
        <div style={{ borderTop: `1px solid ${G.border}`, padding: '16px clamp(12px, 3vw, 32px) 20px', background: G.bg1, flexShrink: 0 }}>
          {/* Quick actions — only shown when last AI message requests approval */}
          {!isRunning && chatItems.length > 0 && (() => {
            const lastAI = [...chatItems].reverse().find(i => i.type === 'ai')
            const needsApproval = lastAI && /\b(approve|proceed|confirm|continue|yes or no|shall i|want me to|should i|do you want)\b/i.test(lastAI.content || '')
            if (!needsApproval) return null
            return (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {['Approve & Proceed', 'Looks good, do it', 'Yes', 'No, stop'].map(action => (
                  <button key={action} onClick={(e) => sendPrompt(e, action)} style={{
                    background: 'transparent',
                    border: `1px solid ${action.includes('stop') ? G.redBorder : G.border}`,
                    color: action.includes('stop') ? G.red : G.textSec,
                    padding: '5px 14px', borderRadius: '20px',
                    fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.15s', letterSpacing: '0.04em'
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = action.includes('stop') ? G.red : G.accent; e.currentTarget.style.color = action.includes('stop') ? G.red : G.accent }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = action.includes('stop') ? G.redBorder : G.border; e.currentTarget.style.color = action.includes('stop') ? G.red : G.textSec }}
                  >{action}</button>
                ))}
              </div>
            )
          })()}

          {/* Input box */}
          <form onSubmit={(e) => sendPrompt(e)}>
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-end',
              background: G.bg2, border: `1px solid ${isRunning ? G.accentDim : G.border}`,
              borderRadius: '14px', padding: '8px 8px 8px 18px',
              boxShadow: isRunning ? `0 0 0 1px rgba(0,255,136,0.08), 0 0 20px rgba(0,255,136,0.05)` : 'none',
              transition: 'all 0.3s'
            }}>
              <textarea
                ref={inputRef} value={ideInput}
                onChange={e => setIdeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPrompt(e) } }}
                disabled={isRunning}
                placeholder={isRunning ? 'Agent is executing autonomously…' : 'Describe a task — the agent will plan and execute it…'}
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: G.textPri, fontSize: '0.92rem', fontFamily: 'var(--font-sans)',
                  resize: 'none', minHeight: '40px', maxHeight: '200px',
                  lineHeight: 1.6, padding: '8px 0', opacity: isRunning ? 0.4 : 1
                }}
                onInput={e => {
                  // Batch in rAF to avoid layout thrash on every keypress
                  requestAnimationFrame(() => {
                    e.target.style.height = '40px'
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                  })
                }}
              />
              <button type="submit" disabled={!ideInput.trim() || isRunning} style={{
                width: '40px', height: '40px', borderRadius: '10px', border: 'none', flexShrink: 0,
                background: (!ideInput.trim() || isRunning) ? G.bg3 : G.accentBg,
                color: (!ideInput.trim() || isRunning) ? G.textSec : G.accent,
                cursor: (!ideInput.trim() || isRunning) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${(!ideInput.trim() || isRunning) ? G.textMut : G.accentDim}`,
                boxShadow: (!ideInput.trim() || isRunning) ? 'none' : `0 0 12px rgba(0,255,136,0.15)`,
                transition: 'all 0.2s'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', padding: '0 4px' }}>
              <span style={{ fontSize: '0.65rem', color: G.textSec, fontWeight: 600 }}>↵ Send · Shift+↵ Newline</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: G.textSec, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: G.accentDim }} />
                {activeModelLabel} · MULTI-MODEL
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* File viewer overlay */}
      {activeFile && <FileViewer file={activeFile} onClose={() => setActiveFile(null)} />}

      {/* Global CSS keyframes */}
      <style>{`
        @keyframes mgFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mgPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes mgBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,255,136,0.3); }
        .thinking-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
