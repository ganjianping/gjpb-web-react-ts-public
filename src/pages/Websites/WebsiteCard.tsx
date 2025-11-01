import type { Website } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface WebsiteCardProps {
  website: Website
}

const normalizeTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const WebsiteCard = ({ website }: WebsiteCardProps) => {
  const t = useT()
  const tagList = normalizeTags(website.tags)

  return (
    <article className="card website-card">
      <div className="website-card__media">
        <img
          src={website.logoUrl}
          alt={`${website.name} logo`}
          loading="lazy"
          className="website-card__image"
          onError={(event) => {
            if (event.currentTarget.dataset.fallbackApplied) {
              return
            }
            event.currentTarget.dataset.fallbackApplied = 'true'
            event.currentTarget.src = 'https://via.placeholder.com/256?text=Logo'
          }}
        />
      </div>
      <div className="website-card__body">
        <h3 className="website-card__title">{website.name}</h3>
        <p className="website-card__description">{website.description}</p>
      </div>
      <div className="website-card__footer">
        <div className="website-card__tags">
          {tagList.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <a
          className="button button--primary"
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('website.visit')} ${website.name}`}
        >
          {t('website.visit')}
        </a>
      </div>
    </article>
  )
}
