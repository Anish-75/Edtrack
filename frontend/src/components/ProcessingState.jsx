import Icon from './Icon.jsx'

export default function ProcessingState({ progress, onCancel }) {
  const complete = progress === 100
  return <div className="processing" role="status" aria-live="polite"><span className="processing-icon"><Icon name="spinner" size={21} /></span><strong>Processing your marksheet</strong><p>{complete ? 'Generating student reports and building your ZIP…' : 'Uploading file and preparing student reports…'}</p><div className="progress-track"><div className={`progress-fill ${complete ? '' : 'indeterminate'}`} style={{ width: complete ? '100%' : '34%' }} /></div><small>{complete ? 'Upload complete · finishing reports' : 'Upload and report generation in progress'}</small><button className="button cancel-button" onClick={onCancel}><Icon name="x" size={14} />Cancel upload</button></div>
}