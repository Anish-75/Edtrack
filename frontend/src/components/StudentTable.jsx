import { useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import { isPassing, passValue, sgpaValue } from '../utils/students.js'

export default function StudentTable({ students }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' })
  const shown = useMemo(() => students.map((student, index) => ({ student, index })).filter(({ student }) => [student.name, student.pr_number, student.seat_number, student.result, student.pf].some(value => String(value ?? '').toLowerCase().includes(query.trim().toLowerCase()))).sort(({ student: a }, { student: b }) => {
    const left = sort.key === 'sgpa' ? sgpaValue(a) ?? -1 : a[sort.key] ?? ''
    const right = sort.key === 'sgpa' ? sgpaValue(b) ?? -1 : b[sort.key] ?? ''
    const compared = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })
    return compared * (sort.direction === 'asc' ? 1 : -1)
  }), [students, query, sort])
  const changeSort = key => setSort(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
  const exportCsv = () => {
    const rows = [['Name', 'PR Number', 'Seat Number', 'SGPA', 'Result', 'P/F'], ...shown.map(({ student }) => [student.name, student.pr_number, student.seat_number, sgpaValue(student), student.result, student.pf])]
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'marksheet-results.csv'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const heading = (text, key) => <th scope="col"><button className="sort-button" aria-label={`Sort by ${text}`} aria-pressed={sort.key === key} onClick={() => changeSort(key)}>{text}{sort.key === key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</button></th>
  return <section className="panel table-panel"><div className="table-tools"><label className="search-box"><Icon name="search" size={16} /><input aria-label="Search students" placeholder="Search name, PR number or seat…" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="table-actions"><small>{shown.length} of {students.length} students</small><button className="button" onClick={exportCsv}><Icon name="csv" size={15} />Export CSV</button></div></div><div className="table-wrap"><table><thead><tr>{heading('Student', 'name')}{heading('PR number', 'pr_number')}{heading('Seat no.', 'seat_number')}{heading('SGPA', 'sgpa')}{heading('Result', 'result')}</tr></thead><tbody>{shown.length ? shown.map(({ student, index }) => { const text = passValue(student); const color = /fail/i.test(text) ? 'fail' : text && isPassing(student) ? 'pass' : 'neutral'; const score = sgpaValue(student); return <tr key={`${student.pr_number}-${index}`}><td className="name-cell">{student.name || '—'}</td><td>{student.pr_number || '—'}</td><td>{student.seat_number || '—'}</td><td><span className="sgpa-pill">{score !== null && Number.isFinite(score) ? score.toFixed(2) : '—'}</span></td><td><span className={`result-pill ${color}`}>{text || '—'}</span></td></tr> }) : <tr><td className="empty-table" colSpan="5">{query ? 'No students match your search.' : 'No student records were returned.'}</td></tr>}</tbody></table></div></section>
}