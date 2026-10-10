import { sgpaValue } from '../utils/students.js'

const bands = [{ label: 'Below 5.0', color: '#f43f5e', test: score => score < 5 }, { label: '5.0–6.49', color: '#f59e0b', test: score => score >= 5 && score < 6.5 }, { label: '6.5–7.99', color: '#38bdf8', test: score => score >= 6.5 && score < 8 }, { label: '8.0–8.99', color: '#6366f1', test: score => score >= 8 && score < 9 }, { label: '9.0+', color: '#10b981', test: score => score >= 9 }]

export default function SgpaDistribution({ students }) {
  const counts = bands.map(band => students.filter(student => { const score = sgpaValue(student); return score !== null && Number.isFinite(score) && band.test(score) }).length)
  const total = counts.reduce((sum, count) => sum + count, 0)
  return <section className="panel distribution"><strong>SGPA distribution</strong><small>Student performance across score bands</small><div className="band-track" role="img" aria-label={bands.map((band, index) => `${band.label}: ${counts[index]}`).join(', ')}>{bands.map((band, index) => counts[index] > 0 && <span key={band.label} style={{ width: `${counts[index] / (total || 1) * 100}%`, background: band.color }} />)}</div><div className="band-legend">{bands.map((band, index) => <span key={band.label}><i style={{ background: band.color }} />{band.label} {counts[index]}</span>)}</div></section>
}