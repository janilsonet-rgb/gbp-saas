'use client'

import { useState, useEffect } from 'react'

interface ChecklistItem {
  id: string
  pergunta: string
  categoria: string
}

interface Respostas {
  [key: string]: boolean | null
}

interface HistoricoItem {
  empresa: string
  palavraChave: string
  score: number
  percentual: number
  diagnostico: string
  data: string
}

const CHECKLIST: ChecklistItem[] = [
  // Informações Básicas
  { id: 'endereco', categoria: 'Informações Básicas', pergunta: 'O endereço está correto e completo?' },
  { id: 'telefone', categoria: 'Informações Básicas', pergunta: 'O telefone está atualizado?' },
  { id: 'horario', categoria: 'Informações Básicas', pergunta: 'O horário de funcionamento está correto?' },
  // Conteúdo Visual
  { id: 'fotos', categoria: 'Conteúdo Visual', pergunta: 'As fotos são de boa qualidade?' },
  { id: 'logo', categoria: 'Conteúdo Visual', pergunta: 'O logotipo está visível e atualizado?' },
  // Engajamento
  { id: 'perguntas', categoria: 'Engajamento', pergunta: 'As perguntas dos clientes estão sendo respondidas?' },
  { id: 'comentarios', categoria: 'Engajamento', pergunta: 'Os comentários/avaliações estão sendo respondidos?' },
  // Conformidade
  { id: 'diretrizes', categoria: 'Conformidade', pergunta: 'O perfil segue as diretrizes de confiança do Google?' },
  { id: 'categorias', categoria: 'Conformidade', pergunta: 'As categorias do negócio estão corretas?' },
]

const CATEGORIAS = ['Informações Básicas', 'Conteúdo Visual', 'Engajamento', 'Conformidade']

const CAT_ICONS: Record<string, string> = {
  'Informações Básicas': '📍',
  'Conteúdo Visual': '📷',
  'Engajamento': '💬',
  'Conformidade': '✅',
}

function getScoreColor(pct: number) {
  if (pct >= 80) return '#4ade80'
  if (pct >= 55) return '#facc15'
  return '#f87171'
}

function getScoreLabel(pct: number) {
  if (pct >= 80) return 'EXCELENTE'
  if (pct >= 55) return 'BOM'
  if (pct >= 30) return 'REGULAR'
  return 'FRACO'
}

