import { useUIContext } from '../contexts/UIContext'
import { useT } from '../i18n'

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useUIContext()
  const t = useT()

  const label = t('toggle.language.toChinese')

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
