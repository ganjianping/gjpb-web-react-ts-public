import { useUIContext } from '../contexts/UIContext'

export const ThemeToggle = () => {
  const { theme, toggleTheme, language } = useUIContext()
  const isDark = theme === 'dark'

  const label = isDark ? (language === 'ZH' ? '夜间模式' : 'Dark mode') : language === 'ZH' ? '日间模式' : 'Light mode'

  return (
    <button className="toggle-button" type="button" onClick={toggleTheme} aria-label={label}>
      <span className="toggle-button__label">{label}</span>
    </button>
  )
}
