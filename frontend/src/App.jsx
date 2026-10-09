import { useState, useRef, useCallback } from 'react'

/* ─────────────────────────────────────────────
   Design tokens
───────────────────────────────────────────── */
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:       #0d1117;
    --ink-soft:  #3d4451;
    --ink-muted: #8892a4;
    --paper:     #f7f6f2;
    --surface:   #ffffff;
    --border:    #e2e0d8;
    --gold:      #c9a84c;
    --gold-dim:  #e8d9a8;
    --gold-bg:   #fdf9ef;
    --red:       #c0392b;
    --red-bg:    #fdf2f0;
    --green:     #1a7f5a;
    --green-bg:  #edf7f3;

    --font-display: 'Fraunces', Georgia, serif;
    --font-body:    'DM Sans', system-ui, sans-serif;
    --font-mono:    'DM Mono', 'Courier New', monospace;

    --radius:  10px;
    --shadow:  0 2px 16px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05);
    --shadow-lg: 0 8px 40px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06);
  }

  html, body, #root {
    height: 100%;
    background: var(--paper);
    font-family: var(--font-body);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  /* ── layout ── */
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── header ── */
  .header {
    background: var(--ink);
    padding: 0 2.5rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: .75rem;
  }
  .header-icon {
    width: 34px;
    height: 34px;
    background: var(--gold);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .header-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
    color: #fff;
    letter-spacing: -.01em;
  }
  .header-sub {
    font-size: .72rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
    letter-spacing: .04em;
  }
  .status-dot {
    display: flex;
    align-items: center;
    gap: .5rem;
    font-size: .75rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6b7280;
  }
  .dot.online  { background: #22c55e; box-shadow: 0 0 6px #22c55e88; }
  .dot.error   { background: var(--red); }

  /* ── main ── */
  .main {
    flex: 1;
    max-width: 860px;
    width: 100%;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
  }

  /* ── hero ── */
  .hero {
    text-align: center;
    margin-bottom: 2.75rem;
  }
  .hero-eyebrow {
    font-family: var(--font-mono);
    font-size: .7rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: .6rem;
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 2.75rem);
    font-weight: 700;
    color: var(--ink);
    line-height: 1.15;
    letter-spacing: -.02em;
    margin-bottom: .75rem;
  }
  .hero h1 em { font-style: italic; color: var(--gold); }
  .hero p {
    font-size: .95rem;
    color: var(--ink-soft);
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ── card ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .card-header {
    padding: 1.2rem 1.75rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: .6rem;
  }
  .card-header h2 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--ink);
  }
  .card-body { padding: 1.75rem; }

  /* ── upload zone ── */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: border-color .18s, background .18s, transform .14s;
    outline: none;
    position: relative;
  }
  .upload-zone:hover, .upload-zone:focus-visible {
    border-color: var(--gold);
    background: var(--gold-bg);
  }
  .upload-zone.dragging {
    border-color: var(--gold);
    background: var(--gold-bg);
    transform: scale(1.012);
    border-style: solid;
  }
  .upload-zone.has-file {
    border-color: var(--green);
    background: var(--green-bg);
    border-style: solid;
  }
  .upload-icon {
    font-size: 2.5rem;
    margin-bottom: .75rem;
    display: block;
    line-height: 1;
  }
  .upload-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: .3rem;
  }
  .upload-hint {
    font-size: .8rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
  }
  .file-pill {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: .35rem .85rem;
    font-size: .82rem;
    font-family: var(--font-mono);
    color: var(--ink);
    margin-top: .9rem;
    box-shadow: var(--shadow);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .file-pill-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 280px;
  }
  .file-size {
    color: var(--ink-muted);
    white-space: nowrap;
  }

  /* ── button ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: .75rem 1.75rem;
    border-radius: 8px;
    font-size: .9rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all .15s;
    font-family: var(--font-body);
    text-decoration: none;
  }
  .btn-primary {
    background: var(--ink);
    color: #fff;
    width: 100%;
    margin-top: 1.25rem;
    letter-spacing: .01em;
  }
  .btn-primary:hover:not(:disabled) {
    background: #1e2733;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,.18);
  }
  .btn-primary:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .btn-download {
    background: var(--gold);
    color: var(--ink);
    font-size: .92rem;
    padding: .8rem 2rem;
  }
  .btn-download:hover {
    background: #b8943d;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(201,168,76,.35);
  }
  .btn-reset {
    background: transparent;
    color: var(--ink-soft);
    border: 1px solid var(--border);
    font-size: .83rem;
    padding: .65rem 1.25rem;
  }
  .btn-reset:hover {
    background: var(--paper);
    color: var(--ink);
  }

  /* ── progress / loading ── */
  .processing-box {
    text-align: center;
    padding: 2.5rem 1.5rem;
  }
  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin .8s linear infinite;
    margin: 0 auto 1.25rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .processing-label {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: .35rem;
  }
  .processing-sub {
    font-size: .82rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
  }
  .progress-bar-wrap {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    margin: 1.5rem auto 0;
    max-width: 260px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: var(--gold);
    border-radius: 2px;
    animation: progress 2s ease-in-out infinite;
    transform-origin: left;
  }
  @keyframes progress {
    0%   { transform: scaleX(0) translateX(0); }
    50%  { transform: scaleX(.7) translateX(30%); }
    100% { transform: scaleX(0) translateX(300%); }
  }

  /* ── alert ── */
  .alert {
    border-radius: 8px;
    padding: .9rem 1.1rem;
    font-size: .85rem;
    display: flex;
    gap: .7rem;
    align-items: flex-start;
    line-height: 1.5;
  }
  .alert-error { background: var(--red-bg); color: var(--red); border: 1px solid #f3c0bb; }
  .alert-icon { font-size: 1rem; flex-shrink: 0; margin-top: .02em; }

  /* ── results ── */
  .results-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  .results-meta h2 {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: .15rem;
    letter-spacing: -.01em;
  }
  .results-meta p {
    font-size: .8rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
  }
  .results-actions {
    display: flex;
    gap: .75rem;
    align-items: center;
    flex-shrink: 0;
  }
  .stat-strip {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  .stat-box {
    flex: 1;
    min-width: 120px;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: .85rem 1.1rem;
  }
  .stat-value {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 700;
    color: var(--ink);
    line-height: 1;
    margin-bottom: .2rem;
  }
  .stat-label {
    font-size: .72rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  /* ── grade distribution ── */
  .grade-dist {
    display: flex;
    gap: .5rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
  }
  .grade-chip {
    display: flex;
    align-items: center;
    gap: .4rem;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: .3rem .75rem;
    font-size: .78rem;
    font-family: var(--font-mono);
    color: var(--ink-soft);
  }
  .grade-badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .7rem;
    font-weight: 700;
  }

  /* ── table ── */
  .table-wrap {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: .855rem;
  }
  thead th {
    background: var(--paper);
    padding: .7rem 1rem;
    text-align: left;
    font-size: .7rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: .07em;
    color: var(--ink-muted);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    font-weight: 500;
  }
  tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background .12s;
    animation: rowIn .25s ease both;
  }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--paper); }
  @keyframes rowIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
  td {
    padding: .75rem 1rem;
    color: var(--ink);
    vertical-align: middle;
  }
  .td-mono {
    font-family: var(--font-mono);
    font-size: .8rem;
    color: var(--ink-soft);
  }
  .grade-pill {
    display: inline-block;
    padding: .18rem .6rem;
    border-radius: 100px;
    font-size: .75rem;
    font-weight: 700;
    font-family: var(--font-mono);
    letter-spacing: .04em;
  }

  /* ── footer ── */
  .footer {
    text-align: center;
    padding: 1.5rem;
    font-size: .73rem;
    color: var(--ink-muted);
    font-family: var(--font-mono);
    border-top: 1px solid var(--border);
  }

  /* ── divider ── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 1.25rem 0;
  }

  /* ── util ── */
  .mt-1 { margin-top: .5rem; }
  .mt-2 { margin-top: 1rem; }
  .gap-sm { display: flex; flex-direction: column; gap: .75rem; }
