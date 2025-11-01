import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface VideoCardProps {
  item: MediaItem
}

const splitTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const VideoCard = ({ item }: VideoCardProps) => {
  const t = useT()
  const tagList = splitTags(item.tags)

  return (
    <article className="card video-card">
      <div className="video-card__media">
          {item.coverImageUrl ? (
          <img src={item.coverImageUrl} alt={item.title ?? item.name ?? t('untitled.video')} loading="lazy" />
        ) : (
          <div className="video-card__placeholder">{t('placeholder.video')}</div>
        )}
      </div>
      <div className="video-card__body">
  <h3 className="video-card__title">{item.title ?? item.name ?? t('untitled.video')}</h3>
        {item.description ? <p className="video-card__description">{item.description}</p> : null}
        <div className="video-card__tags">
          {tagList.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="video-card__footer">
        <a className="button button--primary" href={item.url} target="_blank" rel="noopener noreferrer">
          {t('video.watch')}
        </a>
      </div>
    </article>
  )
}
