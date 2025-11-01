import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import type { Website } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface WebsiteCardProps {
  website: Website
}

const FALLBACK_LOGO = 'https://via.placeholder.com/120?text=Site'

const getUniqueTags = (tags: string) => {
  const unique: string[] = []
  const seen = new Set<string>()

  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => {
      const key = tag.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(tag)
      }
    })

  return unique
}

export const WebsiteCard = ({ website }: WebsiteCardProps) => {
  const t = useT()
  const [imageError, setImageError] = useState(false)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)

  const tags = useMemo(() => getUniqueTags(website.tags ?? ''), [website.tags])
  const tagsLabel = tags.join(', ')
  const description = website.description?.trim()

  useEffect(() => {
    if (!isDescriptionOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDescriptionOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDescriptionOpen])

  const cardBody = (
    <div className="website-card__layout">
      <div className="website-card__logo" aria-hidden={imageError}>
        <img
          src={imageError ? FALLBACK_LOGO : website.logoUrl}
          alt={website.name}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="website-card__content">
        <h3 className="website-card__title" title={website.name}>
          {website.name}
        </h3>
        {tagsLabel ? (
          <span
            className="website-card__tags"
            aria-label={`${t('websites.tags_label')}: ${tagsLabel}`}
            title={tagsLabel}
          >
            {tagsLabel}
          </span>
        ) : null}
      </div>
    </div>
  )

  const handleToggleDescription = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!description) {
      return
    }

    setIsDescriptionOpen((previous) => !previous)
  }

  const handleCloseDescription = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDescriptionOpen(false)
  }

  return (
    <article className="card website-card" aria-label={website.name}>
      {website.url ? (
        <a className="website-card__link" href={website.url} target="_blank" rel="noopener noreferrer">
          {cardBody}
        </a>
      ) : (
        cardBody
      )}
      {description ? (
        <>
          <button
            type="button"
            className="website-card__info-button"
            onClick={handleToggleDescription}
            aria-label={
              isDescriptionOpen
                ? t('websites.hide_description', { name: website.name })
                : t('websites.show_description', { name: website.name })
            }
            aria-expanded={isDescriptionOpen}
          >
            {/* Cleaner outlined info icon: circle + vertical bar + dot */}
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <line x1="12" y1="8.5" x2="12" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.9" fill="currentColor" />
            </svg>
          </button>
          {isDescriptionOpen ? (
            <div
              className="website-card__description-popover"
              role="dialog"
              aria-modal="false"
              aria-label={t('websites.description_label', { name: website.name })}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              <p>{description}</p>
              <button
                type="button"
                className="website-card__popover-close"
                onClick={handleCloseDescription}
                aria-label={t('websites.description_close')}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  )
}
