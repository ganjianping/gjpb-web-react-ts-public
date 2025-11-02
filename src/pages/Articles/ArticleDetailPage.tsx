import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticleById } from '../../shared/data/publicApi'
import type { ArticleDetail } from '../../shared/data/types'
import { useT } from '../../shared/i18n'
import './articles.css'

export const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useT()
  const invalidIdMessage = t('articles.invalid_id')
  const failedToLoadMessage = t('failed_to_load')

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError(invalidIdMessage)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await getArticleById(id)
        setArticle(response.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : failedToLoadMessage
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void fetchArticle()
    // `t` (translation function) is stable via `useT` and not required as a
    // dependency for fetching data. Restrict the effect to `id` so we only
    // refetch when the article id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <section className="page article-detail">
        <div className="status status--loading">
          <span>{t('loading')}</span>
        </div>
      </section>
    )
  }

  if (error || !article) {
    return (
      <section className="page article-detail">
        <div className="status status--error">
          <span>{t('failed_to_load')}</span>
          {error ? <span className="status__message">{error}</span> : null}
          <Link to="/public/articles" className="button button--primary">
            {t('articles.back_to_list')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page article-detail">
      <div className="article-detail__header">
        <Link to="/public/articles" className="article-detail__back-link">
          ← {t('articles.back_to_list')}
        </Link>
      </div>
      
      <h1 className="article-detail__title">{article.title}</h1>

      {article.coverImageUrl ? (
        <div className="article-detail__cover">
          <img src={article.coverImageUrl} alt={article.title} />
        </div>
      ) : null}

      <article className="article-detail__content">
        <div className="article-detail__meta">
          {article.tags ? (
            <span className="article-detail__tags">
              {t('articles.tags')}: {article.tags};
            </span>
          ) : null}
          {article.sourceName ? (
            <span className="article-detail__source">
              {t('articles.source')}: {article.sourceName};
            </span>
          ) : null}
          {article.updatedAt ? (
            <time className="article-detail__date">
             {t('articles.updateAt')}:  {new Date(article.updatedAt).toLocaleDateString()}
            </time>
          ) : null}
          
        </div>

        <div 
          className="article-detail__body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.originalUrl ? (
          <div className="article-detail__actions">
            <a 
              href={article.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button button--primary"
            >
              {t('articles.view_original')}
            </a>
          </div>
        ) : null}
      </article>
    </section>
  )
}
