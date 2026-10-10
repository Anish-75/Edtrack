import Icon from './Icon.jsx'
import SgpaDistribution from './SgpaDistribution.jsx'
import StatCards from './StatCards.jsx'
import StudentTable from './StudentTable.jsx'
import { formatTimestamp } from '../utils/formatters.js'

export default function ResultsView({ result, onReset, onDownload }) {
  const students = result.students ?? []
  return <section className="results" aria-live="polite"><div className="results-header"><div><strong>Your report is ready</strong><small>Processed {formatTimestamp(result.timestamp)} · {students.length} student records</small></div><div className="actions"><button className="button" onClick={onReset}><Icon name="rotate" size={15} />New upload</button><button className="button button-primary" onClick={onDownload}><Icon name="download" size={16} />Download ZIP</button></div></div><StatCards result={result} students={students} /><SgpaDistribution students={students} /><StudentTable students={students} /></section>
}