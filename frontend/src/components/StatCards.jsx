import Icon from './Icon.jsx'
import { isPassing, passValue, sgpaValue } from '../utils/students.js'

function StatCard({ label, value, note, icon }) {
  return <div className="stat"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon name={icon} size={15} /></span></div><div className="stat-value">{value}</div><small>{note}</small></div>
}

export default function StatCards({ result, students }) {
  const values = students.map(sgpaValue).filter(value => value !== null && Number.isFinite(value))
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  const highest = values.length ? Math.max(...values) : null
  const hasResults = students.some(passValue)
  return <div className="stats"><StatCard label="Students" value={result.students_count ?? students.length} note="Records processed" icon="users" /><StatCard label="Average SGPA" value={average === null ? '—' : average.toFixed(2)} note={`${values.length} scores available`} icon="chart" /><StatCard label="Highest SGPA" value={highest === null ? '—' : highest.toFixed(2)} note="Top score in this batch" icon="award" /><StatCard label="Pass count" value={hasResults ? students.filter(isPassing).length : '—'} note={hasResults ? 'Students marked pass' : 'No result field available'} icon="check" /></div>
}