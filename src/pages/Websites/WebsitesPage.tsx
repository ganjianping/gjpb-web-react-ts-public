import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { getWebsites } from '../../shared/data/publicApi'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { useT } from '../../shared/i18n'
import { Pagination } from '../../shared/ui/Pagination'
import { WebsiteCard } from './WebsiteCard'

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

type SortOrder = 'featured' | 'alpha' | 'recent'

export const WebsitesPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured')
  const sectionTags = getTags('website_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')
  const [showSearch, setShowSearch] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const actionsRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

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
      case 'featured':
      default:
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

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOrder)
    setCurrentPage(1)
  }

  const toggleSearch = () => {
    setShowSearch((s) => !s)
  }

  const toggleSortMenu = () => {
    setShowSortMenu((s) => !s)
  }

  // Close inline menus when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (actionsRef.current && !actionsRef.current.contains(target)) {
        setShowSortMenu(false)
        setShowSearch(false)
      }
    }

    if (showSortMenu || showSearch) {
      document.addEventListener('click', onDocClick)
      return () => document.removeEventListener('click', onDocClick)
    }
    return undefined
  }, [showSortMenu, showSearch])

  // focus search input when opened
  useEffect(() => {
    if (showSearch) {
      // next tick so input is in DOM
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }
  }, [showSearch])

  const skeletonItems = Array.from({ length: 8 }, (_, index) => index)

  return (
    <section className="page">
      <div className="websites-toolbar">
        <div className="websites-toolbar__search">
          <svg
            className="websites-toolbar__search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="m20 20-3.5-3.5M16 10.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            className="websites-toolbar__search-input"
            type="search"
            value={searchQuery}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            onChange={handleSearchChange}
          />
          {searchQuery ? (
            <button type="button" className="websites-toolbar__clear" onClick={handleClearSearch} aria-label={t('websites.search_clear')}>
              ×
            </button>
          ) : null}
        </div>
        
          <div className="websites-toolbar__tags-wrapper">
            {sectionTags.length > 0 ? (
              <div className="websites-toolbar__tags" aria-label={t('websites.tags_filter')}>
                <button
                  type="button"
                  className={`chip${selectedTag === null ? ' chip--active' : ''}`}
                  onClick={() => handleSelectTag(null)}
                >
                  {t('websites.filters.all')}
                </button>
                {sectionTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`chip${selectedTag === tag ? ' chip--active' : ''}`}
                    onClick={() => handleSelectTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="websites-toolbar__actions" ref={actionsRef}>
              {/* inline search toggle + input */}
              <div className="websites-inline-search">
                <button type="button" aria-label={t('search.placeholder')} className="toolbar-icon-button" onClick={toggleSearch}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="m20 20-3.5-3.5M16 10.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showSearch ? (
                  <div className="websites-inline-search__box">
                    <input
                      ref={searchInputRef}
                      className="websites-toolbar__search-input"
                      type="search"
                      value={searchQuery}
                      placeholder={t('search.placeholder')}
                      aria-label={t('search.placeholder')}
                      onChange={handleSearchChange}
                    />
                    {searchQuery ? (
                      <button type="button" className="websites-toolbar__clear" onClick={handleClearSearch} aria-label={t('websites.search_clear')}>
                        ×
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* sort toggle + menu */}
              <div className="websites-sort-menu">
                <button type="button" aria-label={t('websites.sort_label')} className="toolbar-icon-button" onClick={toggleSortMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showSortMenu ? (
                  <div className="sort-menu" role="menu">
                    <button type="button" className={`sort-menu__item${sortOrder === 'featured' ? ' active' : ''}`} onClick={() => { setSortOrder('featured'); setShowSortMenu(false); }}>
                      {t('websites.sort.featured')}
                    </button>
                    <button type="button" className={`sort-menu__item${sortOrder === 'alpha' ? ' active' : ''}`} onClick={() => { setSortOrder('alpha'); setShowSortMenu(false); }}>
                      {t('websites.sort.alpha')}
                    </button>
                    <button type="button" className={`sort-menu__item${sortOrder === 'recent' ? ' active' : ''}`} onClick={() => { setSortOrder('recent'); setShowSortMenu(false); }}>
                      {t('websites.sort.recency')}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

      {loading ? (
        <div className="grid grid--websites">
          {skeletonItems.map((item) => (
            <div key={item} className="card website-card website-card--skeleton" aria-hidden="true">
              <div className="website-card__header">
                <div className="website-card__logo skeleton" />
                <div className="website-card__meta">
                  <div className="skeleton skeleton--line skeleton--line-lg" />
                  <div className="skeleton skeleton--line skeleton--line-sm" />
                </div>
              </div>
              <div className="website-card__description">
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line skeleton--line-sm" />
              </div>
              <div className="website-card__footer">
                <div className="website-card__tags">
                  <span className="skeleton skeleton--pill" />
                  <span className="skeleton skeleton--pill" />
                  <span className="skeleton skeleton--pill skeleton--pill-sm" />
                </div>
                <div className="skeleton skeleton--button" />
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
