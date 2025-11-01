import { useMemo, useState } from 'react'
import type { Website } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface WebsiteCardProps {
  website: Website
}

const FALLBACK_LOGO = 'https://via.placeholder.com/120?text=Site'

const getUniqueTags = (tags: string) => {
  const unique: string[] = []
  const seen = new Set<string>()

  const parts = tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  for (const tag of parts) {
    const key = tag.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(tag)
    }
  }

  return unique
}

export const WebsiteCard = ({ website }: WebsiteCardProps) => {
  const t = useT()
  const [imageError, setImageError] = useState(false)

  const tags = useMemo(() => getUniqueTags(website.tags ?? ''), [website.tags])
  const tagsLabel = tags.join(', ')

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

  // no description state or handlers — card shows tags only

  return (
    <article className="card website-card" aria-label={website.name}>
      {website.url ? (
        <a className="website-card__link" href={website.url} target="_blank" rel="noopener noreferrer">
          {cardBody}
        </a>
      ) : (
        cardBody
      )}
      {/* description and info icon removed — only tags are shown */}
    </article>
  )
}
