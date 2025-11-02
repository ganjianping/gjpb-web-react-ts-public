import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { getAudios } from '../../shared/data/publicApi'
import type { MediaItem } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { AudioCard } from './AudioCard'
import { Pagination } from '../../shared/ui/Pagination'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './audios.css'

const ITEMS_PER_PAGE = 60

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (item: MediaItem, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [item.title ?? item.name ?? '', item.description ?? '', item.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (item: MediaItem, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (item.tags ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const AudiosPage = () => {
  const { language, searchQuery, setSearchQuery } = useUIContext()
  const { getTags } = useAppSettings()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const sectionTags = getTags('audio_tags')
  const t = useT()
  const failedLabel = t('failed_to_load')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getAudios(0, 200)
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
        base.sort((a, b) => {
          const aName = a.title ?? a.name ?? ''
          const bName = b.title ?? b.name ?? ''
          return aName.localeCompare(bName, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' })
        })
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

  const handleTogglePlayer = (item: MediaItem) => {
    setActiveItem((current) => (current?.id === item.id ? null : item))
  }

  useEffect(() => {
    setShowSubtitle(false)
  }, [activeItem?.id])

  const activeCaptionsUrl = (activeItem as any)?.captionsUrl as string | undefined

  return (
    <section className="page">
      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="audios"
      />

      {loading ? (
        <div className="status status--loading">
          <span>{t('loading')}</span>
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
          {activeItem ? (
            <div className="audio-card__player-wrapper">
              <div className="audio-card__player-controls">
                <audio key={activeItem.id} className="audio-card__player" controls autoPlay preload="none">
                  <source src={activeItem.url} />
                  {/* include a captions track element (src may be empty if not available) */}
                  <track kind="captions" srcLang="en" src={activeCaptionsUrl ?? ''} />
                </audio>
                {activeItem.subtitle ? (
                  <button
                    type="button"
                    className="audio-card__subtitle-button"
                    onClick={() => setShowSubtitle((prev) => !prev)}
                    aria-pressed={showSubtitle}
                    aria-label={showSubtitle ? 'Hide subtitles' : 'Show subtitles'}
                    title={showSubtitle ? 'Hide subtitles' : 'Show subtitles'}
                  >
                    CC
                  </button>
                ) : null}
              </div>
              {showSubtitle && activeItem.subtitle ? (
                <div
                  className="audio-card__subtitle"
                  dangerouslySetInnerHTML={{ __html: activeItem.subtitle }}
                />
              ) : null}
            </div>
          ) : null}
          <div className="grid grid--audios">
            {paginatedItems.map((item) => (
              <AudioCard
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                onTogglePlayer={handleTogglePlayer}
              />
            ))}
          </div>
          {paginatedItems.length === 0 ? <div className="status status--empty">{t('audios.empty')}</div> : null}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
    </section>
  )
}
