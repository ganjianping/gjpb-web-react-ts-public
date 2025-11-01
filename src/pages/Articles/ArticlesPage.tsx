import { useEffect, useMemo, useState } from 'react'
import { getArticles } from '../../shared/data/publicApi'
import type { ArticleSummary } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
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

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">{language === 'ZH' ? '文章精选' : 'Latest Articles'}</h1>
        <p className="page__subtitle">
          {language === 'ZH' ? '阅读科技与人工智能领域的精选内容。' : 'Read curated content in tech and AI.'}
        </p>
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
          <span>{language === 'ZH' ? '正在加载...' : 'Loading...'}</span>
        </div>
      ) : null}
      {error ? (
        <div className="status status--error">
          <span>{language === 'ZH' ? '加载失败' : 'Failed to load data'}</span>
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
            <div className="status status--empty">
              {language === 'ZH' ? '未找到匹配的文章。' : 'No articles match your search.'}
            </div>
          ) : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
