import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getArticles } from '../../shared/data/publicApi'
import type { ArticleSummary } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { ArticleCard } from './components/ArticleCard'
import ArticleToolbar from './components/ArticleToolbar'
import { Pagination } from '../../shared/ui/Pagination'
import './articles.css'

const ITEMS_PER_PAGE = 60

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (article: ArticleSummary, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [article.title, article.summary, article.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (article: ArticleSummary, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (article.tags ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const ArticlesPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const sectionTags = getTags('article_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getArticles(0, 500)
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
        base.sort((a, b) => a.title.localeCompare(b.title, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }))
        break
      case 'recent':
        base.sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? '').getTime()
          const bTime = new Date(b.updatedAt ?? '').getTime()
          return Number.isNaN(bTime - aTime) ? 0 : bTime - aTime
        })
        break
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

  const skeletonItems = Array.from({ length: 8 }, (_, index) => index)

  return (
    <section className="page">
      <ArticleToolbar
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
        <div className="grid grid--articles">
          {skeletonItems.map((item) => (
            <div key={item} className="card article-card article-card--skeleton" aria-hidden="true">
              <div className="article-card__media">
                <div className="skeleton skeleton--image" />
              </div>
              <div className="article-card__body">
                <div className="skeleton skeleton--line skeleton--line-lg" />
                <div className="skeleton skeleton--line skeleton--line-sm" />
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
          <div className="grid grid--articles">
            {paginatedItems.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
          {paginatedItems.length === 0 ? <div className="status status--empty">{t('articles.empty')}</div> : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
