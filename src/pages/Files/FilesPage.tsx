import { useEffect, useMemo, useState } from 'react'
import { getFiles } from '../../shared/data/publicApi'
import type { FileItem } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { FileCard } from './FileCard'
import { Pagination } from '../../shared/ui/Pagination'

const ITEMS_PER_PAGE = 60

const matchesSearch = (item: FileItem, search: string) => {
  if (!search) {
    return true
  }

  const term = search.toLowerCase()
  return (
    item.name.toLowerCase().includes(term) ||
    (item.description ?? '').toLowerCase().includes(term) ||
    (item.tags ?? '').toLowerCase().includes(term)
  )
}

export const FilesPage = () => {
  const { language, searchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const sectionTags = getTags('file_tags')

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, language])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getFiles(0, 200)
        setItems(response.data.content)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load files'
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
        <h1 className="page__title">{language === 'ZH' ? '文件中心' : 'File Library'}</h1>
        <p className="page__subtitle">
          {language === 'ZH' ? '下载文档、资料与精选资源。' : 'Download curated documents and resources.'}
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
          <div className="grid grid--files">
            {paginatedItems.map((item) => (
              <FileCard key={item.id} item={item} />
            ))}
          </div>
          {paginatedItems.length === 0 ? (
            <div className="status status--empty">
              {language === 'ZH' ? '未找到匹配的文件。' : 'No files match your search.'}
            </div>
          ) : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
