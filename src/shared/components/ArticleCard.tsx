import type { ArticleSummary } from '../data/types'

interface ArticleCardProps {
  article: ArticleSummary
}

const getTagList = (tags: string) =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const tagList = getTagList(article.tags)

  return (
    <article className="card article-card">
      {article.coverImageUrl ? (
        <div className="article-card__media">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="article-card__image"
          />
        </div>
      ) : null}
      <div className="article-card__body">
        <h3 className="article-card__title">{article.title}</h3>
        <p className="article-card__summary">{article.summary}</p>
      </div>
      <div className="article-card__footer">
        <div className="article-card__tags">
          {tagList.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <a
          className="button button--text"
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {article.sourceName ? `Read on ${article.sourceName}` : 'Read more'}
        </a>
      </div>
    </article>
  )
}
