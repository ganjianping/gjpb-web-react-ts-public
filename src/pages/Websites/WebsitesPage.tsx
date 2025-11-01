import { useEffect, useMemo, useState } from 'react'
import { getWebsites } from '../../shared/data/publicApi'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { WebsiteCard } from './WebsiteCard'
import { Pagination } from '../../shared/ui/Pagination'

const ITEMS_PER_PAGE = 60

const matchesSearch = (website: Website, search: string) => {
  if (!search) {
    return true
  }

  const text = search.toLowerCase()
  const haystacks = [
    website.name.toLowerCase(),
    website.tags.toLowerCase(),
    website.description.toLowerCase(),
  ]

  return haystacks.some((haystack) => haystack.includes(text))
}

export const WebsitesPage = () => {
  const { language, searchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const sectionTags = getTags('website_tags')

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, language])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getWebsites(0, 500)
        setItems(response.data.content)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load websites'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => item.lang === language)
        .filter((item) => matchesSearch(item, searchQuery)),
    [items, language, searchQuery],
  )

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages, setCurrentPage])

  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  const t = useT()

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">{t('websites.title')}</h1>
        <p className="page__subtitle">{t('websites.subtitle')}</p>
        {sectionTags.length > 0 ? (
          <div className="page__tags">
            {sectionTags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>
      {loading ? (
        <div className="status status--loading">
          <span>{t('loading')}</span>
        </div>
      ) : null}
      {error ? (
        <div className="status status--error">
          <span>{t('failed_to_load')}</span>
          <span className="status__message">{error}</span>
        </div>
      ) : null}
      {!loading && !error ? (
        <>
          <div className="grid grid--websites">
            {paginatedItems.map((item) => (
              <WebsiteCard key={item.id} website={item} />
            ))}
            {paginatedItems.length === 0 ? <div className="status status--empty">{t('websites.empty')}</div> : null}
          </div>
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
