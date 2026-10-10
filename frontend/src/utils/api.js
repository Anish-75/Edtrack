const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

export function apiUrl(path) {
  if (/^https?:\/\//i.test(path) || !apiBase) return path
  return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`
}

export function apiHeaders() {
  const key = import.meta.env.VITE_API_KEY
  return key ? { 'X-API-Key': key } : {}
}

export function uploadError(data, response) {
  if (response.status === 429) return 'Too many uploads in a short time. Please wait a minute and try again.'
  const detail = data?.detail
  if (Array.isArray(detail)) {
    const message = detail.map(item => typeof item === 'string' ? item : item?.msg ?? item?.message).filter(Boolean).join(' ')
    if (message) return message
  }
  return (typeof detail === 'string' ? detail : data?.error) || response.statusText || 'The upload could not be processed. Please try again.'
}