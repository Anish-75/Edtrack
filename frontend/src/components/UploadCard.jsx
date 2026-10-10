import Icon from './Icon.jsx'
import ProcessingState from './ProcessingState.jsx'
import { formatSize } from '../utils/formatters.js'

export default function UploadCard({ file, dragging, loading, progress, error, inputRef, onPickFile, onSetDragging, onRemoveFile, onUpload, onCancel }) {
  return <section className="panel"><div className="panel-head"><span className="panel-icon"><Icon name="upload" /></span><div><strong>Upload marksheet</strong><small>Choose an Excel file to get started</small></div></div><div className="panel-body">
    <div className={`dropzone ${dragging ? 'dragging' : ''}`} role="button" tabIndex={0} aria-label="Choose or drop an Excel marksheet file" onClick={() => inputRef.current?.click()} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click() } }} onDragOver={event => { event.preventDefault(); onSetDragging(true) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) onSetDragging(false) }} onDrop={event => { event.preventDefault(); onSetDragging(false); if (event.dataTransfer.files[0]) onPickFile(event.dataTransfer.files[0]) }}>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" hidden onChange={event => { const candidate = event.target.files?.[0]; event.target.value = ''; if (candidate) onPickFile(candidate) }} /><span className="drop-icon"><Icon name="file" size={24} /></span><strong>{file ? 'Your file is ready' : dragging ? 'Drop to add your file' : 'Drag and drop your marksheet'}</strong><p>or <em>browse files</em> · Excel .xlsx or .xls · up to 16 MB</p>
    </div>
    {file && <div className="file-chip"><Icon name="file" size={16} /><span>{file.name}</span><small>{formatSize(file.size)}</small><button className="remove-file" aria-label="Remove selected file" onClick={onRemoveFile}><Icon name="x" size={16} /></button></div>}
    {error && <div className="alert" role="alert"><Icon name="alert" size={17} />{error}</div>}
    {loading ? <ProcessingState progress={progress} onCancel={onCancel} /> : <button className="button button-primary button-wide" onClick={onUpload} disabled={!file}><Icon name="upload" size={16} />{file ? 'Process marksheet' : 'Select a file to continue'}</button>}
    <details className="help"><summary>Expected format</summary><p>Upload an Excel marksheet with student identifiers and course or SGPA information. Both .xlsx and .xls files are supported.</p></details>
  </div></section>
}