`

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const fmt_size = bytes => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`
}

const GRADE_COLORS = {
  O:  { bg: '#fef3c7', color: '#92400e' },
  A:  { bg: '#d1fae5', color: '#065f46' },
  'A+': { bg: '#d1fae5', color: '#065f46' },
  B:  { bg: '#dbeafe', color: '#1e40af' },
  'B+': { bg: '#dbeafe', color: '#1e40af' },
  C:  { bg: '#f3e8ff', color: '#6b21a8' },
  D:  { bg: '#fee2e2', color: '#991b1b' },
  F:  { bg: '#fecaca', color: '#7f1d1d' },
}

const grade_style = g => {
  const s = GRADE_COLORS[g?.trim()] ?? { bg: '#f1f5f9', color: '#475569' }
  return { background: s.bg, color: s.color }
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function GradeDistribution({ students }) {
  const counts = students.reduce((acc, s) => {
    const g = s.overall_grade?.trim() || '?'
    acc[g] = (acc[g] || 0) + 1
    return acc
  }, {})

  return (
    <div className="grade-dist">
      {Object.entries(counts).sort().map(([g, n]) => (
        <span key={g} className="grade-chip">
          <span className="grade-badge" style={grade_style(g)}>{g}</span>
          {n} student{n !== 1 ? 's' : ''}
        </span>
      ))}
    </div>
  )
}

function StudentTable({ students }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>PR Number</th>
            <th>Seat No.</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={s.pr_number} style={{ animationDelay: `${i * 35}ms` }}>
              <td className="td-mono" style={{ color: 'var(--ink-muted)' }}>{i + 1}</td>
              <td style={{ fontWeight: 500 }}>{s.name}</td>
              <td className="td-mono">{s.pr_number}</td>
              <td className="td-mono">{s.seat_number}</td>
              <td>
                <span className="grade-pill" style={grade_style(s.overall_grade)}>
                  {s.overall_grade || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main App
───────────────────────────────────────────── */
export default function App() {
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [result, setResult]     = useState(null)
  const [apiStatus, setApiStatus] = useState('unknown') // 'unknown' | 'online' | 'error'

  const inputRef = useRef(null)

  // Health-check on mount
  const checkHealth = useCallback(async () => {
    try {
      const r = await fetch('/health')
      setApiStatus(r.ok ? 'online' : 'error')
    } catch {
      setApiStatus('error')
    }
  }, [])

  useState(() => { checkHealth() }, [])

  /* ── drag/drop ── */
  const onDragOver = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }
  const pickFile = f => {
    setError(null)
    setResult(null)
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Only .xlsx and .xls files are supported.')
      return
    }
    setFile(f)
  }

  /* ── upload ── */
  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || 'Upload failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  /* ── render ── */
  return (
    <>
      <style>{styles}</style>
      <div className="page">

        {/* header */}
        <header className="header">
          <div className="header-brand">
            <div className="header-icon">📋</div>
            <div>
              <div className="header-title">Marksheet Parser</div>
              <div className="header-sub">v2.0 · FastAPI + React</div>
            </div>
          </div>
          <div className="status-dot">
            <span
              className={`dot ${apiStatus === 'online' ? 'online' : apiStatus === 'error' ? 'error' : ''}`}
            />
            {apiStatus === 'online' ? 'API online' : apiStatus === 'error' ? 'API offline' : 'Checking…'}
          </div>
        </header>

        <main className="main">

          {/* hero */}
          <div className="hero">
            <p className="hero-eyebrow">Shree Rayeshwar Institute of Engineering</p>
            <h1>Grade reports, <em>instantly.</em></h1>
            <p>
              Upload the university marksheet Excel and download
              individual student reports in seconds.
            </p>
          </div>

          {/* ── results view ── */}
          {result ? (
            <div>
              <div className="results-header">
                <div className="results-meta">
                  <h2>Processing complete</h2>
                  <p>Processed at {result.timestamp?.replace('_', ' ') ?? '—'}</p>
                </div>
                <div className="results-actions">
                  <button className="btn btn-reset" onClick={reset}>
                    ↩ New upload
                  </button>
                  <a
                    className="btn btn-download"
                    href={result.download_url}
                    download
                  >
                    ⬇ Download ZIP
                  </a>
                </div>
              </div>

              {/* stats */}
              <div className="stat-strip">
                <div className="stat-box">
                  <div className="stat-value">{result.students_count}</div>
                  <div className="stat-label">Students processed</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    {new Set(result.students.map(s => s.overall_grade)).size}
                  </div>
                  <div className="stat-label">Distinct grades</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    {result.students.filter(s =>
                      ['A', 'A+', 'O'].includes(s.overall_grade?.trim())
                    ).length}
                  </div>
                  <div className="stat-label">Distinctions</div>
                </div>
              </div>

              <GradeDistribution students={result.students} />

              <StudentTable students={result.students} />
            </div>

          ) : (
            /* ── upload form ── */
            <div className="card">
              <div className="card-header">
                <span>📤</span>
                <h2>Upload Marksheet</h2>
              </div>
              <div className="card-body">

                {/* drop zone */}
                <div
                  className={`upload-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  tabIndex={0}
                  role="button"
                  aria-label="Click or drag and drop to upload marksheet"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && pickFile(e.target.files[0])}
                  />
                  <span className="upload-icon">
                    {file ? '✅' : '📂'}
                  </span>
                  <div className="upload-label">
                    {file ? 'File ready' : 'Drop your marksheet here'}
                  </div>
                  <div className="upload-hint">
                    {file
                      ? 'Click to choose a different file'
                      : 'or click to browse · .xlsx / .xls · max 16 MB'}
                  </div>
                  {file && (
                    <div className="file-pill">
                      📄 <span className="file-pill-name">{file.name}</span>
                      <span className="file-size">{fmt_size(file.size)}</span>
                    </div>
                  )}
                </div>

                {/* error */}
                {error && (
                  <div className="alert alert-error mt-2">
                    <span className="alert-icon">⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* loading */}
                {loading ? (
                  <div className="processing-box">
                    <div className="spinner" />
                    <div className="processing-label">Processing marksheet…</div>
                    <div className="processing-sub">
                      Parsing grades · generating reports · building ZIP
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" />
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!file}
                  >
                    {file ? '⚡ Generate Reports' : 'Select a file first'}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          Student Marksheet Parser · Shree Rayeshwar Institute of Engineering
        </footer>
      </div>
    </>
  )
}