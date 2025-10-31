import { useMemo } from 'react'
import { useAppSettings } from '../contexts/AppSettingsContext'
import { useUIContext } from '../contexts/UIContext'

export const Footer = () => {
  const { getValue } = useAppSettings()
  const { language } = useUIContext()
  const company = getValue('app_company') ?? 'GJP Technology'
  const appName = getValue('app_name') ?? 'GJP Blog System'
  const appVersion = getValue('app_version') ?? '1.0.0'

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const copyLabel =
    language === 'ZH'
      ? `© ${currentYear} ${company} · ${appName} · 版本 ${appVersion}`
      : `© ${currentYear} ${company} · ${appName} · v${appVersion}`

  return (
    <footer className="site-footer">
      <p className="site-footer__text">{copyLabel}</p>
    </footer>
  )
}
