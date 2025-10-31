import { useUIContext } from '../contexts/UIContext'

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useUIContext()

  const label = language === 'ZH' ? '切换为英文' : 'Switch to Chinese'

  return (
    <button className="toggle-button" type="button" onClick={toggleLanguage} aria-label={label}>
      <span className="toggle-button__label">{language === 'ZH' ? '中文' : 'English'}</span>
    </button>
  )
}
