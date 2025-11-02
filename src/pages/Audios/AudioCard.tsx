import { useState } from 'react'
import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface AudioCardProps {
  item: MediaItem
}

const parseTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const AudioCard = ({ item }: AudioCardProps) => {
  const t = useT()
  const tagList = parseTags(item.tags)
  const captionsUrl = (item as any).captionsUrl as string | undefined
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying)
  }

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
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Hide player' : 'Show player'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
        <div className="audio-card__info">
          <h3 className="audio-card__title">{item.title ?? item.name ?? t('untitled.audio')}</h3>
          {item.description ? <p className="audio-card__description">{item.description}</p> : null}
          <div className="audio-card__tags">
            {tagList.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      {isPlaying && (
        <div className="audio-card__player-wrapper">
          <audio className="audio-card__player" controls autoPlay preload="none">
            <source src={item.url} />
            {/* include a captions track element (src may be empty if not available) */}
            <track kind="captions" srcLang="en" src={captionsUrl ?? ''} />
          </audio>
        </div>
      )}
    </article>
  )
}