// Velocímetro SVG
function Velocimetro({ pct }: { pct: number }) {
  const radius = 80
  const cx = 110
  const cy = 100
  const startAngle = 180
  const endAngle = 0
  const totalAngle = 180

  function polarToCart(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    }
  }

  function arcPath(startDeg: number, endDeg: number, r: number) {
    const s = polarToCart(startDeg, r)
    const e = polarToCart(endDeg, r)
    const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`
  }

  const fillAngle = startAngle - (pct / 100) * totalAngle
  const needleAngle = startAngle - (pct / 100) * totalAngle
  const needleRad = (needleAngle * Math.PI) / 180
  const needleLen = 65
  const nx = cx + needleLen * Math.cos(needleRad)
  const ny = cy - needleLen * Math.sin(needleRad)

  const color = getScoreColor(pct)

  return (
    <svg viewBox="0 0 220 120" style={{ width: '100%', maxWidth: 280 }}>
      {/* Trilha fundo */}
      <path
        d={arcPath(180, 0, radius)}
        fill="none"
        stroke="#2a2a2a"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Arco colorido */}
      {pct > 0 && (
        <path
          d={arcPath(180, fillAngle, radius)}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
        />
      )}
      {/* Marcadores */}
      {[0, 25, 50, 75, 100].map((v) => {
        const a = 180 - (v / 100) * 180
        const inner = polarToCart(a, radius - 20)
        const outer = polarToCart(a, radius - 9)
        return (
          <line
            key={v}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="#3a3a3a"
            strokeWidth="1.5"
          />
        )
      })}
      {/* Agulha */}
      <line
        x1={cx} y1={cy}
        x2={nx} y2={ny}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="6" fill={color} />
      <circle cx={cx} cy={cy} r="3" fill="#0f0f0f" />
      {/* Percentual */}
      <text x={cx} y={cy + 22} textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Georgia, serif">
        {pct}%
      </text>
      {/* Label */}
      <text x={cx} y={cy + 38} textAnchor="middle" fill={color} fontSize="9" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="2">
        {getScoreLabel(pct)}
      </text>
      {/* Min/Max */}
      <text x="20" y={cy + 16} fill="#4b5563" fontSize="8" fontFamily="Georgia, serif">0%</text>
      <text x="185" y={cy + 16} fill="#4b5563" fontSize="8" fontFamily="Georgia, serif">100%</text>
    </svg>
  )
}

export default function Home() {
  const [etapa, setEtapa] = useState<'form' | 'checklist' | 'resultado'>('form')
  const [query, setQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [respostas, setRespostas] = useState<Respostas>({})
  const [resultado, setResultado] = useState<{ score: number; diagnostico: string; percentual: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [abaAtiva, setAbaAtiva] = useState<'analisar' | 'historico'>('analisar')

  useEffect(() => {
    const salvo = localStorage.getItem('gbp_historico')
    if (salvo) setHistorico(JSON.parse(salvo))
  }, [])

  function salvarNoHistorico(item: HistoricoItem) {
    const novo = [item, ...historico].slice(0, 20)
    setHistorico(novo)
    localStorage.setItem('gbp_historico', JSON.stringify(novo))
  }

  function limparHistorico() {
    setHistorico([])
    localStorage.removeItem('gbp_historico')
  }

  function avancarParaChecklist() {
    if (!query.trim() || !keyword.trim()) {
      setErro('Preencha todos os campos.')
      return
    }
    setErro('')
    setEtapa('checklist')
  }

  function responder(id: string, valor: boolean) {
    setRespostas(prev => ({ ...prev, [id]: valor }))
  }

  function calcularPercentual() {
    const respondidas = CHECKLIST.filter(c => respostas[c.id] !== undefined)
    if (respondidas.length === 0) return 0
    const positivas = respondidas.filter(c => respostas[c.id] === true).length
    return Math.round((positivas / CHECKLIST.length) * 100)
  }

  const todasRespondidas = CHECKLIST.every(c => respostas[c.id] !== undefined)

  async function analisar() {
    setLoading(true)
    const percentual = calcularPercentual()
    try {
      const res = await fetch('https://gbp-saas-production.up.railway.app/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, keyword, percentual }),
      })
      const data = await res.json()
      const item: HistoricoItem = {
        empresa: query,
        palavraChave: keyword,
        score: data.score,
        percentual,
        diagnostico: data.diagnostico,
        data: new Date().toLocaleString('pt-BR'),
      }
      salvarNoHistorico(item)
      setResultado({ score: data.score, diagnostico: data.diagnostico, percentual })
      setEtapa('resultado')
    } catch {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  function reiniciar() {
    setEtapa('form')
    setQuery('')
    setKeyword('')
    setRespostas({})
    setResultado(null)
    setErro('')
  }

  const inputStyle = {
    width: '100%',
    background: '#111',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#f5f5f5',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    letterSpacing: '0.15em',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  }

  const cardStyle = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    animation: 'fadeIn 0.35s ease',
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 20px',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.25em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 12 }}>
            Análise de Perfil
          </p>
          <h1 style={{ fontSize: 38, fontWeight: 700, color: '#f5f5f5', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            GBP Analyzer
          </h1>
          <div style={{ width: 40, height: 2, background: '#4ade80', margin: '16px auto 0', borderRadius: 2 }} />
        </div>

        {/* Abas */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: 4,
        }}>
          {(['analisar', 'historico'] as const).map(aba => (
            <button key={aba} onClick={() => { setAbaAtiva(aba); if (aba === 'analisar') reiniciar() }} style={{
              flex: 1, padding: '9px 16px',
              background: abaAtiva === aba ? '#2a2a2a' : 'transparent',
              border: 'none', borderRadius: 7,
              color: abaAtiva === aba ? '#f5f5f5' : '#6b7280',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {aba === 'analisar' ? 'Analisar' : `Histórico${historico.length > 0 ? ` (${historico.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* === ABA ANALISAR === */}
        {abaAtiva === 'analisar' && (
          <>
            {/* ETAPA 1: Formulário */}
            {etapa === 'form' && (
              <div style={cardStyle}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Nome da Empresa</label>
                  <input
                    type="text" value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && avancarParaChecklist()}
                    placeholder="Ex: Restaurante do João"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#4ade80')}
                    onBlur={e => (e.target.style.borderColor = '#333')}
                  />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Palavra-chave</label>
                  <input
                    type="text" value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && avancarParaChecklist()}
                    placeholder="Ex: restaurante italiano fortaleza"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#4ade80')}
                    onBlur={e => (e.target.style.borderColor = '#333')}
                  />
                </div>
                {erro && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, marginTop: -12 }}>{erro}</p>}
                <button onClick={avancarParaChecklist} style={{
                  width: '100%', background: '#4ade80', color: '#0f0f0f',
                  border: 'none', borderRadius: 8, padding: '14px 24px',
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  Continuar →
                </button>
              </div>
            )}

            {/* ETAPA 2: Checklist */}
            {etapa === 'checklist' && (
              <div style={cardStyle}>
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, marginTop: 0 }}>
                    Diagnóstico
                  </p>
                  <p style={{ color: '#f5f5f5', fontSize: 16, fontWeight: 600, margin: 0 }}>{query}</p>
                </div>

                {CATEGORIAS.map(cat => (
                  <div key={cat} style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: 16 }}>{CAT_ICONS[cat]}</span>
                      <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                        {cat}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {CHECKLIST.filter(c => c.categoria === cat).map(item => {
                        const resp = respostas[item.id]
                        return (
                          <div key={item.id} style={{
                            background: '#111', borderRadius: 10,
                            border: resp === true ? '1px solid #16a34a44' : resp === false ? '1px solid #dc262644' : '1px solid #2a2a2a',
                            padding: '12px 14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                          }}>
                            <span style={{ fontSize: 13, color: resp !== undefined ? '#f5f5f5' : '#9ca3af', flex: 1, lineHeight: 1.4 }}>
                              {item.pergunta}
                            </span>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button onClick={() => responder(item.id, true)} style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                background: resp === true ? '#16a34a' : '#1f1f1f',
                                color: resp === true ? '#fff' : '#6b7280',
                                transition: 'all 0.15s',
                              }}>Sim</button>
                              <button onClick={() => responder(item.id, false)} style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                background: resp === false ? '#dc2626' : '#1f1f1f',
                                color: resp === false ? '#fff' : '#6b7280',
                                transition: 'all 0.15s',
                              }}>Não</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Progresso respondido */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progresso</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                      {Object.keys(respostas).length}/{CHECKLIST.length}
                    </span>
                  </div>
                  <div style={{ height: 3, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(Object.keys(respostas).length / CHECKLIST.length) * 100}%`,
                      background: '#4ade80', borderRadius: 4, transition: 'width 0.3s',
                    }} />
                  </div>
                </div>

                {erro && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{erro}</p>}

                <button
                  onClick={analisar}
                  disabled={!todasRespondidas || loading}
                  style={{
                    width: '100%', border: 'none', borderRadius: 8,
                    padding: '14px 24px', fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: todasRespondidas && !loading ? 'pointer' : 'not-allowed',
                    background: todasRespondidas && !loading ? '#4ade80' : '#1a2a1a',
                    color: todasRespondidas && !loading ? '#0f0f0f' : '#4ade8066',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Analisando...' : todasRespondidas ? 'Ver Resultado →' : 'Responda todas as perguntas'}
                </button>
              </div>
            )}

            {/* ETAPA 3: Resultado */}
            {etapa === 'resultado' && resultado && (
              <div style={cardStyle}>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, marginTop: 0 }}>
                  Resultado
                </p>
                <p style={{ color: '#f5f5f5', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 28 }}>{query}</p>

                {/* Velocímetro */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                  <Velocimetro pct={resultado.percentual} />
                </div>

                {/* Detalhes */}
                <div style={{ background: '#111', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #2a2a2a' }}>
                    <span style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Score GBP</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(resultado.percentual) }}>{resultado.score}/100</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #2a2a2a' }}>
                    <span style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Palavra-chave</span>
                    <span style={{ fontSize: 13, color: '#f5f5f5' }}>{keyword}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Diagnóstico</span>
                    <span style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>{resultado.diagnostico}</span>
                  </div>
                </div>

                {/* Resumo checklist */}
                <div style={{ background: '#111', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <p style={{ fontSize: 11, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 12 }}>
                    Resumo do Checklist
                  </p>
                  {CATEGORIAS.map(cat => {
                    const itens = CHECKLIST.filter(c => c.categoria === cat)
                    const positivos = itens.filter(c => respostas[c.id] === true).length
                    const total = itens.length
                    const pctCat = Math.round((positivos / total) * 100)
                    return (
                      <div key={cat} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>{CAT_ICONS[cat]} {cat}</span>
                          <span style={{ fontSize: 12, color: getScoreColor(pctCat), fontWeight: 600 }}>{positivos}/{total}</span>
                        </div>
                        <div style={{ height: 3, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pctCat}%`, background: getScoreColor(pctCat), borderRadius: 4 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button onClick={reiniciar} style={{
                  width: '100%', background: 'transparent', border: '1px solid #2a2a2a',
                  borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', color: '#9ca3af',
                }}>
                  Nova Análise
                </button>
              </div>
            )}
          </>
        )}

        {/* === ABA HISTÓRICO === */}
        {abaAtiva === 'historico' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>
                Análises Recentes
              </p>
              {historico.length > 0 && (
                <button onClick={limparHistorico} style={{
                  background: 'transparent', border: '1px solid #3a3a3a', borderRadius: 6,
                  color: '#6b7280', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '5px 10px', cursor: 'pointer',
                }}>
                  Limpar
                </button>
              )}
            </div>
            {historico.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                Nenhuma análise realizada ainda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historico.map((item, i) => (
                  <div key={i} style={{
                    background: '#111', border: '1px solid #2a2a2a',
                    borderRadius: 10, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(item.percentual), minWidth: 42, lineHeight: 1 }}>
                      {item.percentual}%
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: '#f5f5f5', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.empresa}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{item.palavraChave}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#4b5563', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {item.data}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 8, letterSpacing: '0.05em' }}>
          Google Business Profile · Análise SEO Local
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #4b5563; }
        button:hover { opacity: 0.88; }
      `}</style>
    </main>
  )
}
