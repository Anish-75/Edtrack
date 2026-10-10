import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from '../utils/api.js'

export default function useApiHealth() {
  const [status, setStatus] = useState('unknown')
  const checkHealth = useCallback(() => {
    fetch(apiUrl('/health'))
      .then(response => setStatus(response.ok ? 'online' : 'error'))
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = window.setInterval(checkHealth, 30_000)
    window.addEventListener('focus', checkHealth)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', checkHealth)
    }
  }, [checkHealth])

  return status
}