import Icon from './Icon.jsx'

export default function ThemeToggle({ theme, onToggle }) {
  return <button className="icon-btn" onClick={onToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle color theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} /></button>
}