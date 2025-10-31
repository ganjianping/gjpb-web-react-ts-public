import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../../shared/components/Footer'
import { SearchBar } from '../../shared/ui/SearchBar'
import { LanguageToggle } from '../../shared/ui/LanguageToggle'
import { ThemeToggle } from '../../shared/ui/ThemeToggle'
import { useAppSettings } from '../../shared/contexts/AppSettingsContext'
import { useUIContext } from '../../shared/contexts/UIContext'

interface CategoryItem {
  key: string
  label: {
    EN: string
    ZH: string
  }
  query: string
}

const categoryItems: CategoryItem[] = [
  { key: 'ai', label: { EN: 'AI', ZH: '人工智能' }, query: 'AI' },
  { key: 'news', label: { EN: 'News', ZH: '新闻' }, query: 'News' },
  { key: 'model', label: { EN: 'Model', ZH: '模型' }, query: 'Model' },
  { key: 'search', label: { EN: 'Search', ZH: '搜索' }, query: 'Search' },
  { key: 'travel', label: { EN: 'Travel', ZH: '旅游' }, query: 'Travel' },
  { key: 'music', label: { EN: 'Music', ZH: '音乐' }, query: 'Music' },
  { key: 'productivity', label: { EN: 'Productivity', ZH: '效率' }, query: 'Productivity' },
]

const sectionLinks = [
  { path: '/public/websites', label: { EN: 'Websites', ZH: '网站' } },
  { path: '/public/articles', label: { EN: 'Articles', ZH: '文章' } },
  { path: '/public/images', label: { EN: 'Images', ZH: '图片' } },
  { path: '/public/audios', label: { EN: 'Audios', ZH: '音频' } },
  { path: '/public/videos', label: { EN: 'Videos', ZH: '视频' } },
  { path: '/public/files', label: { EN: 'Files', ZH: '文件' } },
]

export const PublicLayout = () => {
  const location = useLocation()
  const { getValue } = useAppSettings()
  const { language, setSearchQuery, searchQuery } = useUIContext()

  const appName = getValue('app_name') ?? 'GJP Blog System'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const handleCategoryClick = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="layout">
      <header className="site-header">
        <div className="site-header__top">
          <NavLink to="/public/websites" className="site-logo">
            <img src="/favicon.ico" alt={appName} className="site-logo__img" />
          </NavLink>
          <div className="site-header__controls">
            <SearchBar />
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <nav className="site-header__categories" aria-label="Category navigation">
          {categoryItems.map((item) => {
            const isActive = searchQuery.toLowerCase() === item.query.toLowerCase()
            return (
              <button
                key={item.key}
                type="button"
                className={`category-chip${isActive ? ' category-chip--active' : ''}`}
                onClick={() => handleCategoryClick(item.query)}
              >
                {item.label[language]}
              </button>
            )
          })}
        </nav>
        <nav className="site-header__sections" aria-label="Main navigation">
          {sectionLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `section-link${isActive ? ' section-link--active' : ''}`}
            >
              {link.label[language]}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
