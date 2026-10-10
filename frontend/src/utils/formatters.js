export const formatSize = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(2)} MB`

export function formatTimestamp(value) {
  if (!value) return 'just now'
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/)
  if (!match) return value
  const [, year, month, day, hour, minute, second] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}