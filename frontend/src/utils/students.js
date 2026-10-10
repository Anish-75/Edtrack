export const passValue = student => `${student.result ?? ''} ${student.pf ?? ''}`.trim()
export const isPassing = student => { const outcome = passValue(student); return !/fail/i.test(outcome) && /pass/i.test(outcome) }
export const sgpaValue = student => {
  const value = Number(student.sgpa)
  if (student.sgpa !== null && student.sgpa !== undefined && student.sgpa !== '' && Number.isFinite(value)) return value
  const fallback = String(student.overall_grade ?? '').match(/-?\d+(?:\.\d+)?/)?.[0]
  return fallback === undefined ? null : Number(fallback)
}