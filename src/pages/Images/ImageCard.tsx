import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'

interface ImageCardProps {
  item: MediaItem
}

const getTagList = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const ImageCard = ({ item }: ImageCardProps) => {
  const t = useT()
  const tagList = getTagList(item.tags)
  const imageSource = item.thumbnailUrl ?? item.url
  const altText = item.altText ?? item.name ?? t('placeholder.image')

  return (
    <figure className="card image-card">
      <img src={imageSource} alt={altText} loading="lazy" className="image-card__image" />
      <figcaption className="image-card__caption">
        <div className="image-card__title">{item.name ?? item.title ?? 'Untitled image'}</div>
        <div className="image-card__tags">
          {tagList.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </figcaption>
    </figure>
  )
}
