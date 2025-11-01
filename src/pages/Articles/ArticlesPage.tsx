import { useEffect, useMemo, useState } from 'react'
import { getArticles } from '../../shared/data/publicApi'
import type { ArticleSummary } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { ArticleCard } from './ArticleCard'
import { Pagination } from '../../shared/ui/Pagination'

const ITEMS_PER_PAGE = 60

const matchesSearch = (article: ArticleSummary, search: string) => {
  if (!search) {
    return true
  }

  const value = search.toLowerCase()
  return (
    article.title.toLowerCase().includes(value) ||
    article.summary.toLowerCase().includes(value) ||
    (article.tags ?? '').toLowerCase().includes(value)
  )
}

export const ArticlesPage = () => {
  const { language, searchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<ArticleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const sectionTags = getTags('article_tags')

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, language])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getArticles(0, 200)
        setItems(response.data.content)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load articles'
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
        <h1 className="page__title">{t('articles.title')}</h1>
        <p className="page__subtitle">{t('articles.subtitle')}</p>
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
          <div className="grid grid--articles">
            {paginatedItems.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
          {paginatedItems.length === 0 ? (
            <div className="status status--empty">{t('articles.empty')}</div>
          ) : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
