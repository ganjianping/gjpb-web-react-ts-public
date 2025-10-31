import { useEffect, useMemo, useState } from 'react'
import { getVideos } from '../../shared/data/publicApi'
import type { MediaItem } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { VideoCard } from '../../shared/components/VideoCard'
import { Pagination } from '../../shared/ui/Pagination'

const ITEMS_PER_PAGE = 60

const matchesSearch = (item: MediaItem, search: string) => {
  if (!search) {
    return true
  }

  const term = search.toLowerCase()
  const name = (item.name ?? item.title ?? '').toLowerCase()
  const description = (item.description ?? '').toLowerCase()
  const tags = (item.tags ?? '').toLowerCase()
  return name.includes(term) || description.includes(term) || tags.includes(term)
}

export const VideosPage = () => {
  const { language, searchQuery } = useUIContext()
  const [items, setItems] = useState<MediaItem[]>([])
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
        const response = await getVideos(0, 200)
        setItems(response.data.content)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load videos'
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
        <h1 className="page__title">{language === 'ZH' ? '视频精选' : 'Video Gallery'}</h1>
        <p className="page__subtitle">
          {language === 'ZH' ? '观看科技、产品与创意视频。' : 'Watch curated videos about technology and innovation.'}
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
          <div className="grid grid--videos">
            {paginatedItems.map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
          {paginatedItems.length === 0 ? (
            <div className="status status--empty">
              {language === 'ZH' ? '未找到匹配的视频。' : 'No videos match your search.'}
            </div>
          ) : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
