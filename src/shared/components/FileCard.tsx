import type { FileItem } from '../data/types'

interface FileCardProps {
  item: FileItem
}

const splitTags = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const FileCard = ({ item }: FileCardProps) => {
  const tagList = splitTags(item.tags)

  return (
    <article className="card file-card">
      <div className="file-card__body">
        <h3 className="file-card__title">{item.name}</h3>
        {item.description ? <p className="file-card__description">{item.description}</p> : null}
        <div className="file-card__tags">
          {tagList.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="file-card__footer">
        <a className="button button--primary" href={item.url} target="_blank" rel="noopener noreferrer">
          Download
        </a>
        {item.originalUrl ? (
          <a className="button button--text" href={item.originalUrl} target="_blank" rel="noopener noreferrer">
            Source
          </a>
        ) : null}
      </div>
    </article>
  )
}
