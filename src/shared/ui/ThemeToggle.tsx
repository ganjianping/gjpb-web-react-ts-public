import { useUIContext } from '../contexts/UIContext'

export const ThemeToggle = () => {
  const { theme, toggleTheme, language } = useUIContext()
  const isDark = theme === 'dark'

  let label = ''
  if (isDark) {
    label = language === 'ZH' ? '切换到日间' : 'Switch to light'
  } else {
    label = language === 'ZH' ? '切换到夜间' : 'Switch to dark'
  }

  return (
    <button
      className="toggle-button toggle-button--icon"
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        // Sun icon for light mode (when currently dark)
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon icon for dark mode (when currently light)
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  )
}
