import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAppSettings } from '../data/publicApi'
import type { AppSetting } from '../data/types'
import { useUIContext, type LanguageCode } from './UIContext'

interface AppSettingsContextValue {
  settings: AppSetting[]
  loading: boolean
  error: string | null
  getValue: (name: string, lang?: LanguageCode) => string | undefined
  getValues: (name: string) => Partial<Record<LanguageCode, string>>
  getTags: (name: string, lang?: LanguageCode) => string[]
  reload: () => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useUIContext()
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAppSettings()
      setSettings(response.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load app settings'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const groupedSettings = useMemo(() => {
    const groups = new Map<string, Map<LanguageCode, string>>()

    settings.forEach((setting) => {
      if (!groups.has(setting.name)) {
        groups.set(setting.name, new Map())
      }

      groups.get(setting.name)?.set(setting.lang, setting.value)
    })

    return groups
  }, [settings])

  const getValue = useCallback(
    (name: string, lang: LanguageCode = language) => groupedSettings.get(name)?.get(lang),
    [groupedSettings, language],
  )

  const getValues = useCallback(
    (name: string) => {
      const map = groupedSettings.get(name)

      if (!map) {
        return {}
      }

      const result: Partial<Record<LanguageCode, string>> = {}
      map.forEach((value, langKey) => {
        result[langKey] = value
      })
      return result
    },
    [groupedSettings],
  )

  const getTags = useCallback(
    (name: string, lang: LanguageCode = language) => {
      const value = getValue(name, lang)

      if (!value) {
        return []
      }

      return value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    },
    [getValue, language],
  )

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      getValue,
      getValues,
      getTags,
      reload: loadSettings,
    }),
    [settings, loading, error, getValue, getValues, getTags, loadSettings],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext)

  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }

  return context
}
