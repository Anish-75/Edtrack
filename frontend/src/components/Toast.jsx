import Icon from './Icon.jsx'

export default function Toast({ message, type }) {
  if (!message) return null
  return <div className="toast" role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}><span className={`toast-icon ${type}`}><Icon name={type === 'error' ? 'alert' : type === 'success' ? 'check' : 'x'} size={16} /></span>{message}</div>
}