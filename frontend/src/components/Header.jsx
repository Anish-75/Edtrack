import Icon from './Icon.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ apiStatus, theme, onThemeToggle }) {
  return <header className="topbar"><div className="brand"><span className="brand-mark"><Icon name="logo" size={21} /></span><div><strong>Marksheet Parser</strong><small>Academic reports, simplified</small></div></div><div className="header-actions"><span className={`status ${apiStatus}`} role="status"><b />{apiStatus === 'online' ? 'API operational' : apiStatus === 'error' ? 'API unavailable' : 'Checking API'}</span><ThemeToggle theme={theme} onToggle={onThemeToggle} /></div></header>
}