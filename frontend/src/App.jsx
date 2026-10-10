import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const styles = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    color-scheme: light;
    --bg: #f8fafc; --surface: #fff; --surface-2: #f1f5f9; --surface-3: #e8edf5;
    --text: #111827; --text-2: #475569; --muted: #5b677a; --border: #e2e8f0;
    --accent: #6366f1; --accent-2: #8b5cf6; --accent-soft: #eef2ff;
    --green: #047857; --green-bg: #ecfdf5; --amber: #b45309; --amber-bg: #fffbeb;
    --rose: #be123c; --rose-bg: #fff1f2; --shadow: 0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.045);
    --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    --sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      color-scheme: dark;
      --bg: #090d16; --surface: #111827; --surface-2: #182234; --surface-3: #253249;
      --text: #f1f5f9; --text-2: #cbd5e1; --muted: #94a3b8; --border: #293548;
      --accent: #818cf8; --accent-2: #a78bfa; --accent-soft: #222447;
      --green: #6ee7b7; --green-bg: #082c27; --amber: #fcd34d; --amber-bg: #32280d;
      --rose: #fda4af; --rose-bg: #35131e; --shadow: 0 1px 2px rgba(0,0,0,.2), 0 8px 24px rgba(0,0,0,.16);
    }
  }
  :root[data-theme='dark'] {
    color-scheme: dark;
    --bg: #090d16; --surface: #111827; --surface-2: #182234; --surface-3: #253249;
    --text: #f1f5f9; --text-2: #cbd5e1; --muted: #94a3b8; --border: #293548;
    --accent: #818cf8; --accent-2: #a78bfa; --accent-soft: #222447;
    --green: #6ee7b7; --green-bg: #082c27; --amber: #fcd34d; --amber-bg: #32280d;
    --rose: #fda4af; --rose-bg: #35131e; --shadow: 0 1px 2px rgba(0,0,0,.2), 0 8px 24px rgba(0,0,0,.16);
  }
  :root[data-theme='light'] { color-scheme: light; }
  html, body, #root { min-height: 100%; margin: 0; }
  body { background: var(--bg); color: var(--text); font: 14px/1.5 var(--sans); -webkit-font-smoothing: antialiased; }
  button, input { font: inherit; }
  button { color: inherit; }
  button:focus-visible, input:focus-visible, [role='button']:focus-visible, a:focus-visible, summary:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 52%, transparent); outline-offset: 2px;
  }
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .topbar { height: 68px; padding: 0 max(24px, calc((100vw - 1120px)/2)); display:flex; align-items:center; justify-content:space-between; gap:16px; position:sticky; top:0; z-index:5; background:color-mix(in srgb,var(--bg) 84%,transparent); border-bottom:1px solid color-mix(in srgb,var(--border) 78%,transparent); backdrop-filter:blur(16px); }
  .brand { display:flex; align-items:center; gap:11px; min-width:0; }
  .brand-mark { width:36px; height:36px; display:grid; place-items:center; border-radius:11px; color:white; background:linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow:0 4px 10px #6366f133; }
  .brand-title { font-size:14px; font-weight:650; letter-spacing:-.02em; }
  .brand-sub { color:var(--muted); font-size:11px; margin-top:1px; }
  .header-actions { display:flex; align-items:center; gap:12px; }
  .status { display:inline-flex; align-items:center; gap:7px; border:1px solid var(--border); color:var(--text-2); background:var(--surface); border-radius:999px; padding:6px 10px; font-size:12px; font-weight:500; }
  .status-dot { width:7px; height:7px; border-radius:50%; background:var(--muted); }
  .status.online .status-dot { background:#10b981; box-shadow:0 0 0 3px #10b98120; }
  .status.error .status-dot { background:#f43f5e; }
  .icon-btn { width:40px; height:40px; border:1px solid var(--border); background:var(--surface); border-radius:11px; display:grid; place-items:center; cursor:pointer; transition:background .18s,border-color .18s; }
  .icon-btn:hover { background:var(--surface-2); }
  .main { width:min(100% - 40px, 960px); margin:0 auto; padding:66px 0 72px; flex:1; }
  .hero { text-align:center; margin:0 auto 36px; position:relative; }
  .hero:before { content:''; pointer-events:none; position:absolute; z-index:-1; width:560px; max-width:90vw; height:250px; top:-100px; left:50%; transform:translateX(-50%); background:radial-gradient(ellipse,color-mix(in srgb,var(--accent) 12%,transparent),transparent 68%); filter:blur(14px); }
  .eyebrow { display:inline-flex; align-items:center; gap:8px; color:var(--text-2); font-size:12px; font-weight:600; letter-spacing:.03em; margin-bottom:14px; }
  .eyebrow-mark { width:7px; height:7px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent-2)); }
  h1 { font-size:clamp(34px,5.2vw,52px); line-height:1.08; letter-spacing:-.055em; font-weight:700; margin:0; }
  .gradient-text { color:var(--accent); background:linear-gradient(100deg,#6366f1 12%,#8b5cf6 80%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
  .hero-copy { color:var(--muted); font-size:15px; max-width:550px; margin:15px auto 25px; line-height:1.7; }
  .steps { display:flex; align-items:center; justify-content:center; gap:11px; color:var(--muted); font-size:11px; font-weight:600; }
  .step { display:flex; align-items:center; gap:7px; }
  .step-num { width:22px; height:22px; display:grid; place-items:center; border-radius:50%; background:var(--surface); border:1px solid var(--border); font:10px var(--mono); color:var(--text-2); }
  .step-line { width:25px; height:1px; background:var(--border); }
  .panel { background:var(--surface); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); overflow:hidden; }
  .panel-head { display:flex; align-items:center; gap:12px; padding:19px 22px; border-bottom:1px solid var(--border); }
  .panel-icon { display:grid; place-items:center; width:34px; height:34px; border:1px solid var(--border); color:var(--accent); border-radius:10px; background:var(--surface-2); }
  .panel-heading { font-size:14px; font-weight:650; }
  .panel-description { color:var(--muted); font-size:12px; margin-top:2px; }
  .panel-body { padding:22px; }
  .dropzone { min-height:220px; border:1px dashed var(--border); border-radius:13px; background:var(--bg); display:flex; align-items:center; justify-content:center; text-align:center; padding:28px 18px; cursor:pointer; transition:border-color .18s,background .18s,transform .18s; }
  .dropzone:hover,.dropzone:focus-visible,.dropzone.dragging { border-color:var(--accent); background:var(--accent-soft); }
  .dropzone.dragging { transform:scale(1.008); border-style:solid; }
  .drop-content { width:100%; }
  .drop-icon { width:50px; height:50px; display:grid; place-items:center; margin:0 auto 13px; background:var(--accent-soft); color:var(--accent); border-radius:15px; }
  .drop-title { font-size:15px; font-weight:600; }
  .drop-hint { margin-top:5px; font-size:12px; color:var(--muted); }
  .selected-file { display:flex; justify-content:center; }
  .file-chip { display:inline-flex; align-items:center; gap:9px; margin-top:13px; max-width:min(100%,440px); padding:5px 7px 5px 11px; border:1px solid var(--border); background:var(--surface); border-radius:11px; text-align:left; }
  .file-chip-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:550; }
  .file-chip-size { flex:none; color:var(--muted); font:10px var(--mono); }
  .remove-file { border:0; background:transparent; border-radius:7px; width:30px; height:30px; display:grid; place-items:center; color:var(--muted); cursor:pointer; flex:none; }
  .remove-file:hover { color:var(--rose); background:var(--rose-bg); }
  .button { min-height:44px; padding:0 16px; border:1px solid var(--border); border-radius:10px; background:var(--surface); color:var(--text-2); display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; font-size:13px; font-weight:600; cursor:pointer; transition:transform .16s,box-shadow .16s,background .16s; white-space:nowrap; }
  .button:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(15,23,42,.09); }
  .button:disabled { opacity:.5; cursor:not-allowed; }
  .button-primary { border:0; color:white; background:linear-gradient(105deg,#6366f1,#8b5cf6); box-shadow:0 4px 10px #6366f126; }
  .button-primary:hover:not(:disabled) { box-shadow:0 7px 18px #6366f14d; }
  .button-wide { width:100%; margin-top:16px; }
  .help { border-top:1px solid var(--border); margin-top:19px; padding-top:16px; }
  .help summary { color:var(--text-2); font-size:12px; font-weight:550; cursor:pointer; }
  .help-content { color:var(--muted); font-size:12px; margin:10px 0 0; line-height:1.7; }
  .processing { text-align:center; padding:27px 12px 5px; }
  .processing-icon { width:43px; height:43px; display:grid; place-items:center; margin:0 auto 12px; background:var(--accent-soft); color:var(--accent); border-radius:13px; animation:pulse 1.7s ease-in-out infinite; }
  .processing-title { font-weight:650; font-size:14px; }
  .processing-copy { color:var(--muted); font-size:12px; margin-top:4px; }
  .progress-track { max-width:360px; height:6px; margin:17px auto 8px; border-radius:99px; background:var(--surface-3); overflow:hidden; }
  .progress-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg,#6366f1,#a78bfa); transition:width .2s; }
  .progress-fill.complete { position:relative; overflow:hidden; }
  .progress-fill.complete:after { content:''; position:absolute; inset:0; background:linear-gradient(100deg,transparent 20%,#ffffff99 50%,transparent 80%); background-size:200% 100%; animation:shimmer 1.3s linear infinite; }
  .progress-caption { font:10px var(--mono); color:var(--muted); }
  .cancel-button { min-height:40px; margin-top:13px; padding:0 12px; font-size:12px; }
  .alert { display:flex; align-items:flex-start; gap:10px; border:1px solid color-mix(in srgb,var(--rose) 25%,var(--border)); color:var(--rose); background:var(--rose-bg); padding:12px 14px; border-radius:11px; font-size:12px; margin-top:14px; }
  .results { animation:appear .3s ease both; }
  .results-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:19px; }
  .results-title { font-size:21px; font-weight:680; letter-spacing:-.035em; }
  .results-sub { color:var(--muted); font-size:12px; margin-top:3px; }
  .actions { display:flex; align-items:center; gap:9px; }
  .stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:14px; }
  .stat { min-height:118px; padding:16px; background:var(--surface); border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow); }
  .stat-top { display:flex; align-items:center; justify-content:space-between; color:var(--muted); font-size:11px; font-weight:550; }
  .stat-icon { width:29px; height:29px; display:grid; place-items:center; color:var(--accent); background:var(--accent-soft); border-radius:9px; }
  .stat-value { font:600 25px/1.2 var(--mono); letter-spacing:-.06em; margin-top:15px; font-variant-numeric:tabular-nums; }
  .stat-note { color:var(--muted); font-size:10px; margin-top:4px; }
  .distribution { padding:18px 20px; margin:0 0 14px; }
  .section-title { font-size:13px; font-weight:650; }
  .section-copy { color:var(--muted); font-size:11px; margin-top:3px; }
  .band-track { display:flex; overflow:hidden; gap:3px; height:10px; margin:16px 0 12px; border-radius:99px; background:var(--surface-2); }
  .band-segment { min-width:2px; transition:width .3s; }
  .band-legend { display:flex; flex-wrap:wrap; gap:10px 18px; }
  .legend-item { display:flex; align-items:center; gap:6px; color:var(--text-2); font-size:10px; }
  .legend-dot { width:8px; height:8px; border-radius:3px; }
  .table-panel { overflow:hidden; }
  .table-tools { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:15px 18px; border-bottom:1px solid var(--border); }
  .search-box { display:flex; align-items:center; gap:8px; width:min(100%,310px); height:40px; padding:0 11px; border:1px solid var(--border); border-radius:9px; color:var(--muted); background:var(--bg); }
  .search-box input { width:100%; border:0; outline:0; color:var(--text); background:transparent; font-size:12px; }
  .search-box input::placeholder { color:var(--muted); }
  .row-count { color:var(--muted); font-size:11px; white-space:nowrap; }
  .table-wrap { overflow:auto; max-height:520px; }
  table { border-collapse:separate; border-spacing:0; width:100%; min-width:660px; font-size:12px; text-align:left; }
  thead th { position:sticky; top:0; z-index:1; color:var(--muted); background:var(--surface-2); border-bottom:1px solid var(--border); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.065em; }
  th,td { padding:12px 15px; }
  tbody tr { background:var(--surface); transition:background .14s; }
  tbody tr:nth-child(even) { background:color-mix(in srgb,var(--surface-2) 42%,var(--surface)); }
  tbody tr:hover { background:var(--accent-soft); }
  tbody td { border-bottom:1px solid var(--border); color:var(--text-2); }
  tbody tr:last-child td { border-bottom:0; }
  .sort-button { border:0; padding:4px 0; background:none; color:inherit; text-transform:inherit; letter-spacing:inherit; font-size:inherit; font-weight:inherit; cursor:pointer; }
  .name-cell { color:var(--text); font-weight:550; }
  .mono { font:11px var(--mono); font-variant-numeric:tabular-nums; }
  .sgpa-pill,.result-pill { display:inline-flex; align-items:center; min-height:24px; padding:2px 8px; border-radius:99px; font:10px var(--mono); font-variant-numeric:tabular-nums; }
  .sgpa-pill { color:var(--accent); background:var(--accent-soft); }
  .result-pill.pass { color:var(--green); background:var(--green-bg); }
  .result-pill.fail { color:var(--rose); background:var(--rose-bg); }
  .result-pill.neutral { color:var(--muted); background:var(--surface-2); }
  .empty-table { padding:35px 16px; color:var(--muted); text-align:center; }
  .toast { position:fixed; z-index:10; bottom:22px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:9px; max-width:calc(100% - 30px); padding:12px 16px; color:var(--text); background:var(--surface); border:1px solid var(--border); box-shadow:var(--shadow); border-radius:12px; font-size:12px; animation:appear .2s ease both; }
  .footer { text-align:center; padding:18px 20px 25px; color:var(--muted); font-size:11px; }
  @keyframes appear { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 50% { opacity:.55; transform:scale(.96); } }
  @keyframes shimmer { to { background-position:-200% 0; } }
  @media (max-width:700px) {
    .topbar { height:62px; padding:0 16px; }
    .brand-sub { display:none; }
    .main { width:min(100% - 28px,960px); padding:47px 0 55px; }
    .hero { margin-bottom:26px; }
    .hero-copy { font-size:13px; margin:12px auto 20px; }
    .panel-head { padding:16px; } .panel-body { padding:15px; }
    .dropzone { min-height:205px; }
    .stats { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
    .stat { min-height:106px; padding:13px; }
    .stat-value { font-size:22px; }
    .results-header { align-items:flex-start; flex-direction:column; }
    .actions { width:100%; }
    .actions .button { flex:1; }
    .table-tools { padding:12px; align-items:flex-start; flex-direction:column; }
    .search-box { width:100%; }
    .step-line { width:13px; }
  }
  @media (max-width:420px) {
    .main { width:calc(100% - 24px); padding-top:38px; }
    .topbar { padding:0 12px; }
    .status { padding:6px 8px; font-size:10px; gap:5px; }
    .header-actions { gap:7px; }
    h1 { font-size:35px; }
    .steps { gap:6px; font-size:10px; }
    .step { gap:5px; }
    .step-line { width:8px; }
    .step-num { width:20px; height:20px; }
    .results-title { font-size:19px; }
    .actions { flex-direction:column; }
    .actions .button { width:100%; }
    .stat-label { font-size:10px; }
  }
  @media (prefers-reduced-motion:reduce) {
    *,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; transition-duration:.01ms !important; }
  }
`

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    logo: <><path d="M6 4.8 12 2l6 2.8v6.4c0 4.6-3.2 7.7-6 9-2.8-1.3-6-4.4-6-9V4.8Z" /><path d="m9 11 2 2 4-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.7 13A8.5 8.5 0 0 1 11 3.3 8.5 8.5 0 1 0 20.7 13Z" />,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4" /><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    x: <path d="m18 6-12 12M6 6l12 12" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="m8.2 13-1.2 9 5-3 5 3-1.2-9" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    rotate: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    alert: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></>,
    spinner: <><path d="M12 3a9 9 0 1 0 9 9" /></>,
    csv: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h2m4 0h2M8 17h2m4 0h2" /></>,
  }
  return <svg {...common}>{paths[name] ?? null}</svg>
}

const formatSize = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(2)} MB`
const passValue = student => `${student.result ?? ''} ${student.pf ?? ''}`.trim()
const isPassing = student => {
  const outcome = passValue(student)
  return !/fail/i.test(outcome) && /pass/i.test(outcome)
}
const sgpaValue = student => student.sgpa === null || student.sgpa === undefined || student.sgpa === '' ? null : Number(student.sgpa)

function StatCard({ label, value, note, icon }) {
  return <div className="stat"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon name={icon} size={15} /></span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>
}

function Distribution({ students }) {
  const bands = [
    { label: 'Below 5.0', color: '#f43f5e', test: score => score < 5 },
    { label: '5.0–6.49', color: '#f59e0b', test: score => score >= 5 && score < 6.5 },
    { label: '6.5–7.99', color: '#38bdf8', test: score => score >= 6.5 && score < 8 },
    { label: '8.0–8.99', color: '#6366f1', test: score => score >= 8 && score < 9 },
    { label: '9.0+', color: '#10b981', test: score => score >= 9 },
  ]
  const counts = bands.map(band => students.filter(student => {
    const score = sgpaValue(student)
    return score !== null && Number.isFinite(score) && band.test(score)
  }).length)
  const total = counts.reduce((sum, count) => sum + count, 0)
  return (
    <section className="panel distribution" aria-label="SGPA distribution">
      <div className="section-title">SGPA distribution</div>
      <div className="section-copy">Student performance across score bands</div>
      <div className="band-track" role="img" aria-label={bands.map((band, index) => `${band.label}: ${counts[index]}`).join(', ')}>
        {bands.map((band, index) => counts[index] > 0 && <span key={band.label} className="band-segment" style={{ width: `${counts[index] / (total || 1) * 100}%`, background: band.color }} />)}
      </div>
      <div className="band-legend">{bands.map((band, index) => <div className="legend-item" key={band.label}><span className="legend-dot" style={{ background: band.color }} />{band.label}<span className="mono">{counts[index]}</span></div>)}</div>
    </section>
  )
}

function StudentTable({ students }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' })
  const shown = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return students.filter(student => [student.name, student.pr_number, student.seat_number, student.result, student.pf].some(value => String(value ?? '').toLowerCase().includes(normalized)))
      .sort((a, b) => {
        const left = a[sort.key] ?? ''
        const right = b[sort.key] ?? ''
        const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })
        return comparison * (sort.direction === 'asc' ? 1 : -1)
      })
  }, [students, query, sort])
  const changeSort = key => setSort(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
  const exportCsv = () => {
    const headers = ['Name', 'PR Number', 'Seat Number', 'SGPA', 'Result', 'P/F']
    const rows = shown.map(student => [student.name, student.pr_number, student.seat_number, student.sgpa, student.result, student.pf])
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'marksheet-results.csv'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const heading = (label, key) => <th scope="col"><button className="sort-button" aria-label={`Sort by ${label}`} aria-pressed={sort.key === key} onClick={() => changeSort(key)}>{label}{sort.key === key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</button></th>
  return (
    <section className="panel table-panel">
      <div className="table-tools">
        <label className="search-box"><Icon name="search" size={16} /><input aria-label="Search students" placeholder="Search name, PR number or seat…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="row-count" aria-live="polite">{shown.length} of {students.length} students</span>
          <button className="button" onClick={exportCsv}><Icon name="csv" size={15} />Export CSV</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>{heading('Student', 'name')}{heading('PR number', 'pr_number')}{heading('Seat no.', 'seat_number')}{heading('SGPA', 'sgpa')}{heading('Result', 'result')}</tr></thead>
          <tbody>
            {shown.length ? shown.map(student => {
              const resultText = passValue(student)
              const resultClass = /fail/i.test(resultText) ? 'fail' : resultText ? (isPassing(student) ? 'pass' : 'neutral') : 'neutral'
              const score = sgpaValue(student)
              return <tr key={`${student.pr_number}-${student.seat_number}`}><td className="name-cell">{student.name || '—'}</td><td className="mono">{student.pr_number || '—'}</td><td className="mono">{student.seat_number || '—'}</td><td><span className="sgpa-pill">{score !== null && Number.isFinite(score) ? score.toFixed(2) : '—'}</span></td><td><span className={`result-pill ${resultClass}`}>{resultText || '—'}</span></td></tr>
            }) : <tr><td className="empty-table" colSpan="5">{query ? 'No students match your search.' : 'No student records were returned.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function App() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [apiStatus, setApiStatus] = useState('unknown')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState('success')
  const [theme, setTheme] = useState(() => localStorage.getItem('marksheet-theme') || 'system')
  const inputRef = useRef(null)
  const xhrRef = useRef(null)
  const notify = (message, type = 'success') => { setToastType(type); setToast(message) }

  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('marksheet-theme', theme)
  }, [theme])
  useEffect(() => {
    let active = true
    fetch('/health').then(response => { if (active) setApiStatus(response.ok ? 'online' : 'error') }).catch(() => { if (active) setApiStatus('error') })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => () => xhrRef.current?.abort(), [])

  const pickFile = useCallback(candidate => {
    setError('')
    setResult(null)
    const extension = candidate.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls'].includes(extension)) {
      setFile(null)
      setError('Only .xlsx and .xls files are supported.')
      return
    }
    if (candidate.size > 16 * 1024 * 1024) {
      setFile(null)
      setError('This file is larger than the 16 MB upload limit.')
      return
    }
    setFile(candidate)
  }, [])
  const handleUpload = () => {
    if (!file) return
    setLoading(true)
    setProgress(0)
    setError('')
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr
    xhr.open('POST', '/upload')
    xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)) }
    xhr.onload = () => {
      xhrRef.current = null
      setLoading(false)
      let data
      try { data = JSON.parse(xhr.responseText) } catch { data = null }
      if (xhr.status < 200 || xhr.status >= 300) {
        const message = data?.detail || data?.error || 'The upload could not be processed. Please try again.'
        setError(message)
        notify(message, 'error')
        return
      }
      if (!data || !Array.isArray(data.students)) {
        const message = 'The server returned an unexpected response. Please try again.'
        setError(message)
        notify(message, 'error')
        return
      }
      setProgress(100)
      setResult(data)
      notify(`Successfully processed ${data.students_count ?? data.students.length} students.`)
    }
    xhr.onerror = () => {
      xhrRef.current = null
      setLoading(false)
      const message = 'Could not connect to the server. Check your connection and try again.'
      setError(message)
      notify(message, 'error')
    }
    xhr.onabort = () => {
      xhrRef.current = null
      setLoading(false)
      notify('Upload canceled.', 'neutral')
    }
    xhr.send(form)
  }
  const cancelUpload = () => xhrRef.current?.abort()
  const reset = () => { setFile(null); setResult(null); setError(''); setProgress(0); if (inputRef.current) inputRef.current.value = '' }
  const students = result?.students ?? []
  const sgpas = students.map(sgpaValue).filter(value => value !== null && Number.isFinite(value))
  const average = sgpas.length ? sgpas.reduce((sum, value) => sum + value, 0) / sgpas.length : null
  const highest = sgpas.length ? Math.max(...sgpas) : null
  const passing = students.filter(isPassing).length
  const themeToggle = () => setTheme(current => {
    const resolvedDark = current === 'dark' || (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    return resolvedDark ? 'light' : 'dark'
  })

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="topbar">
          <div className="brand"><span className="brand-mark"><Icon name="logo" size={21} /></span><div><div className="brand-title">Marksheet Parser</div><div className="brand-sub">Academic reports, simplified</div></div></div>
          <div className="header-actions">
            <span className={`status ${apiStatus}`} role="status"><span className="status-dot" />{apiStatus === 'online' ? 'API operational' : apiStatus === 'error' ? 'API unavailable' : 'Checking API'}</span>
            <button className="icon-btn" onClick={themeToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle color theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} /></button>
          </div>
        </header>
        <main className="main">
          <section className="hero">
            <h1>Turn marksheets into<br /><span className="gradient-text">clear insights.</span></h1>
            <p className="hero-copy">Upload a university marksheet to generate individual student reports and a downloadable results archive.</p>
            <div className="steps" aria-label="Upload, process, download"><span className="step"><span className="step-num">01</span>Upload</span><span className="step-line" /><span className="step"><span className="step-num">02</span>Process</span><span className="step-line" /><span className="step"><span className="step-num">03</span>Download</span></div>
          </section>

          {result ? <section className="results" aria-live="polite">
            <div className="results-header">
              <div><div className="results-title">Your report is ready</div><div className="results-sub">Processed {result.timestamp?.replace('_', ' ') ?? 'just now'} · {students.length} student records</div></div>
              <div className="actions"><button className="button" onClick={reset}><Icon name="rotate" size={15} />New upload</button><a className="button button-primary" href={result.download_url} download><Icon name="download" size={16} />Download ZIP</a></div>
            </div>
            <div className="stats">
              <StatCard label="Students" value={result.students_count ?? students.length} note="Records processed" icon="users" />
              <StatCard label="Average SGPA" value={average === null ? '—' : average.toFixed(2)} note={`${sgpas.length} scores available`} icon="chart" />
              <StatCard label="Highest SGPA" value={highest === null ? '—' : highest.toFixed(2)} note="Top score in this batch" icon="award" />
              <StatCard label="Pass count" value={students.some(student => passValue(student)) ? passing : '—'} note={students.some(student => passValue(student)) ? 'Students marked pass' : 'No result field available'} icon="check" />
            </div>
            <Distribution students={students} />
            <StudentTable students={students} />
          </section> : <section className="panel">
            <div className="panel-head"><span className="panel-icon"><Icon name="upload" size={17} /></span><div><div className="panel-heading">Upload marksheet</div><div className="panel-description">Choose an Excel file to get started</div></div></div>
            <div className="panel-body">
              <div className={`dropzone ${dragging ? 'dragging' : ''}`} role="button" tabIndex={0} aria-label="Choose or drop an Excel marksheet file" aria-describedby="upload-hint"
                onClick={() => inputRef.current?.click()}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click() } }}
                onDragOver={event => { event.preventDefault(); setDragging(true) }}
                onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }}
                onDrop={event => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files[0]) pickFile(event.dataTransfer.files[0]) }}>
                <input ref={inputRef} type="file" accept=".xlsx,.xls" hidden onChange={event => { if (event.target.files?.[0]) pickFile(event.target.files[0]) }} />
                <div className="drop-content"><span className="drop-icon"><Icon name="file" size={24} /></span>
                  <div className="drop-title">{file ? 'Your file is ready' : dragging ? 'Drop to add your file' : 'Drag and drop your marksheet'}</div>
                  <div className="drop-hint" id="upload-hint">or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>browse files</span> · Excel .xlsx or .xls · up to 16 MB</div>
                </div>
              </div>
              {file && <div className="selected-file"><div className="file-chip"><Icon name="file" size={16} /><span className="file-chip-name">{file.name}</span><span className="file-chip-size">{formatSize(file.size)}</span><button className="remove-file" aria-label="Remove selected file" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = '' }}><Icon name="x" size={16} /></button></div></div>}
              {error && <div className="alert" role="alert"><Icon name="alert" size={17} /><span>{error}</span></div>}
              {loading ? <div className="processing" role="status" aria-live="polite">
                <span className="processing-icon"><Icon name="spinner" size={21} /></span><div className="processing-title">Processing your marksheet</div><div className="processing-copy">{progress < 100 ? 'Uploading file…' : 'Generating student reports and building your ZIP…'}</div>
                <div className="progress-track"><div className={`progress-fill ${progress === 100 ? 'complete' : ''}`} style={{ width: `${progress}%` }} /></div><div className="progress-caption">{progress < 100 ? `${progress}% uploaded` : 'Upload complete · finishing reports'}</div>
                <button className="button cancel-button" onClick={cancelUpload}><Icon name="x" size={14} />Cancel upload</button>
              </div> : <button className="button button-primary button-wide" onClick={handleUpload} disabled={!file}><Icon name="upload" size={16} />{file ? 'Process marksheet' : 'Select a file to continue'}</button>}
              <details className="help"><summary>Expected format</summary><p className="help-content">Upload an Excel marksheet containing student identifiers (name, PR number, and seat number) and course or SGPA information. The parser detects the marksheet columns automatically. Both .xlsx and .xls files are supported.</p></details>
            </div>
          </section>}
        </main>
        <footer className="footer">Student Marksheet Parser <span aria-hidden="true">·</span> Shree Rayeshwar Institute of Engineering</footer>
        {toast && <div className="toast" role={toastType === 'error' ? 'alert' : 'status'} aria-live={toastType === 'error' ? 'assertive' : 'polite'}><span style={{ color: toastType === 'error' ? 'var(--rose)' : toastType === 'success' ? 'var(--green)' : 'var(--muted)' }}><Icon name={toastType === 'error' ? 'alert' : toastType === 'success' ? 'check' : 'x'} size={16} /></span>{toast}</div>}
      </div>
    </>
  )
}
