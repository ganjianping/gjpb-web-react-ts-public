import { useEffect, useMemo, useState } from 'react'
import { getWebsites } from '../../shared/data/publicApi'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { WebsiteCard } from '../../shared/components/WebsiteCard'
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
  const [items, setItems] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">{language === 'ZH' ? '精选网站' : 'Featured Websites'}</h1>
        <p className="page__subtitle">
          {language === 'ZH'
            ? '探索精选的在线工具、人工智能产品与创新平台。'
            : 'Explore curated online tools, AI products, and innovative platforms.'}
        </p>
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
          <div className="grid grid--websites">
            {paginatedItems.map((item) => (
              <WebsiteCard key={item.id} website={item} />
            ))}
            {paginatedItems.length === 0 ? (
              <div className="status status--empty">
                {language === 'ZH' ? '未找到匹配的站点。' : 'No websites match your search.'}
              </div>
            ) : null}
          </div>
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
