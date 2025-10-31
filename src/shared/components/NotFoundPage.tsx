import { Link } from 'react-router-dom'
import { useUIContext } from '../contexts/UIContext'

export const NotFoundPage = () => {
  const { language } = useUIContext()
  const isChinese = language === 'ZH'

  return (
    <main className="page page--centered">
      <div className="card card--elevated not-found-card">
        <h1 className="page__title">{isChinese ? '页面未找到' : 'Page Not Found'}</h1>
        <p className="page__subtitle">
          {isChinese ? '抱歉，该页面不存在。' : 'Sorry, the page you requested does not exist.'}
        </p>
        <Link className="button" to="/public/websites">
          {isChinese ? '返回首页' : 'Back to home'}
        </Link>
      </div>
    </main>
  )
}
