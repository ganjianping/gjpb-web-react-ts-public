import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface AudioCardProps {
  item: MediaItem
  isActive: boolean
  onTogglePlayer: (item: MediaItem) => void
}

const parseTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const AudioCard = ({ item, isActive, onTogglePlayer }: AudioCardProps) => {
  const t = useT()
  const tagList = parseTags(item.tags)

  return (
    <article className="card audio-card">
      <div className="audio-card__content">
        <div className="audio-card__media-wrapper">
          <div className="audio-card__media">
            {item.coverImageUrl ? (
              <img src={item.coverImageUrl} alt={item.title ?? t('untitled.audio')} loading="lazy" />
            ) : (
              <div className="audio-card__placeholder">{t('placeholder.audio')}</div>
            )}
          </div>
          <button
            className="audio-card__play-button" 
            onClick={() => onTogglePlayer(item)}
            aria-label={isActive ? 'Hide player' : 'Show player'}
          >
            {isActive ? '⏸' : '▶'}
          </button>
        </div>
        <div className="audio-card__info">
          <h3 className="audio-card__title">{item.title ?? item.name ?? t('untitled.audio')}</h3>
          <div className="audio-card__tags">
            {tagList.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
