import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getWebsites } from '../../shared/data/publicApi'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { useT } from '../../shared/i18n'
import { Pagination } from '../../shared/ui/Pagination'
import { WebsiteCard } from './components/WebsiteCard'
import WebsiteToolbar from './components/WebsiteToolbar'
import './websites.css'

const ITEMS_PER_PAGE = 60

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (website: Website, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [website.name, website.description ?? '', website.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (website: Website, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (website.tags ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const WebsitesPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const sectionTags = getTags('website_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getWebsites(0, 500)
        setItems(response.data.content)
      } catch (err) {
        const message = err instanceof Error ? err.message : failedLabel
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [failedLabel])

  useEffect(() => {
    setCurrentPage(1)
  }, [language])

  const filteredItems = useMemo(
    () => {
      const trimmedQuery = searchQuery.trim()
      return items
        .filter((item) => item.lang === language)
        .filter((item) => matchesSearch(item, trimmedQuery))
        .filter((item) => hasTag(item, selectedTag))
    },
    [items, language, searchQuery, selectedTag],
  )

  const sortedItems = useMemo(() => {
    const base = [...filteredItems]

    switch (sortOrder) {
      case 'displayOrder':
        base.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        break
      case 'alpha':
        base.sort((a, b) => a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }))
        break
      case 'recent':
        base.sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? '').getTime()
          const bTime = new Date(b.updatedAt ?? '').getTime()
          return Number.isNaN(bTime - aTime) ? 0 : bTime - aTime
        })
        break
      default:
        // fallback to displayOrder
        base.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        break
    }

    return base
  }, [filteredItems, language, sortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / ITEMS_PER_PAGE))
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedItems = sortedItems.slice(startIndex, endIndex)

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  

  // Toolbar state moved to WebsiteToolbar component

  const skeletonItems = Array.from({ length: 8 }, (_, index) => index)

  return (
    <section className="page">
      <WebsiteToolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {loading ? (
        <div className="grid grid--websites">
          {skeletonItems.map((item) => (
            <div key={item} className="card website-card website-card--skeleton" aria-hidden="true">
              <div className="website-card__layout">
                <div className="website-card__logo">
                  <div className="skeleton skeleton--image" />
                </div>
                <div className="website-card__content">
                  <div className="skeleton skeleton--line skeleton--line-lg" />
                  <div className="website-card__tags skeleton skeleton--line skeleton--line-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
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
          </div>
          {paginatedItems.length === 0 ? <div className="status status--empty">{t('websites.empty')}</div> : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
