import React, { useState, useEffect, useRef, useMemo } from 'react'

function App() {
  const [events, setEvents] = useState([])
  const [findings, setFindings] = useState([])
  const [target, setTarget] = useState('')
  const [instruction, setInstruction] = useState('')
  const [commandInput, setCommandInput] = useState('')
  const [model, setModel] = useState('groq/llama-3.1-8b-instant')
  const [backend, setBackend] = useState('litellm')
  const [agentState, setAgentState] = useState('idle')
  const [scanStarted, setScanStarted] = useState(false)
  const [toasts, setToasts] = useState([])
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [hasUserMessaged, setHasUserMessaged] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [cooldownTimer, setCooldownTimer] = useState(0)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [isInputRequired, setIsInputRequired] = useState(false)
  const [interactiveQuestion, setInteractiveQuestion] = useState('')
  const [lastToolFailed, setLastToolFailed] = useState(false)
  const [lastFailingTool, setLastFailingTool] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedFinding, setSelectedFinding] = useState(null)
  const [showCodeAudit, setShowCodeAudit] = useState(false)
  const [auditFolder, setAuditFolder] = useState('')
  const [auditUrl, setAuditUrl] = useState('')
  const [auditMode, setAuditMode] = useState('folder') // 'folder' or 'url'
  const [auditRunning, setAuditRunning] = useState(false)
  const [auditResults, setAuditResults] = useState([])
  const [auditSummary, setAuditSummary] = useState(null)
  const [auditProgress, setAuditProgress] = useState('')
  const [auditProgressStats, setAuditProgressStats] = useState(null)
  const [useAuditFindings, setUseAuditFindings] = useState(false)
  const [showBackendIntel, setShowBackendIntel] = useState(false)
  const [backendIntelUrl, setBackendIntelUrl] = useState('')
  const [backendIntelModel, setBackendIntelModel] = useState('nvidia_nim/nvidia/nemotron-3-super-120b-a12b')
  const [isIntelRunning, setIsIntelRunning] = useState(false)
  const [intelEvents, setIntelEvents] = useState([])
  const [intelFindings, setIntelFindings] = useState([])
  const [missionStatus, setMissionStatus] = useState('IDLE')
  const logRef = useRef(null)
  const chatRef = useRef(null)
  const addMenuRef = useRef(null)
  const handleEventRef = useRef(null)
  const [currentToolProgress, setCurrentToolProgress] = useState(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadTypeModal, setShowUploadTypeModal] = useState(false);
  const [lastReportText, setLastReportText] = useState("");
  const [isAttackMode, setIsAttackMode] = useState(false);
  const [showAPKAnalysis, setShowAPKAnalysis] = useState(false);
  const [apkResults, setApkResults] = useState(null);
  const [apkLoading, setApkLoading] = useState(false);
  const apkInputRef = useRef(null);

  const chatEvents = useMemo(() => events.filter(ev => ev.category === 'chat'), [events]);
  const logEvents = useMemo(() => events.filter(ev => ev.category === 'tactical'), [events]);
  
  // Split view only if there are actual conversation messages (user or AI responses to user)
  const isInteracting = chatEvents.length > 0;
  const isSplit = isInteracting;

  // Notification Trigger
  useEffect(() => {
    if (findings.length > 0) {
      const latest = findings[findings.length - 1];
      const id = Date.now();
      setToasts(prev => [...prev, { id, title: 'VULNERABILITY DETECTED', detail: latest.type, severity: latest.severity }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    }
  }, [findings.length]);

  const AVAILABLE_MODELS = [
    { id: 'groq/llama-3.1-8b-instant', name: 'Groq: Llama 3.1 8B' },
    { id: 'nvidia_nim/meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B (NVIDIA)' },
    { id: 'nvidia_nim/nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron-3 120B (NVIDIA)' },
  ];

  const [cost, setCost] = useState(0)
  const [uptime, setUptime] = useState('00:00:00')
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logEvents])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chatEvents])

  useEffect(() => {
    fetch('/api/initial-settings')
      .then(res => res.json())
      .then(data => {
        if (data.target) setTarget(data.target)
        if (data.instruction) setInstruction(data.instruction)
        if (data.model) setModel(data.model)
        if (data.backend) setBackend(data.backend)
      })
      .catch(err => console.error('Failed to load initial settings:', err))

    let sse;
    const connectSSE = () => {
      sse = new EventSource('/api/events')
      sse.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data)
          handleEventRef.current?.(event)
        } catch (err) {
          console.error('Failed to parse SSE event:', err)
        }
      }
      sse.onerror = (e) => {
        console.error('SSE connection error, reconnecting in 3s...', e)
        sse.close()
        setTimeout(connectSSE, 3000)
      }
    }
    connectSSE()
    return () => sse?.close()
  }, [])

  // Safety: auto-clear "Mission Processing" if stuck for more than 45s
  useEffect(() => {
    if (!isThinking) return
    const timer = setTimeout(() => {
      console.warn('Thinking state auto-cleared after 45s timeout')
      setIsThinking(false)
    }, 45000)
    return () => clearTimeout(timer)
  }, [isThinking])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (scanStarted && !startTimeRef.current) {
      startTimeRef.current = Date.now()
    }
    const timer = setInterval(() => {
      if (startTimeRef.current && agentState !== 'idle' && agentState !== 'stopped') {
        const diff = Date.now() - startTimeRef.current
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
        setUptime(`${h}:${m}:${s}`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [scanStarted, agentState])

  const handleAudit = async (folderToAudit) => {
    const targetFolder = folderToAudit || auditFolder
    if (!targetFolder.trim()) return
    
    setAuditRunning(true)
    setAuditResults([])
    setAuditSummary(null)
    setAuditProgressStats(null)
    setAuditProgress('Initializing background audit...')
    
    try {
      const res = await fetch('/api/code-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: targetFolder, model })
      })
      const data = await res.json()
      
      if (!data.success) {
        setAuditProgress(`❌ ${data.error}`)
        setAuditRunning(false)
        return
      }
      setAuditProgress(`Scanning ${data.files_count} files...`)
      
      const poll = setInterval(async () => {
        try {
          const r = await fetch('/api/code-audit/results')
          const d = await r.json()
          setAuditResults(d.findings || [])
          setAuditSummary(d.summary)
          if (d.progress) setAuditProgressStats(d.progress)
          
          if (!d.running) {
            clearInterval(poll)
            setAuditRunning(false)
            setAuditProgress('✅ Audit complete!')
          } else {
            const issues = d.findings?.filter(f => f.type === 'ISSUE') || []
            setAuditProgress(`Scanning... ${issues.length} issue${issues.length !== 1 ? 's' : ''} found`)
          }
        } catch(err) { /* ignore */ }
      }, 3000)
    } catch(err) {
      setAuditProgress(`❌ ${err.message}`)
      setAuditRunning(false)
    }
  }

  const posRef = useRef({})
  const [graphView, setGraphView] = useState({ x: 400, y: 300, zoom: 0.8 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const AttackGraphModal = () => {
    if (!showGraph) return null

    const nodes = graphData.nodes || []
    const links = graphData.links || []

    // Ensure all nodes have stable positions
    nodes.forEach(node => {
      if (!posRef.current[node.id]) {
        if (node.type === 'target') {
          posRef.current[node.id] = { x: 0, y: 0 }
        } else {
          const count = Object.keys(posRef.current).filter(k => k !== 'target').length
          const angle = (count * 137.5) * (Math.PI / 180) // golden angle for better distribution
          const radius = 180 + (count % 4) * 45
          posRef.current[node.id] = { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }
        }
      }
    })

    const handleMouseDown = (e) => {
      if (e.target.tagName !== 'svg' && e.target.tagName !== 'rect') return
      setIsDragging(true)
      setDragStart({ x: e.clientX - graphView.x, y: e.clientY - graphView.y })
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      setGraphView(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }))
    }

    const handleWheel = (e) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setGraphView(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(5, prev.zoom * delta)) }))
    }

    return (
      <div className="modal-overlay" style={{ zIndex: 10000 }}>
        <div className="attack-graph-modal" style={{ width: '92vw', height: '88vh', maxWidth: '1600px', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '15px 25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 15px #6366f1' }} className="animate-pulse" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>OPERATIONS MAP</h2>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>REAL-TIME ATTACK TOPOLOGY</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                DRAG TO PAN • SCROLL TO ZOOM
              </div>
              <button onClick={() => setShowGraph(false)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
          
          <div className="graph-container" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#020617' }} 
               onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onWheel={handleWheel}>
            
            <svg width="100%" height="100%" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(99, 102, 241, 0.4)" />
                </marker>
              </defs>

              <g transform={`translate(${graphView.x}, ${graphView.y}) scale(${graphView.zoom})`}>
                {/* Background Grid */}
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                </pattern>
                <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

                {/* Links */}
                {links.map((link, i) => {
                  const sPos = posRef.current[link.source]
                  const tPos = posRef.current[link.target]
                  if (!sPos || !tPos) return null
                  
                  return (
                    <g key={`link-${i}`}>
                      <line 
                        x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y} 
                        stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" 
                        markerEnd="url(#arrowhead)"
                      />
                      <line 
                        x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y} 
                        stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" 
                        strokeDasharray="5, 15"
                        style={{ animation: 'dashMove 2s linear infinite' }}
                      />
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const pos = posRef.current[node.id] || { x: 0, y: 0 }
                  
                  let color = "#6366f1"
                  let icon = "🌐"
                  if (node.type === 'vulnerability') { color = "#f43f5e"; icon = "⚠️" }
                  if (node.type === 'exploit') { color = "#10b981"; icon = "🚀" }
                  if (node.type === 'process') { color = "#a855f7"; icon = "⚙️" }
                  if (node.type === 'target') { color = "#ffffff"; icon = "🎯" }

                  return (
                    <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      <circle r="22" fill="#0f172a" stroke={color} strokeWidth="2" filter="url(#glow)" />
                      <circle r="28" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" className="animate-pulse" />
                      <text dy=".3em" textAnchor="middle" fontSize="14">{icon}</text>
                      
                      <g transform="translate(0, 42)">
                        <rect x="-60" width="120" height="20" rx="4" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.1)" />
                        <text textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" dy="13" style={{ pointerEvents: 'none' }}>
                          {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                        </text>
                      </g>
                    </g>
                  )
                })}
              </g>
            </svg>
            
            <div style={{
              position: 'absolute', top: '20px', right: '20px', width: '280px', bottom: '20px',
              background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
               <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                 <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em', margin: 0 }}>DISCOVERED ENTITIES</h3>
               </div>
               <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                 {nodes.length === 0 ? (
                   <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                     No entities discovered yet...
                   </div>
                 ) : (
                   nodes.map(n => (
                     <div key={n.id} style={{
                       display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                       marginBottom: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                       border: '1px solid rgba(255,255,255,0.03)'
                     }}>
                       <div style={{ 
                         width: '6px', height: '6px', borderRadius: '50%', 
                         background: n.type === 'vulnerability' ? '#f43f5e' : n.type === 'exploit' ? '#10b981' : n.type === 'target' ? '#fff' : '#6366f1'
                       }} />
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>{n.label}</div>
                         <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{n.type}</div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>

            {/* Controls Overlay */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setGraphView(prev => ({ ...prev, zoom: prev.zoom * 1.2 }))}
                style={{ width: '36px', height: '36px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>+</button>
              <button 
                onClick={() => setGraphView(prev => ({ ...prev, zoom: prev.zoom * 0.8 }))}
                style={{ width: '36px', height: '36px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>-</button>
              <button 
                onClick={() => setGraphView({ x: 400, y: 300, zoom: 0.8 })}
                style={{ padding: '0 12px', height: '36px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>RESET</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const APKAnalysisModal = () => {
    if (!showAPKAnalysis || !apkResults) return null

    return (
      <div className="modal-overlay" style={{ zIndex: 10000 }}>
        <div className="attack-graph-modal" style={{ width: '90vw', height: '85vh', maxWidth: '1200px', display: 'flex', flexDirection: 'column', background: '#020617' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="pulse-dot" style={{ background: '#22d3ee', boxShadow: '0 0 15px #22d3ee' }} theme="cyan" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>DEEP REVERSING AUDIT</h2>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>PACKAGE: {apkResults.package_name || 'UNKNOWN'}</span>
              </div>
            </div>
            <button onClick={() => setShowAPKAnalysis(false)} className="bubble-icon-btn" style={{ padding: '8px', color: '#f87171' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Security Findings</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f43f5e' }}>{apkResults.findings || 0}</div>
              </div>
              <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>Detected Framework</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22d3ee' }}>{apkResults.result.match(/DETECTED FRAMEWORK: (.*)/)?.[1] || 'Native'}</div>
              </div>
            </div>

            {/* Analysis Report */}
            <div style={{ flex: 1, background: '#000', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#111', padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>REPORTS_ENGINE_v2.5.out</span>
                <span style={{ fontSize: '0.6rem', color: '#10b981' }}>COMPLETED</span>
              </div>
              <pre style={{ margin: 0, padding: '20px', fontSize: '0.85rem', color: '#a5b4fc', fontFamily: 'var(--font-mono)', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {apkResults.result}
              </pre>
            </div>

            {/* Frida / ADB Snippets */}
            {apkResults.dynamic_prep && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff' }}>FRIDA: SSL PINNING BYPASS</div>
                  <div style={{ position: 'relative' }}>
                    <pre style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)', fontSize: '0.75rem', color: '#94a3b8', margin: 0, maxHeight: '200px', overflow: 'auto' }}>
                      {apkResults.dynamic_prep.frida_ssl_bypass}
                    </pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(apkResults.dynamic_prep.frida_ssl_bypass);
                        // setToast would go here if needed, but we used toasts state in component
                      }}
                      className="copy-btn-mini"
                      style={{ position: 'absolute', top: '10px', right: '10px', background: '#334155', border: 'none', color: '#fff', fontSize: '0.6rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >COPY</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff' }}>ADB: STORAGE EXTRACTION</div>
                  <div style={{ position: 'relative' }}>
                    <pre style={{ background: 'rgba(234, 179, 8, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.1)', fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                      {apkResults.dynamic_prep.adb_command}
                    </pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(apkResults.dynamic_prep.adb_command);
                      }}
                      className="copy-btn-mini"
                      style={{ position: 'absolute', top: '10px', right: '10px', background: '#334155', border: 'none', color: '#fff', fontSize: '0.6rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >COPY</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 30px', display: 'flex', justifyContent: 'flex-end' }}>
             <button onClick={() => setShowAPKAnalysis(false)} className="btn-secondary" style={{ padding: '10px 25px', fontSize: '0.8rem', fontWeight: 800 }}>CLOSE AUDIT</button>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    let interval;
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  const handleEvent = (event) => {
    const { type, data, timestamp, metadata } = event
    if (metadata?.cost) setCost(metadata.cost)
    
    // Check for mission start in data if not already running
    if (type === 'STATE_CHANGED' && isIntelRunning && data.state === 'running') {
      // Just a marker
    }

    // Original event handling logic
    if (type === 'MESSAGE') {
      setIsThinking(false)
      setEvents(prev => {
        const lastUserMsg = [...prev].reverse().find(e => e.category === 'chat' && e.type === 'MESSAGE');
        const isResponseToUser = lastUserMsg && (Date.now() - new Date(lastUserMsg.timestamp).getTime() < 60000);

        const newMsg = { 
          ...data, 
          timestamp: timestamp || new Date().toISOString(), 
          id: `msg-${Date.now()}-${Math.random()}`,
          type: type, 
          sender: 'ai',
          category: isResponseToUser ? 'chat' : 'tactical'
        };
        if (isIntelRunning) setIntelEvents(prevIntel => [...prevIntel.slice(-100), newMsg]);
        return [...prev.slice(-500), newMsg];
      });
    } else if (type === 'STATE_CHANGED') {
      setIsThinking(false)
      setAgentState(data.state)
      setMissionStatus(data.details || data.state.toUpperCase())
      setLastToolFailed(!data.last_tool_success)
      setLastFailingTool(data.failed_tool_name || '')
      setEvents(prev => [...prev.slice(-500), {
        text: `STATUS: ${data.state.toUpperCase()}${data.details ? ` - ${data.details}` : ''}`,
        type: 'STATE_CHANGED',
        category: 'tactical',
        timestamp,
        id: `state-${Date.now()}`
      }])
    } else if (type === 'FINDING_FOUND') {
      setFindings(prev => {
        const enrichedFinding = {
          ...data.finding,
          timestamp,
          // Build full description for UI if not already composite
          fullDescription: `${data.finding.description || ''}\n\n[EVIDENCE]\n${data.finding.evidence || 'N/A'}\n\n[MITIGATION]\n${data.finding.mitigation || 'N/A'}`
        };
        const existingIdx = prev.findIndex(f => f.type === enrichedFinding.type && f.description === enrichedFinding.description)
        if (existingIdx !== -1) {
          const updated = [...prev]
          updated[existingIdx] = { ...updated[existingIdx], ...enrichedFinding }
          return updated
        }
        return [...prev, { ...enrichedFinding, id: `find-${Date.now()}` }]
      })
      if (isIntelRunning) {
        setIntelFindings(prev => {
          const enrichedFinding = {
            ...data.finding,
            timestamp,
            fullDescription: `${data.finding.description || ''}\n\n[EVIDENCE]\n${data.finding.evidence || 'N/A'}\n\n[MITIGATION]\n${data.finding.mitigation || 'N/A'}`
          };
          const existingIdx = prev.findIndex(f => f.type === enrichedFinding.type && f.description === enrichedFinding.description)
          if (existingIdx !== -1) {
            const updated = [...prev]
            updated[existingIdx] = { ...updated[existingIdx], ...enrichedFinding }
            return updated
          }
          return [...prev, { ...enrichedFinding, id: `find-${Date.now()}` }]
        })
      }
      // Add to tactical as a discovery item
      const discoveryMsg = {
        text: `FINDING: ${data.finding.type} (${data.finding.severity})\nDESC: ${data.finding.description}\nEVIDENCE: ${data.finding.evidence || 'N/A'}`,
        type: 'MESSAGE',
        category: 'tactical',
        timestamp,
        id: `find-msg-${Date.now()}`
      }
      setEvents(prev => [...prev.slice(-500), discoveryMsg])
      if (isIntelRunning) setIntelEvents(prev => [...prev.slice(-100), discoveryMsg])
    } else if (type === 'FLAG_FOUND') {
      const flagMsg = { text: `🏆 MISSION SUCCESS: Flag ${data.flag} Captured!`, type: 'MESSAGE', category: 'tactical', timestamp, id: `flag-${Date.now()}` }
      setEvents(prev => [...prev.slice(-500), flagMsg])
      if (isIntelRunning) setIntelEvents(prev => [...prev.slice(-100), flagMsg])
    } else if (type === 'TOOL') {
      if (data.status === 'start') {
        setIsThinking(true)
        setCurrentToolProgress({ name: data.name, elapsed: 0, timeout: 60, status: 'running' })
        const toolStartMsg = { 
          text: `EXEC: ${data.args?.command || data.name}`, 
          type: 'TOOL', 
          timestamp, 
          id: `tool-start-${Date.now()}`,
          category: 'tactical',
          args: data.args
        };
        setEvents(prev => [...prev.slice(-500), toolStartMsg]);
        if (isIntelRunning) setIntelEvents(prev => [...prev.slice(-100), toolStartMsg]);
      } else if (data.status === 'running') {
        setCurrentToolProgress({ name: data.name, elapsed: data.args.elapsed, timeout: data.args.timeout, status: 'running' })
        setMissionStatus(`EXECUTING ${data.name.toUpperCase()}...`)
      } else {
        // Handle complete or error
        setIsThinking(false)
        setCurrentToolProgress(null)
        const isError = data.status === 'error'
        setLastToolFailed(isError)
        if (isError) setLastFailingTool(data.name)

        // Generate a preview of the result safely
        let resultPreview = ""
        if (data.result) {
          resultPreview = typeof data.result === 'string' ? data.result : JSON.stringify(data.result)
          if (resultPreview.length > 1000) {
            resultPreview = resultPreview.substring(0, 1000) + "... [Output truncated]"
          }
        }

        const toolEndMsg = { 
          text: `${isError ? 'ERROR' : 'DONE'}: ${data.name}`, 
          result: resultPreview,
          type: 'TOOL', 
          timestamp, 
          id: `tool-end-${Date.now()}-${Math.random()}`,
          category: 'tactical'
        };
        setEvents(prev => [...prev.slice(-500), toolEndMsg]);
        if (isIntelRunning) setIntelEvents(prev => [...prev.slice(-100), toolEndMsg]);
      }
    } else if (type === 'GRAPH_UPDATE') {
      setGraphData(data)
    } else if (type === 'COOLDOWN_START') {
      setCooldownTimer(data.seconds)
    } else if (type === 'INPUT_REQUIRED') {
      setIsInputRequired(true)
      setInteractiveQuestion(data.text)
      setIsThinking(false)
    } else if (type === 'CODEGEN') {
      const isActive = data.status === 'generating' || data.status === 'executing' || data.status === 'streaming'
      setIsThinking(isActive)
      
      const statusText = data.status === 'generating' 
        ? `🤖 Nemotron 120B is writing a Python replacement for '${data.failed_tool}'...`
        : data.status === 'streaming'
        ? `🤖 Writing code... (${data.script?.length || 0} chars)`
        : data.status === 'executing'
        ? `▶ Executing generated script (${data.script?.split('\n').length || '?'} lines)...`
        : data.status === 'complete'
        ? `${data.success ? '✅' : '❌'} Script ${data.success ? 'succeeded' : 'failed'} for '${data.failed_tool}'`
        : `⚠ Error — ${data.error_reason}`
      
      setEvents(prev => {
        // For streaming/generating/executing: update existing card in-place
        if (isActive) {
          const existingIdx = prev.findIndex(e => e.type === 'CODEGEN' && e._live)
          const card = {
            text: statusText,
            type: 'CODEGEN',
            category: 'tactical',
            timestamp,
            id: existingIdx >= 0 ? prev[existingIdx].id : `codegen-${Date.now()}`,
            codegen: data,
            _live: true,
          }
          if (existingIdx >= 0) {
            const updated = [...prev]
            updated[existingIdx] = card
            return updated
          }
          return [...prev.slice(-500), card]
        }
        
        // For complete/error: freeze the live card (remove _live flag)
        const liveIdx = prev.findIndex(e => e.type === 'CODEGEN' && e._live)
        const finalCard = {
          text: statusText,
          type: 'CODEGEN',
          category: 'tactical',
          timestamp,
          id: liveIdx >= 0 ? prev[liveIdx].id : `codegen-final-${Date.now()}`,
          codegen: data,
          _live: false,
        }
        if (liveIdx >= 0) {
          const updated = [...prev]
          updated[liveIdx] = finalCard
          return updated
        }
        return [...prev.slice(-500), finalCard]
      })
    } else if (type === 'HEARTBEAT') {
      // Ignore
    }
  }

  // Update the ref whenever handleEvent is redefined (which is every render)
  useEffect(() => {
    handleEventRef.current = handleEvent
  }, [handleEvent])

  const handleChatCommand = async (e) => {
    e.preventDefault()
    const cmd = commandInput.trim()
    if (!cmd) return
    // User messages always go to 'chat'
    setEvents(prev => [...prev, { text: cmd, type: 'MESSAGE', category: 'chat', sender: 'user', timestamp: new Date().toISOString() }])
    setHasUserMessaged(true)
    setIsThinking(true) // Show AI is processing
    setIsInputRequired(false)
    setInteractiveQuestion('')
    setLastToolFailed(false)
    await sendCommand('input', cmd)
    setCommandInput('')
  }

  const handleWiFiScan = async () => {
    setShowAddMenu(false)
    setIsThinking(true)
    
    // Fetch network info
    try {
      const res = await fetch('/api/network-info')
      const data = await res.json()
      
      const prompt = data.success 
        ? `Analyze my local WiFi network at ${data.subnet} (My IP: ${data.ip}) for vulnerabilities. Discover active hosts and perform internal assessment.`
        : "Analyze my local WiFi network for vulnerabilities. Discover active hosts and perform internal assessment."

      setEvents(prev => [...prev, { 
        text: `Initiating WiFi Security Assessment for ${data.subnet || 'local network'}...`, 
        type: 'MESSAGE', 
        category: 'chat', 
        sender: 'user', 
        timestamp: new Date().toISOString() 
      }])
      
      if (!scanStarted) {
        setScanStarted(true)
        setHasUserMessaged(true)
        // If scan hasn't started, initialize it via /api/scan
        await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            target: "Local Network", 
            instruction: prompt, 
            model, 
            backend 
          })
        })
      } else {
        // If scan is already running, just inject the instruction
        await sendCommand('input', prompt)
      }
    } catch (err) {
      console.error('Failed to initiate WiFi scan:', err)
      setIsThinking(false)
    }
  }

  const startScan = async (e) => {
    e.preventDefault()
    setScanStarted(true)
    setIsThinking(true)
    setEvents([])
    setFindings([])
    setCost(0)
    startTimeRef.current = Date.now()
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, instruction, model, backend, use_audit_findings: useAuditFindings })
    })
    const data = await res.json()
    if (data.success) {
      setEvents([{ text: 'Initializing scan environment...', type: 'info', timestamp: new Date().toISOString() }])
    }
  }

  const downloadReport = () => {
    const reportDate = new Date().toLocaleString()
    let content = `==========================================================\n`
    content += `         SECURITY ASSESSMENT REPORT - TestingGPT\n`
    content += `==========================================================\n\n`
    content += `TARGET: ${target}\n`
    content += `DATE: ${reportDate}\n`
    content += `ENGINE: v2.5.0 PROFESSIONAL\n`
    content += `MODEL: ${model}\n\n`

    content += `--- VULNERABILITY LEDGER ---\n`
    if (findings.length === 0) {
      content += `No vulnerabilities discovered yet.\n`
    } else {
      findings.forEach((f, i) => {
        content += `${i + 1}. [${f.severity?.toUpperCase()}] ${f.type}\n`
        content += `   DESCRIPTION: ${f.description}\n`
        if (f.exploit_details) content += `   HACKER'S PERSPECTIVE: ${f.exploit_details}\n`
        if (f.evidence) content += `   EVIDENCE: ${f.evidence}\n`
        if (f.mitigation) content += `   MITIGATION: ${f.mitigation}\n`
        content += `   CONFIDENCE: ${f.confidence || 'N/A'}%\n`
        content += `   WAF STATUS: ${f.waf_status || 'N/A'}\n`
        content += `   TIMESTAMP: ${f.timestamp || 'N/A'}\n`
        content += `   ------------------------------------------------------\n`
      })
    }

    content += `\n--- TACTICAL OPERATION LOG ---\n`
    const logLines = events.filter(ev => ev.category === 'tactical')
    logLines.forEach(ev => {
      const time = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'N/A'
      content += `[${time}] ${ev.text}\n`
    })

    content += `\n==========================================================\n`
    content += `        END OF REPORT - AUTHORIZED TESTING ONLY\n`
    content += `==========================================================\n`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TestingGPT_Report_${target.replace(/[^a-z0-9]/gi, '_') || 'session'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setToasts(prev => [...prev, { id: Date.now(), title: 'REPORT GENERATED', detail: 'Technical audit exported successfully.', severity: 'INFO' }])
  }

  const handleUploadReport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setLastReportText(text);
      if (isAttackMode) {
        confirmUpload('exploit', text);
        setIsAttackMode(false);
      } else {
        setShowUploadTypeModal(true);
      }
      // Reset input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const confirmUpload = async (sessionType, textOverride = null) => {
    const textToUpload = textOverride || lastReportText;
    if (!textToUpload || textToUpload.trim().length === 0) {
      alert("Report text is empty! Please select a valid file.");
      setIsUploading(false);
      return;
    }
    setIsUploading(true);
    setShowUploadTypeModal(false);
    try {
      const response = await fetch('/api/upload-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textToUpload,
          session_type: sessionType
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTarget(data.target);
        if (data.findings) {
          // Add findings to the ledger
          setFindings(prev => [...prev, ...data.findings]);
        }
        setScanStarted(true);
        setHasUserMessaged(true);
        if (sessionType === 'backend') {
          setShowBackendIntel(true);
          setIsIntelRunning(true);
        } else if (sessionType === 'audit') {
          setShowCodeAudit(true);
        }
        alert(`Successfully ingested ${data.findings_count} findings for ${data.target}. ${sessionType.toUpperCase()} session initiated.`);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Error uploading report: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAPKUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setApkLoading(true);
    setShowAddMenu(false);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/analyze-apk', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setApkResults(data);
        setShowAPKAnalysis(true);
        if (data.package_name) setTarget(data.package_name);
        setScanStarted(true);
        setToasts(prev => [...prev, { id: Date.now(), title: 'APK ANALYZED', detail: `Deep audit of ${data.package_name} complete.`, severity: 'SUCCESS' }]);
      } else {
        alert("APK Analysis failed: " + data.error);
      }
    } catch (err) {
      console.error("Error analyzing APK:", err);
      alert("Error analyzing APK: " + err.message);
    } finally {
      setApkLoading(false);
      event.target.value = '';
    }
  };

  const sendCommand = async (command, text = null) => {
    await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, text })
    })
  }

  const renderMetrics = (full = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: !full && isInteracting ? 'center' : 'stretch', gap: '0.5rem' }}>
      <div className="metric-item">
        {!full && isInteracting ? (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: agentState === 'running' ? 'var(--success)' : 'var(--warning)', boxShadow: agentState === 'running' ? '0 0 8px var(--success)' : 'none' }}></div>
        ) : (
          <>
            <span className="metric-label">Engine Status</span>
            <span className="metric-value" style={{ color: agentState === 'running' ? 'var(--success)' : 'var(--warning)' }}>
              {agentState === 'running' ? 'ACTIVE' : 'IDLE'}
            </span>
          </>
        )}
      </div>
      <div className="metric-item">
        {!full && isInteracting ? (
          <div style={{ fontSize: '1.2rem', color: 'var(--accent-secondary)', opacity: 0.5 }}>M</div>
        ) : (
          <>
            <span className="metric-label">Core Model</span>
            <span className="metric-value" style={{ color: 'var(--accent-secondary)' }}>{model || 'Auto-Llama-3'}</span>
          </>
        )}
      </div>
      <div className="metric-item">
        {!full && isInteracting ? (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>${cost.toFixed(2)}</div>
        ) : (
          <>
            <span className="metric-label">Mission Cost</span>
            <span className="metric-value">${cost.toFixed(4)}</span>
          </>
        )}
      </div>
      <div className="metric-item" style={{ borderBottom: 'none' }}>
        {!full && isInteracting ? (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{uptime.split(':').slice(1).join(':')}</div>
        ) : (
          <>
            <span className="metric-label">Session Time</span>
            <span className="metric-value" style={{ color: 'var(--accent-primary)' }}>{uptime}</span>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="dashboard-container" style={{ '--sidebar-width': isInteracting ? '80px' : '320px' }}>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`vuln-toast severity-${t.severity?.toLowerCase() || 'low'}`}>
            <div className="toast-header">
              <span className="toast-title">{t.title}</span>
              <div className="status-dot active" style={{ width: '8px', height: '8px' }}></div>
            </div>
            <div className="toast-body">{t.detail}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 800 }}>DANGER LEVEL: {t.severity?.toUpperCase() || 'LOW'}</div>
          </div>
        ))}
      </div>
      <header className="header">
        <div className="logo">
          <div className="logo-text">testing<span className="logo-accent">gpt</span></div>
          <div className="status-badge">
            <div className={`status-dot ${agentState === 'running' || isThinking ? 'active' : 'idle'}`}></div>
            {isThinking ? 'THINKING' : agentState.toUpperCase()}
          </div>
          {cooldownTimer > 0 && (
            <div className="cooldown-badge">
              <span className="cooldown-icon">⏳</span>
              MISSION HALTED: BACKOFF ACTIVE ({cooldownTimer}s)
            </div>
          )}
        </div>
        <div className="target-info">
          <div className="flex items-center gap-4">
            <button 
              className="btn-secondary flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}
              disabled={isUploading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {isUploading ? 'INGESTING...' : 'UPLOAD REPORT'}
            </button>
            <button 
              className="btn-secondary flex items-center gap-2"
              onClick={() => {
                setIsAttackMode(true);
                fileInputRef.current?.click();
              }}
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: 900 }}
              disabled={isUploading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isUploading && isAttackMode ? 'PREPARING ATTACK...' : 'ATTACK'}
            </button>
          </div>
          {scanStarted ? (
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2px' }}>Operational Target</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-primary)', letterSpacing: '0.02em' }}>{target}</div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => setShowGraph(true)}
                  style={{ borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h7" />
                    <path d="M16 5V3a1 1 0 00-1-1H9a1 1 0 00-1 1v2" />
                    <path d="M14 14l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  OPERATIONS MAP
                </button>
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={downloadReport}
                  style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)', color: '#34d399' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  DOWNLOAD REPORT
                </button>
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear all intelligence memory and reset the session?")) {
                      sendCommand('reset');
                      setEvents([]);
                      setFindings([]);
                      setGraphData({ nodes: [], links: [] });
                    }
                  }}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                  </svg>
                  CLEAR SYSTEM
                </button>
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => setShowCodeAudit(true)}
                  style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.05)', color: '#22d3ee' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M9 15l2 2 4-4" />
                  </svg>
                  CODE AUDIT
                </button>
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => {
                    setAuditMode('url');
                    setShowCodeAudit(true);
                  }}
                  style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.05)', color: '#a855f7' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  WEB AUDIT
                </button>
                <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => setShowBackendIntel(true)}
                  style={{ borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.05)', color: '#ec4899' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                  WEB BACKEND
                </button>
                <div className="metrics-summary">
                  <span className="version">v2.5.0 PROFESSIONAL</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em' }}>SYSTEM STANDBY</div>
              <button 
                className="btn-secondary flex items-center gap-2"
                onClick={() => setShowCodeAudit(true)}
                style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.05)', color: '#22d3ee', padding: '6px 14px', fontSize: '0.65rem' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
                CODE AUDIT
              </button>
              <button 
                className="btn-secondary flex items-center gap-2"
                onClick={() => {
                  setAuditMode('url');
                  setShowCodeAudit(true);
                }}
                style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.05)', color: '#a855f7', padding: '6px 14px', fontSize: '0.65rem' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                WEB AUDIT
              </button>
              <button 
                className="btn-secondary flex items-center gap-2"
                onClick={() => setShowBackendIntel(true)}
                style={{ borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.05)', color: '#ec4899', padding: '6px 14px', fontSize: '0.65rem' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
                WEB BACKEND
              </button>
            </div>
          )}
        </div>
      </header>

      <aside className={`sidebar ${hasUserMessaged ? 'minimized' : ''}`}>
        {hasUserMessaged && (
          <button className="expand-metrics-btn" onClick={() => setIsOverlayVisible(true)} title="Expand Metrics">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18 6-6-6-6M3 12h18"/><path d="m9 6-6 6 6 6"/></svg>
          </button>
        )}
        <div className="card" style={{ flex: 1 }}>
          {!isInteracting && (
            <div className="card-header">
              <div className="card-title">Intelligence Metrics</div>
            </div>
          )}
          {renderMetrics()}
          {!isInteracting && (
            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)' }}></div>
                Secure Environment Verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)' }}></div>
                API Integrity Confirmed
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <div className={`console-container ${isSplit ? 'split' : ''}`}>
          <div className="tactical-log">
            <div className="pane-header">
              <span className="pane-title">Tactical Operation Log</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => sendCommand(agentState === 'paused' ? 'resume' : 'pause')}
                  style={{ height: '24px', padding: '0 0.75rem', fontSize: '0.6rem' }}>
                  {agentState === 'paused' ? 'RES' : 'PSE'}
                </button>
                {agentState === 'paused' && lastToolFailed && (
                   <button 
                   className="btn-retry"
                   onClick={() => sendCommand('retry')}
                   style={{ height: '24px', padding: '0 0.75rem', fontSize: '0.6rem' }}>
                   RETRY
                 </button>
                )}
                <button 
                  className="btn-secondary"
                  onClick={() => sendCommand('stop')}
                  style={{ height: '24px', padding: '0 0.75rem', fontSize: '0.6rem', color: 'var(--error)' }}>
                  STP
                </button>
              </div>
            </div>
            <div className="pane-content" ref={logRef}>
              {logEvents.length === 0 && !isThinking ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontSize: '0.65rem', fontWeight: 800 }}>TECH_STREAM_IDLE</div>
              ) : (
                <>
                  {logEvents.map((ev, i) => (
                    <div key={ev.id || i} className={`activity-item ${ev.type === 'TOOL' ? 'tool' : ''} ${ev.type === 'CODEGEN' ? 'codegen-card' : ''}`}>
                      <div className="activity-item-header">
                        <span>{ev.type === 'CODEGEN' ? '🤖 CODE GEN' : ev.text?.startsWith('STATUS:') ? 'SYSTEM' : ev.text?.startsWith('EXEC:') ? 'TOOL EXEC' : ev.text?.startsWith('FINDING:') ? 'DISCOVERY' : 'LOG'}</span>
                        <span>{ev.timestamp && !isNaN(new Date(ev.timestamp)) ? new Date(ev.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}</span>
                      </div>
                      <div className="activity-item-content">
                        {/* CODEGEN card: show rich UI */}
                        {ev.type === 'CODEGEN' && ev.codegen ? (
                          <div className="codegen-container">
                            <div className="codegen-header">
                              <span className={`codegen-badge ${ev.codegen.status}`}>
                                {ev.codegen.status === 'generating' ? '⚡ GENERATING' : 
                                 ev.codegen.status === 'streaming' ? '✍️ WRITING CODE' :
                                 ev.codegen.status === 'executing' ? '▶ EXECUTING' : 
                                 ev.codegen.status === 'complete' ? (ev.codegen.success ? '✅ SUCCESS' : '❌ FAILED') :
                                 '⚠ ERROR'}
                              </span>
                              <span className="codegen-model">Nemotron 120B</span>
                            </div>
                            
                            {ev.codegen.failed_tool && (
                              <div className="codegen-reason">
                                <strong>Triggered because:</strong> <code>{ev.codegen.failed_tool}</code> is not available
                                {ev.codegen.error_reason && (
                                  <div className="codegen-error-detail">{ev.codegen.error_reason.substring(0, 150)}</div>
                                )}
                              </div>
                            )}
                            
                            {ev.codegen.script && (
                              <details className="codegen-script-details" open={ev._live || ev.codegen.status === 'streaming' || ev.codegen.status === 'executing'}>
                                <summary>📝 {ev.codegen.status === 'streaming' ? `Writing Python Script... (${ev.codegen.script.length} chars)` : `Generated Python Script (${ev.codegen.script.split('\n').length} lines)`}</summary>
                                <pre className="codegen-script">{ev.codegen.script}</pre>
                              </details>
                            )}
                            
                            {ev.codegen.output && (
                              <details className="codegen-output-details" open>
                                <summary>📊 Execution Output</summary>
                                <pre className="codegen-output">{ev.codegen.output.substring(0, 2000)}</pre>
                              </details>
                            )}
                          </div>
                        ) : (
                          <>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {ev.text}
                          </div>
                            {ev.args && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                                {JSON.stringify(ev.args, null, 2)}
                              </div>
                            )}
                            {ev.result && (
                              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '4px', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'hidden', marginTop: '8px', fontSize: '0.75rem', borderLeft: '2px solid var(--accent-primary)' }}>
                                {ev.result}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="thinking-row">
                      <div className="pulse-loader">
                        <span></span><span></span><span></span>
                      </div>
                      <span className="thinking-text">Mission Processing...</span>
                    </div>
                  )}
                  {currentToolProgress && (
                    <div className="tool-progress-bar-container">
                      <div className="tool-progress-info">
                        <span className="tool-progress-name">{currentToolProgress.name} IN PROGRESS</span>
                        <span className="tool-progress-timer">{currentToolProgress.elapsed}s / {currentToolProgress.timeout}s</span>
                      </div>
                      <div className="tool-progress-track">
                        <div 
                          className="tool-progress-fill" 
                          style={{ width: `${Math.min(100, (currentToolProgress.elapsed / (currentToolProgress.timeout || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      {currentToolProgress.elapsed > 40 && (
                        <button 
                          className="tool-skip-btn"
                          onClick={() => fetch('/api/tool/skip', { method: 'POST' })}
                        >
                          SKIP TOOL
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="advisory-chat">
            <div className="pane-header">
              <span className="pane-title">AI Advisory Console</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="live-indicator"></div>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)' }}>AGENT_ACTIVE</span>
              </div>
            </div>
            <div className="pane-content" ref={chatRef}>
              {chatEvents.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontSize: '0.65rem', fontWeight: 800 }}>ADVISORY_LINK_OFFLINE</div>
              ) : (
                chatEvents.map((ev, i) => (
                  <div key={ev.id || i} className={`chat-message ${ev.sender === 'user' ? 'user' : 'ai'}`}>
                    {ev.text || ''}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="chat-input-area">
          {isInputRequired && (
            <div className="question-banner">
              <div className="question-banner-label">Question from Agent</div>
              <div className="question-banner-text">{interactiveQuestion}</div>
            </div>
          )}
          <div className={`chat-input-container ${isInputRequired ? 'input-required' : ''}`}>
            {!scanStarted ? (
              <>
                <div style={{ display: 'flex', gap: '0.75rem', flex: 1, alignItems: 'center', position: 'relative' }} ref={addMenuRef}>
                  <button 
                    className="bubble-icon-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddMenu(!showAddMenu);
                    }}
                    style={{ padding: 0, color: showAddMenu ? 'var(--accent)' : 'inherit' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                  
                  {showAddMenu && (
                    <div className="add-menu">
                      <button className="add-menu-item" onClick={handleWiFiScan}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                        Scan Local WiFi
                      </button>
                      <button className="add-menu-item" onClick={() => apkInputRef.current?.click()} disabled={apkLoading}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                        {apkLoading ? 'Analyzing APK...' : 'Reverse Engineer APK'}
                      </button>
                      <button className="add-menu-item" onClick={() => apkInputRef.current?.click()} disabled={apkLoading}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                        {apkLoading ? 'Analyzing APK...' : 'Reverse Engineer APK'}
                      </button>
                    </div>
                  )}
                  <input 
                    placeholder="Target domain..." 
                    value={target} 
                    onChange={e => setTarget(e.target.value)}
                    required
                    style={{ flex: '0 0 160px', background: 'transparent', border: 'none', fontSize: '0.9rem', padding: '0.4rem 0' }}
                  />
                  <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }}></div>
                  <input 
                    placeholder="Describe mission objective..." 
                    value={instruction} 
                    onChange={e => setInstruction(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.9rem', padding: '0.4rem 0' }}
                  />
                </div>
                <div className="chat-bubble-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
                    <label style={{ 
                      fontSize: '0.65rem', 
                      color: auditResults.some(f => f.type === 'ISSUE') ? (useAuditFindings ? '#22d3ee' : 'var(--text-dim)') : 'rgba(255,255,255,0.15)', 
                      fontWeight: 800, cursor: auditResults.some(f => f.type === 'ISSUE') ? 'pointer' : 'not-allowed', 
                      display: 'flex', alignItems: 'center', gap: '6px' 
                    }}>
                      <input 
                        type="checkbox" 
                        disabled={!auditResults.some(f => f.type === 'ISSUE')}
                        checked={useAuditFindings} 
                        onChange={e => setUseAuditFindings(e.target.checked)}
                        style={{ accentColor: '#22d3ee' }}
                      />
                      {auditResults.some(f => f.type === 'ISSUE') 
                        ? `LINK AUDIT (${auditResults.filter(f => f.type === 'ISSUE').length})`
                        : 'LINK AUDIT (NONE FOUND)'}
                    </label>
                  </div>
                  <div className="bubble-model-select-wrapper">
                    <select 
                      className="bubble-model-select"
                      value={model || 'groq/llama-3.1-8b-instant'} 
                      onChange={e => setModel(e.target.value)}
                    >
                      {AVAILABLE_MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name.split(': ')[1]}</option>
                      ))}
                    </select>
                    <div className="select-chevron">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  <button 
                    className="bubble-icon-btn primary"
                    onClick={startScan}
                    title="Initiate Assessment">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-4-4 4 4-4 4"/></svg>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, alignItems: 'center', position: 'relative' }} ref={addMenuRef}>
                <button 
                  className="bubble-icon-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Toggle Add Menu', !showAddMenu);
                    setShowAddMenu(!showAddMenu);
                  }}
                  style={{ padding: 0, color: showAddMenu ? 'var(--accent)' : 'inherit' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
                
                {showAddMenu && (
                  <div className="add-menu">
                    <button className="add-menu-item" onClick={handleWiFiScan}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                      Scan Local WiFi
                    </button>
                  </div>
                )}
                <form onSubmit={handleChatCommand} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    autoFocus
                    placeholder={isInputRequired ? "Provide the information requested above..." : "Reply to agent..."} 
                    value={commandInput} 
                    onChange={e => setCommandInput(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.9rem', padding: '0.4rem 0' }}
                  />
                  <div className="chat-bubble-footer">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, opacity: 0.6, letterSpacing: '0.02em' }}>
                      {AVAILABLE_MODELS.find(m => m.id === model)?.name.split(': ')[1] || 'Llama 3.1 8B'}
                    </div>
                    <button type="submit" className="bubble-icon-btn primary" disabled={!commandInput.trim()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7M12 19V5"/></svg>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="disclaimer-text">
            Security Engine is an AI and can make mistakes. Please verify critical findings.
          </div>
        </div>
      </main>

      <section className="right-panel">
        <div className="card" style={{ flex: 1, minHeight: 0, border: findings.length > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--glass-border)' }}>
          <div className="card-header">
            <div className="card-title">Vulnerability Ledger</div>
          </div>
          <div className="activity-feed">
            {findings.map((f, i) => (
              <div 
                key={f.id || i} 
                className="finding-item clickable" 
                onClick={() => setSelectedFinding(f)}
                style={{ 
                  cursor: 'pointer',
                  borderLeftColor: f.severity?.toLowerCase() === 'critical' ? 'var(--error)' : f.severity?.toLowerCase() === 'high' ? '#f97316' : f.severity?.toLowerCase() === 'medium' ? '#f59e0b' : 'var(--success)',
                  transition: 'transform 0.2s ease, background 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className={`danger-level-badge severity-${f.severity?.toLowerCase() || 'low'}`}>
                      DANGER LEVEL: {f.severity?.toUpperCase() || 'LOW'}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{f.type}</span>
                  </div>
                  {f.confidence !== undefined && (
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: f.confidence > 70 ? 'var(--success)' : f.confidence > 40 ? 'var(--warning)' : 'var(--error)' }}>
                      {f.confidence}% CONF
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{f.description}</div>
                {f.confidence !== undefined && (
                  <div className="confidence-bar-container">
                    <div 
                      className="confidence-bar" 
                      style={{ 
                        width: `${f.confidence}%`, 
                        backgroundColor: f.confidence > 70 ? 'var(--success)' : f.confidence > 40 ? 'var(--warning)' : 'var(--error)'
                      }}
                    ></div>
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '0.1em' }}>
                  CLICK FOR EXPLOIT DETAILS →
                </div>
              </div>
            ))}
            {findings.length === 0 && (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '6rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em', opacity: 0.5 }}>CLEAN REPORT - NO FINDINGS</div>
              </div>
            )}
          </div>
        </div>
      </section>
      {isOverlayVisible && (
        <div className="metrics-overlay" onClick={() => setIsOverlayVisible(false)}>
          <div className="metrics-modal" onClick={e => e.stopPropagation()}>
            <button className="close-overlay-btn" onClick={() => setIsOverlayVisible(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="card-header" style={{ marginBottom: '2rem' }}>
              <div className="card-title" style={{ fontSize: '1rem' }}>Intelligence Metrics</div>
            </div>
            {renderMetrics(true)}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              TestingGPT provides real-time oversight of scan health and resource utilization. Monitor these values to optimize mission performance.
            </div>
          </div>
        </div>
      )}
      {selectedFinding && (
        <div className="modal-overlay" onClick={() => setSelectedFinding(null)}>
          <div className="finding-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="pane-header" style={{ borderBottomColor: 'var(--glass-border-bright)' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <div className={`danger-level-badge severity-${selectedFinding.severity?.toLowerCase() || 'low'}`} style={{ width: 'fit-content' }}>
                    {selectedFinding.severity?.toUpperCase()} SEVERITY VULNERABILITY
                 </div>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>{selectedFinding.type}</h2>
               </div>
               <button className="btn-icon" onClick={() => setSelectedFinding(null)}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="modal-scroll-content">
              <div className="detail-section" style={{ marginTop: '2rem' }}>
                <details open style={{ marginBottom: '1.5rem' }}>
                  <summary className="section-label" style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: 'rotate(90deg)' }}><path d="m9 18 6-6-6-6"/></svg>
                    CORE DESCRIPTION
                  </summary>
                  <p className="section-text" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {selectedFinding.description}
                  </p>
                </details>

                {selectedFinding.evidence && (
                  <details style={{ marginBottom: '1.5rem' }}>
                    <summary className="section-label" style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                      RAW EVIDENCE
                    </summary>
                    <pre className="section-text" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {selectedFinding.evidence}
                    </pre>
                  </details>
                )}

                {selectedFinding.mitigation && (
                  <details style={{ marginBottom: '1.5rem' }}>
                    <summary className="section-label" style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                      REMEDIATION STEPS
                    </summary>
                    <p className="section-text" style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)', color: '#6ee7b7' }}>
                      {selectedFinding.mitigation}
                    </p>
                  </details>
                )}
              </div>

              <div className="detail-section highlight">
                <h3 className="section-label" style={{ color: 'var(--accent-secondary)' }}>HACKER'S PERSPECTIVE & EXPLOIT DETAILS</h3>
                <div className="exploit-content">
                  {selectedFinding.exploit_details || "No further exploitation details were provided by the agent for this finding."}
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-card">
                  <span className="card-label">CONFIDENCE</span>
                  <span className="card-value">{selectedFinding.confidence}%</span>
                </div>
                <div className="detail-card">
                  <span className="card-label">WAF STATUS</span>
                  <span className="card-value">{selectedFinding.waf_status || 'NOT DETECTED'}</span>
                </div>
                <div className="detail-card">
                  <span className="card-label">TIMESTAMP</span>
                  <span className="card-value">{selectedFinding.timestamp ? new Date(selectedFinding.timestamp).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.8)', fontWeight: 600, margin: 0 }}>
                  WARNING: This information is for authorized security testing only. Performance of unauthorized exploits is illegal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Audit Modal */}
      {showCodeAudit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => !auditRunning && setShowCodeAudit(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '680px', maxHeight: '80vh',
            background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(10,15,30,0.98))',
            border: '1px solid rgba(6,182,212,0.15)', borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.05)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))',
                  border: '1px solid rgba(6,182,212,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M9 15l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>Security Audit Console</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>AI-powered code & vulnerability scanner</div>
                </div>
              </div>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                <button 
                  onClick={() => setAuditMode('folder')}
                  style={{ 
                    padding: '6px 12px', fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px',
                    background: auditMode === 'folder' ? 'rgba(6,182,212,0.15)' : 'transparent',
                    color: auditMode === 'folder' ? '#22d3ee' : 'var(--text-dim)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}>FOLDER</button>
                <button 
                  onClick={() => setAuditMode('url')}
                  style={{ 
                    padding: '6px 12px', fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px',
                    background: auditMode === 'url' ? 'rgba(168,85,247,0.15)' : 'transparent',
                    color: auditMode === 'url' ? '#a855f7' : 'var(--text-dim)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}>WEBSITE URL</button>
              </div>
              <button onClick={() => { if (!auditRunning) setShowCodeAudit(false) }} style={{
                width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', fontSize: '0.9rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>✕</button>
            </div>
            
            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Folder Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  {auditMode === 'folder' ? 'PROJECT FOLDER PATH' : 'WEBSITE URL TO AUDIT'}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={auditMode === 'folder' ? auditFolder : auditUrl}
                    onChange={e => auditMode === 'folder' ? setAuditFolder(e.target.value) : setAuditUrl(e.target.value)}
                    placeholder={auditMode === 'folder' ? "C:\\Users\\yourname\\Desktop\\project" : "https://example.com"}
                    disabled={auditRunning}
                    style={{
                      flex: 1, padding: '11px 14px', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                      color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = auditMode === 'folder' ? 'rgba(6,182,212,0.4)' : 'rgba(168,85,247,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  {!auditRunning ? (
                    <button
                      onClick={async () => {
                        const target = auditMode === 'folder' ? auditFolder.trim() : auditUrl.trim()
                        if (!target) return
                        
                        setAuditRunning(true)
                        setAuditResults([])
                        setAuditSummary(null)
                        setAuditProgressStats(null)
                        setAuditProgress(`Initializing ${auditMode === 'folder' ? 'folder' : 'website'} audit...`)
                        
                        try {
                          let effectiveFolder = target;
                          
                          if (auditMode === 'url') {
                            setAuditProgress('🌐 Crawling website source...')
                            const crawlRes = await fetch('/api/crawl', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: target })
                            })
                            const crawlData = await crawlRes.json()
                            if (!crawlData.success) {
                              setAuditProgress(`❌ Crawl failed: ${crawlData.error}`)
                              setAuditRunning(false)
                              return
                            }
                            effectiveFolder = crawlData.folder
                            setAuditProgress(`✅ Crawled ${crawlData.files_found} files. Starting audit...`)
                          }

                          const res = await fetch('/api/code-audit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ folder: effectiveFolder, model })
                          })
                          const data = await res.json()
                          if (!data.success) {
                            setAuditProgress(`❌ ${data.error}`)
                            setAuditRunning(false)
                            return
                          }
                          setAuditProgress(`Scanning ${data.files_count} files...`)
                          
                          const poll = setInterval(async () => {
                            try {
                              const r = await fetch('/api/code-audit/results')
                              const d = await r.json()
                              setAuditResults(d.findings || [])
                              setAuditSummary(d.summary)
                              if (d.progress) setAuditProgressStats(d.progress)
                              
                              if (!d.running) {
                                clearInterval(poll)
                                setAuditRunning(false)
                                setAuditProgress('✅ Audit complete!')
                              } else {
                                const issues = d.findings?.filter(f => f.type === 'ISSUE') || []
                                setAuditProgress(`Scanning... ${issues.length} issue${issues.length !== 1 ? 's' : ''} found`)
                              }
                            } catch(err) { /* ignore */ }
                          }, 3000)
                        } catch(err) {
                          setAuditProgress(`❌ ${err.message}`)
                          setAuditRunning(false)
                        }
                      }}
                      style={{
                        padding: '0 20px', background: auditMode === 'folder' 
                          ? 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(168,85,247,0.25))'
                          : 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(6,182,212,0.25))',
                        border: `1px solid ${auditMode === 'folder' ? 'rgba(6,182,212,0.35)' : 'rgba(168,85,247,0.35)'}`, 
                        borderRadius: '8px', color: auditMode === 'folder' ? '#22d3ee' : '#a855f7',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                      }}
                    >
                      {auditMode === 'url' ? '🌐 CRAWL & AUDIT' : '🔍 SCAN'}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await fetch('/api/code-audit/stop', { method: 'POST' })
                        setAuditRunning(false)
                        setAuditProgress('Audit stopped.')
                      }}
                      style={{
                        padding: '0 20px', background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      ⏹ STOP
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress */}
              {auditProgress && (
                <div style={{
                  padding: '10px 14px', marginBottom: '16px', borderRadius: '8px',
                  background: auditRunning ? 'rgba(6,182,212,0.06)' : auditProgress.startsWith('❌') ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                  border: `1px solid ${auditRunning ? 'rgba(6,182,212,0.15)' : auditProgress.startsWith('❌') ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`,
                  fontSize: '0.75rem', color: auditRunning ? '#67e8f9' : auditProgress.startsWith('❌') ? '#f87171' : '#34d399',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {auditRunning && <span style={{ animation: 'pulseOpacity 1s infinite' }}>⏳</span>}
                    {auditProgress}
                  </div>
                  
                  {auditProgressStats && auditProgressStats.total > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {auditProgressStats.percentage}% ({auditProgressStats.scanned}/{auditProgressStats.total})
                      </span>
                      <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${Math.min(100, Math.max(0, auditProgressStats.percentage))}%`, 
                          height: '100%', 
                          background: auditRunning ? '#22d3ee' : '#34d399', 
                          transition: 'width 0.3s ease, background-color 0.3s ease' 
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Summary Bar */}
              {auditSummary && (
                <div style={{
                  display: 'flex', gap: '16px', marginBottom: '20px', padding: '14px 18px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {[
                    { label: 'CRITICAL', count: auditSummary.critical, color: '#ef4444' },
                    { label: 'HIGH', count: auditSummary.high, color: '#f97316' },
                    { label: 'MEDIUM', count: auditSummary.medium, color: '#eab308' },
                    { label: 'LOW', count: auditSummary.low, color: '#3b82f6' },
                    { label: 'INFO', count: auditSummary.info, color: '#6b7280' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', background: s.color,
                        boxShadow: s.count > 0 ? `0 0 8px ${s.color}` : 'none',
                        opacity: s.count > 0 ? 1 : 0.3,
                      }}></div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: s.count > 0 ? s.color : 'var(--text-dim)', letterSpacing: '0.04em' }}>
                        {s.count} {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Findings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {auditResults.filter(f => f.type === 'ISSUE').map((finding, idx) => {
                  const colors = {
                    CRITICAL: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', badge: 'rgba(239,68,68,0.2)', text: '#f87171' },
                    HIGH: { bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)', badge: 'rgba(249,115,22,0.2)', text: '#fb923c' },
                    MEDIUM: { bg: 'rgba(234,179,8,0.07)', border: 'rgba(234,179,8,0.2)', badge: 'rgba(234,179,8,0.2)', text: '#facc15' },
                    LOW: { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.2)', badge: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
                    INFO: { bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.2)', badge: 'rgba(107,114,128,0.2)', text: '#9ca3af' },
                  }[finding.severity] || { bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.2)', badge: 'rgba(107,114,128,0.2)', text: '#9ca3af' }
                  
                  return (
                    <div key={idx} style={{
                      padding: '14px 16px', background: colors.bg,
                      border: `1px solid ${colors.border}`, borderRadius: '10px',
                      borderLeft: `3px solid ${colors.text}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          padding: '2px 7px', borderRadius: '4px', fontSize: '0.58rem', fontWeight: 800,
                          background: colors.badge, color: colors.text, letterSpacing: '0.06em',
                        }}>
                          {finding.severity}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0' }}>
                          {finding.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '5px', fontFamily: 'var(--font-mono)' }}>
                        {finding.file}{finding.line !== '0' ? ` : line ${finding.line}` : ''}
                      </div>
                      {finding.description && (
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.6', marginTop: '4px' }}>
                          {finding.description}
                        </div>
                      )}
                      
                      {finding.evidence && (
                        <div style={{ 
                          marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', 
                          borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>EVIDENCE / SAMPLE</div>
                          <code style={{ fontSize: '0.65rem', color: '#6ee7b7', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {finding.evidence}
                          </code>
                        </div>
                      )}

                      {finding.mitigation && (
                        <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                          <div style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '2px' }}>REMEDIATION</div>
                          <div style={{ fontSize: '0.68rem', color: '#7dd3fc', lineHeight: '1.5' }}>
                            {finding.mitigation}
                          </div>
                        </div>
                      )}
                      
                      {finding.thought && (
                        <details style={{ marginTop: '12px', cursor: 'pointer' }}>
                          <summary style={{ 
                            fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 700, 
                            letterSpacing: '0.05em', outline: 'none', display: 'inline-flex', alignItems: 'center' 
                          }}>
                            ▶ VIEW AI THOUGHT PROCESS
                          </summary>
                          <div style={{ 
                            marginTop: '8px', padding: '10px 14px', background: 'rgba(139,92,246,0.06)', 
                            borderLeft: '2px solid rgba(139,92,246,0.4)', borderRadius: '0 6px 6px 0', 
                            fontSize: '0.65rem', color: '#c4b5fd', fontFamily: 'var(--font-mono)', 
                            whiteSpace: 'pre-wrap', lineHeight: '1.6', overflowX: 'auto'
                          }}>
                            {finding.thought}
                          </div>
                        </details>
                      )}
                    </div>
                  )
                })}
                
                {auditResults.length === 0 && !auditRunning && auditProgress && !auditProgress.startsWith('❌') && (
                  <div style={{
                    textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-dim)', fontSize: '0.8rem',
                    background: 'rgba(16,185,129,0.04)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.1)',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✨</div>
                    No security issues found. Your code looks clean!
                  </div>
                )}
                
                {!auditProgress && (
                  <div style={{
                    textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-dim)', fontSize: '0.75rem',
                    borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px', opacity: 0.5 }}>📂</div>
                    Paste a project folder path above and click SCAN to begin
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backend Intel Modal */}
      {showBackendIntel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, transition: 'all 0.5s ease'
        }} onClick={() => !isIntelRunning && setShowBackendIntel(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: isIntelRunning ? '1000px' : '520px',
            height: isIntelRunning ? '85vh' : 'auto',
            maxHeight: '90vh',
            background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(10,15,30,0.98))',
            border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 50px rgba(236, 72, 153, 0.1)',
            padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ec4899', letterSpacing: '-0.02em', margin: 0 }}>BACKEND INTELLIGENCE</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                      {isIntelRunning ? 'ACTIVE RECONNAISSANCE MISSION' : 'DEEP ARCHITECTURE MAPPING'}
                    </span>
                    {isIntelRunning && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 8px #ec4899' }} className="animate-pulse" />}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {isIntelRunning && (
                  <button 
                    onClick={() => {
                      fetch('/api/scan/stop', { method: 'POST' });
                      setIsIntelRunning(false);
                    }}
                    style={{ 
                      padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px', color: '#f87171', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >ABORT MISSION</button>
                )}
                <button 
                  onClick={() => setShowBackendIntel(false)} 
                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >✕</button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {!isIntelRunning ? (
                /* Setup View */
                <div style={{ padding: '40px', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', display: 'block', marginBottom: '12px' }}>TARGET WEB SYSTEM</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="https://target-acquisition.io"
                      value={backendIntelUrl}
                      onChange={e => setBackendIntelUrl(e.target.value)}
                      style={{
                        width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '14px',
                        color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#ec4899'}
                      onBlur={e => e.target.style.borderColor = 'rgba(236, 72, 153, 0.2)'}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', display: 'block', marginBottom: '12px' }}>RECONNAISSANCE ENGINE (120B RECOMMENDED)</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={backendIntelModel}
                        onChange={e => setBackendIntelModel(e.target.value)}
                        style={{
                          width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '14px',
                          color: '#fff', fontSize: '0.95rem', outline: 'none', appearance: 'none', cursor: 'pointer'
                        }}
                      >
                        {AVAILABLE_MODELS.map(m => (
                          <option key={m.id} value={m.id} style={{ background: '#111827' }}>{m.name}</option>
                        ))}
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#ec4899' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '20px', background: 'rgba(236, 72, 153, 0.03)', border: '1px solid rgba(236, 72, 153, 0.1)', borderRadius: '14px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
                      Choosing the **Nemotron 120B** model ensures maximum accuracy for deep fingerprinting and logic deduction. 
                      This mission will consume higher credits but provide expert-level analysis of server-side stacks and hidden vulnerabilities.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                    <button 
                      onClick={async (e) => {
                        if (!backendIntelUrl.trim()) return;
                        const url = backendIntelUrl.trim();
                        const selectedModel = backendIntelModel;
                        
                        setIsIntelRunning(true);
                        setIntelEvents([]);
                        setIntelFindings([]);
                        setTarget(url);
                        const intelInstruction = `
MANDATORY: REPORT ALL DISCOVERIES IMMEDIATELY.
Your goal is to map the ENTIRE backend architecture. Every time you identify a single piece of information, you MUST report it as a FINDING.

Use these types precisely:
- "TECH_STACK": For server OS, web servers (Nginx/Apache), languages (PHP/Python), frameworks (React/Express).
- "NETWORK_CONFIG": For open ports, internal IP ranges, DNS records, subdomains.
- "SECURITY_POSTURE": For WAFs (Cloudflare/Akamai), security headers, SSL/TLS config, firewalls.
- "SECRET_LEAK": For API keys, .env content, exposed credentials, sensitive scripts.
- "VULNERABILITY": For specific exploit paths (SQLi, XSS, RCE).

FORMAT (REQUIRED FOR EVERY DISCOVERY):
**FINDING:** [Exact Category from above]
**SEVERITY:** [INFO for tech/config, LOW/MEDIUM/HIGH for security issues, CRITICAL for secrets]
**DESCRIPTION:** [Human-readable technical explanation of what was found]
**DATA:** [Place raw technical data here: JSON objects, code snippets, flag strings, or raw server responses]
**CONFIDENCE:** [Percentage]

Do not wait for a complete picture. If you see one port open, report it. If you identify Nginx, report it.
`;
                        setInstruction(intelInstruction);
                        
                        // Global setup
                        setScanStarted(true);
                        setIsThinking(true);
                        setEvents([]);
                        setFindings([]);
                        setCost(0);
                        setModel(selectedModel);
                        startTimeRef.current = Date.now();
                        
                        await fetch('/api/scan', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            target: url, 
                            instruction: intelInstruction, 
                            model: selectedModel, 
                            backend, 
                            use_audit_findings: useAuditFindings 
                          })
                        });
                      }}
                      style={{
                        flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', fontWeight: 900,
                        fontSize: '0.75rem', letterSpacing: '0.05em', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      DEEP RECON
                    </button>
                    
                    <button 
                      onClick={async (e) => {
                        if (!backendIntelUrl.trim()) return;
                        const url = backendIntelUrl.trim();
                        const selectedModel = backendIntelModel;
                        
                        setIsIntelRunning(true);
                        setIntelEvents([]);
                        setIntelFindings([]);
                        setTarget(url);
                        
                        const secretInstruction = `
                          CRITICAL MISSION: EXFILTRATE SECRETS.
                          You are tasked with a specialized data exfiltration mission. Your goal is to find AND EXTRACT high-value secrets.
                          
                          TARGETS:
                          1. **Hardcoded API Keys**: Scan discovered .js, .py, .php, .go files for patterns of AWS_KEY, STRIPE, OPENAI, etc.
                          2. **Configuration Files**: Hunt for .env, config.*, web.config, settings.py, credentials.xml.
                          3. **Database Info**: Search for DB_PASSWORD, DB_USER, connection strings.
                          4. **Backup & Hidden Files**: Find exposed .bak, .old, .zip, .tar, .git, .svn directories.
                          
                          Every time you find a secret or sensitive file, report a FINDING with type: "SECRET_LEAK" and severity: "CRITICAL". Be RELENTLESS.
                        `;
                        setInstruction(secretInstruction);
                        
                        // Global setup
                        setScanStarted(true);
                        setIsThinking(true);
                        setEvents([]);
                        setFindings([]);
                        setCost(0);
                        setModel(selectedModel);
                        startTimeRef.current = Date.now();
                        
                        await fetch('/api/scan', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            target: url, 
                            instruction: secretInstruction, 
                            model: selectedModel, 
                            backend, 
                            use_audit_findings: useAuditFindings 
                          })
                        });
                      }}
                      style={{
                        flex: 2, padding: '16px', background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 900,
                        fontSize: '0.8rem', letterSpacing: '0.08em', cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.35)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      LAUNCH SECRET EXTRACTION
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Mission View */
                <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                  {/* Left: Tactical Log */}
                  <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>RECONNAISSANCE LOG</span>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>{intelFindings.filter(f => f.type === 'SECRET_LEAK').length} SECRETS FOUND</span>
                        <span style={{ fontSize: '0.65rem', color: '#ec4899', fontWeight: 700 }}>{intelEvents.length} ACTIVITIES</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {intelEvents.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                           AWAITING MISSION START...
                        </div>
                      ) : (
                        intelEvents.map((ev, i) => (
                          <div key={i} style={{ 
                            padding: '12px', background: 'rgba(17, 24, 39, 0.4)', borderRadius: '10px', 
                            border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.8rem', color: '#e2e8f0',
                            animation: 'slideInRight 0.3s ease-out'
                          }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <span style={{ color: '#ec4899', fontWeight: 800, fontSize: '0.65rem' }}>{new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                              <div style={{ flex: 1, overflowWrap: 'anywhere' }}>
                                <span style={{ 
                                  color: ev.text?.startsWith('EXEC:') ? '#a855f7' : ev.text?.startsWith('FINDING:') ? '#ec4899' : '#94a3b8',
                                  fontWeight: 700, marginRight: '8px'
                                }}>
                                  {ev.text?.startsWith('EXEC:') ? '⚡ TOOL' : ev.text?.startsWith('FINDING:') ? '🔍 DISCOVERY' : 'LOG'}:
                                </span>
                                {ev.text?.replace(/^(EXEC:|FINDING:|STATUS:)\s*/, '')}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                  </div>
                  
                  {/* Right: Discovered Intel */}
                  <div style={{ width: '400px', background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                       <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CLASSIFIED FINDINGS</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {intelFindings.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                           NO VULNERABILITIES <br/> DISCOVERED YET
                        </div>
                      ) : (
                        intelFindings.map((f, i) => {
                          const isTech = f.type === 'TECH_STACK' || f.type === 'NETWORK_CONFIG' || f.severity === 'INFO' || f.severity === 'LOW';
                          const isSecret = f.type === 'SECRET_LEAK' || f.severity === 'CRITICAL';
                          
                          return (
                            <div key={i} style={{ 
                              padding: '18px', 
                              background: isSecret ? 'rgba(239, 68, 68, 0.06)' : 
                                          isTech ? 'rgba(99, 102, 241, 0.05)' : 'rgba(236, 72, 153, 0.04)',
                              borderRadius: '14px', 
                              border: isSecret ? '1px solid rgba(239, 68, 68, 0.2)' : 
                                      isTech ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid rgba(236, 72, 153, 0.12)',
                              borderLeft: isSecret ? '4px solid #ef4444' : 
                                          isTech ? '4px solid #6366f1' : '4px solid #ec4899',
                              animation: 'fadeInUp 0.4s ease-out',
                              position: 'relative',
                              flexShrink: 0,
                              minHeight: 'fit-content',
                              boxShadow: isSecret ? '0 4px 20px rgba(239, 68, 68, 0.05)' : 'none'
                            }}>
                              {isSecret && (
                                <div className="secret-pulse" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.03), transparent)', pointerEvents: 'none' }} />
                              )}
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                <span style={{ 
                                  fontSize: '0.65rem', fontWeight: 900, 
                                  color: isSecret ? '#f87171' : isTech ? '#818cf8' : '#ec4899',
                                  textTransform: 'uppercase', letterSpacing: '0.08em'
                                }}>
                                  {f.type === 'SECRET_LEAK' ? '💎 SECRET EXFILTRATION' : 
                                   f.type === 'TECH_STACK' ? '🔧 ARCHITECTURE STACK' :
                                   f.type === 'NETWORK_CONFIG' ? '🌐 NETWORK TOPOLOGY' :
                                   f.type.replace('_', ' ')}
                                </span>
                                <span style={{ 
                                  fontSize: '0.55rem', padding: '2px 8px', borderRadius: '6px', 
                                  background: f.severity === 'CRITICAL' ? '#ef4444' : f.severity === 'HIGH' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                                  color: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? '#fff' : '#94a3b8',
                                  fontWeight: 900, border: '1px solid rgba(255,255,255,0.05)'
                                }}>{f.severity}</span>
                              </div>

                              <div style={{ 
                                fontSize: '0.8rem', color: '#f1f5f9', lineHeight: 1.6, fontWeight: 500,
                                overflowWrap: 'break-word', wordBreak: 'break-word', marginBottom: f.data ? '12px' : '0'
                              }}>
                                {f.description}
                              </div>
                              
                              {f.data && (
                                <div style={{ 
                                  marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.4)', 
                                  borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
                                  fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '0.7rem', color: '#94a3b8',
                                  whiteSpace: 'pre-wrap', overflowX: 'auto',
                                  maxHeight: '250px', position: 'relative'
                                }}>
                                  <div style={{ 
                                    color: isTech ? '#818cf8' : '#ec4899', 
                                    fontWeight: 900, marginBottom: '8px', fontSize: '0.55rem', 
                                    letterSpacing: '0.1em', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px'
                                  }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
                                    TECHNICAL DATA LEAK
                                  </div>
                                  <div style={{ color: isTech ? '#a5d6ff' : '#cbd5e1', lineHeight: '1.4' }}>{f.data}</div>
                                </div>
                              )}

                              {f.confidence && (
                                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                    <div style={{ 
                                      width: `${f.confidence}%`, height: '100%', borderRadius: '2px',
                                      background: `linear-gradient(90deg, ${isTech ? '#4f46e5, #818cf8' : '#db2777, #ec4899'})` 
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.02em' }}>
                                    {f.confidence}% <span style={{ opacity: 0.5 }}>PROBABILITY</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center' }}>
                         <button 
                            onClick={() => {
                                if (window.confirm("Abort current mission and clear all findings?")) {
                                    setIsIntelRunning(false);
                                    setIntelEvents([]);
                                    setIntelFindings([]);
                                    setMissionStatus('IDLE');
                                }
                            }}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.55rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' }}
                         >
                            ABORT CURRENT MISSION & RESET
                         </button>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ec4899', marginBottom: '10px' }}>MISSION PROGRESS: {missionStatus}</div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                        <div style={{ width: (isThinking || missionStatus.includes('RETRI')) ? '60%' : '100%', height: '100%', background: '#ec4899', transition: 'width 2s ease' }} className={(isThinking || missionStatus.includes('RETRI')) ? 'animate-pulse' : ''} />
                      </div>
                      
                      {missionStatus.toLowerCase().includes('retry') && (
                        <button 
                         onClick={() => fetch('/api/scan/retry', { method: 'POST' })}
                         style={{ width: '100%', marginBottom: '10px', padding: '10px', background: '#f59e0b', border: 'none', borderRadius: '8px', color: '#000', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', animation: 'pulse 1s infinite' }}
                        >RETRY NOW</button>
                      )}

                      <button 
                         onClick={() => {
                            setShowBackendIntel(false);
                            setHasUserMessaged(true); // Ensure split view is active outside
                         }}
                         style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                      >MINIMIZE TO DASHBOARD</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Session Upload Type Modal */}
      {showUploadTypeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #111, #080808)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px', padding: '40px', width: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(79, 70, 229, 0.15)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(79, 70, 229, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>Initialize Restored Session</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '32px', lineHeight: '1.6' }}>Select the target workflow for this report. The engine will adapt its strategy based on historical findings and the mission type.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => confirmUpload('pentest')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px', padding: '16px 24px', color: '#fff', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Full Penetration Test</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Comprehensive automated vulnerability research</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <button 
                onClick={() => confirmUpload('backend')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px', padding: '16px 24px', color: '#fff', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#db2777' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Backend Intelligence</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Deep architectural mapping & secret discovery</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <button 
                onClick={() => confirmUpload('audit')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px', padding: '16px 24px', color: '#fff', textAlign: 'left',
                  cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '16px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Code & Infrastructure Audit</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Static analysis & configuration review</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <button 
              onClick={() => setShowUploadTypeModal(false)}
              style={{
                marginTop: '32px', background: 'none', border: 'none', color: '#64748b',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em'
              }}
            >CANCEL UPLOAD</button>
          </div>
        </div>
      )}
      <AttackGraphModal />
      <APKAnalysisModal />
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".txt" onChange={handleUploadReport} />
      <input type="file" ref={apkInputRef} style={{ display: 'none' }} accept=".apk" onChange={handleAPKUpload} />
    </div>
  )
}

export default App
