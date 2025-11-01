import { useMemo, useState } from 'react'
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

  const tags = useMemo(() => getUniqueTags(website.tags ?? ''), [website.tags])
  const tagsLabel = tags.join(', ')
  const description = website.description?.trim()

  // no in-page popover; description will open in a small popup window

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

  const escapeHtml = (str: string) =>
    str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const handleOpenDescriptionPopup = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!description) return

    const width = 420
    const height = 300
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2
    const features = `width=${width},height=${height},left=${Math.max(0, Math.round(left))},top=${Math.max(0, Math.round(top))},resizable=yes,scrollbars=yes`

    const popup = window.open('', '_blank', features)
    if (!popup) {
      // popup blocked — fallback to alert
      // eslint-disable-next-line no-alert
      globalThis.alert(description)
      return
    }

    const doc = popup.document
    const safeTitle = escapeHtml(website.name)
  const safeDescription = escapeHtml(description).replaceAll('\n', '<br/>')

  const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${safeTitle}</title></head><body style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin:0; padding:18px; background: ${getComputedStyle(document.body).background || '#fff'}; color: ${getComputedStyle(document.body).color || '#000'};"><h2 style="margin:0 0 8px; font-size:1.05rem">${safeTitle}</h2><div style="font-size:0.95rem; line-height:1.5; color: ${getComputedStyle(document.body).color || '#000'}">${safeDescription}</div></body></html>`

  doc.open()
  // write via documentElement to avoid deprecated doc.write signature warning
  doc.documentElement.innerHTML = html
  doc.close()
    popup.focus()
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
        <button
          type="button"
          className="website-card__info-button"
          onClick={handleOpenDescriptionPopup}
          aria-label={t('websites.show_description', { name: website.name })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <line x1="12" y1="8.5" x2="12" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.9" fill="currentColor" />
          </svg>
        </button>
      ) : null}
    </article>
  )
}
