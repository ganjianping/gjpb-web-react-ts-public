import { useUIContext } from '../contexts/UIContext'

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useUIContext()

  const label = language === 'ZH' ? '切换为英文' : 'Switch to Chinese'

  return (
    <button
      className="toggle-button toggle-button--icon"
      type="button"
      onClick={toggleLanguage}
      aria-label={label}
      title={label}
    >
      <span className="lang-badge" aria-hidden>
        {language === 'ZH' ? '中' : 'EN'}
      </span>
    </button>
  )
}
