import type { MediaItem } from '../data/types'

interface AudioCardProps {
  item: MediaItem
}

const parseTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const AudioCard = ({ item }: AudioCardProps) => {
  const tagList = parseTags(item.tags)

  return (
    <article className="card audio-card">
      <div className="audio-card__media">
        {item.coverImageUrl ? (
          <img src={item.coverImageUrl} alt={item.title ?? 'Audio cover'} loading="lazy" />
        ) : (
          <div className="audio-card__placeholder">Audio</div>
        )}
      </div>
      <div className="audio-card__body">
        <h3 className="audio-card__title">{item.title ?? item.name ?? 'Untitled audio'}</h3>
        {item.description ? <p className="audio-card__description">{item.description}</p> : null}
        <audio className="audio-card__player" controls preload="none">
          <source src={item.url} />
        </audio>
        <div className="audio-card__tags">
          {tagList.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
