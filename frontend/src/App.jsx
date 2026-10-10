import { useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import ResultsView from './components/ResultsView.jsx'
import Toast from './components/Toast.jsx'
import UploadCard from './components/UploadCard.jsx'
import useApiHealth from './hooks/useApiHealth.js'
import { apiHeaders, apiUrl, uploadError } from './utils/api.js'

export default function App() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState('success')
  const [theme, setTheme] = useState(() => localStorage.getItem('marksheet-theme') || 'system')
  const inputRef = useRef(null)
  const controllerRef = useRef(null)
  const apiStatus = useApiHealth()
  const notify = (message, type = 'success') => { setToastType(type); setToast(message) }

  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('marksheet-theme', theme)
  }, [theme])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => () => controllerRef.current?.abort(), [])

  const pickFile = candidate => {
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
  }

  const handleUpload = async () => {
    if (!file) return
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    setProgress(0)
    setError('')
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const response = await fetch(apiUrl('/upload'), { method: 'POST', body: form, headers: apiHeaders(), signal: controller.signal })
      let data
      try { data = await response.json() } catch { data = null }
      if (!response.ok) throw new Error(uploadError(data, response))
      if (!data || !Array.isArray(data.students)) throw new Error('The server returned an unexpected response. Please try again.')
      setProgress(100)
      setResult(data)
      notify(`Successfully processed ${data.students_count ?? data.students.length} students.`)
    } catch (cause) {
      if (controller.signal.aborted) {
        notify('Upload canceled.', 'neutral')
      } else {
        const message = cause instanceof TypeError ? 'Could not connect to the server. Check your connection and try again.' : cause.message || 'The upload could not be processed. Please try again.'
        setError(message)
        notify(message, 'error')
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
      setLoading(false)
    }
  }

  const cancelUpload = () => controllerRef.current?.abort()
  const downloadResults = async () => {
    if (!result?.download_url) return
    try {
      const response = await fetch(apiUrl(result.download_url), { headers: apiHeaders() })
      if (!response.ok) throw new Error(response.statusText || 'The download is unavailable. It may have expired; process the marksheet again.')
      const url = URL.createObjectURL(await response.blob())
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'marksheet-results.zip'
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (cause) {
      const message = cause instanceof TypeError ? 'Could not connect to the server to download the ZIP.' : cause.message
      notify(message, 'error')
    }
  }
  const reset = () => { setFile(null); setResult(null); setError(''); setProgress(0); if (inputRef.current) inputRef.current.value = '' }
  const themeToggle = () => setTheme(current => {
    const dark = current === 'dark' || (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    return dark ? 'light' : 'dark'
  })

  return <div className="app">
    <Header apiStatus={apiStatus} theme={theme} onThemeToggle={themeToggle} />
    <main className="main">
      <section className="hero"><h1>Turn marksheets into<br /><span className="gradient-text">clear insights.</span></h1><p className="hero-copy">Upload a university marksheet to generate individual student reports and a downloadable results archive.</p><div className="steps" aria-label="Upload, process, download"><span>01&nbsp; Upload</span><i /><span>02&nbsp; Process</span><i /><span>03&nbsp; Download</span></div></section>
      {result ? <ResultsView result={result} onReset={reset} onDownload={downloadResults} /> : <UploadCard file={file} dragging={dragging} loading={loading} progress={progress} error={error} inputRef={inputRef} onPickFile={pickFile} onSetDragging={setDragging} onRemoveFile={() => { setFile(null); if (inputRef.current) inputRef.current.value = '' }} onUpload={handleUpload} onCancel={cancelUpload} />}
    </main>
    <footer className="footer">Student Marksheet Parser</footer>
    <Toast message={toast} type={toastType} />
  </div>
}