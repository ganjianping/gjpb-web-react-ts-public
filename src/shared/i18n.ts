import { useUIContext } from './contexts/UIContext'

type Lang = 'EN' | 'ZH'

type Translations = {
  [key: string]: {
    EN: string
    ZH: string
  }
}

const translations: Translations = {
  'loading': { EN: 'Loading...', ZH: '正在加载...' },
  'failed_to_load': { EN: 'Failed to load data', ZH: '加载失败' },

  // Articles
  'articles.title': { EN: 'Latest Articles', ZH: '文章精选' },
  'articles.subtitle': { EN: 'Read curated content in tech and AI.', ZH: '阅读科技与人工智能领域的精选内容。' },
  'articles.empty': { EN: 'No articles match your search.', ZH: '未找到匹配的文章。' },

  // Websites
  'websites.title': { EN: 'Featured Websites', ZH: '精选网站' },
  'websites.subtitle': { EN: 'Explore curated online tools, AI products, and innovative platforms.', ZH: '探索精选的在线工具、人工智能产品与创新平台。' },
  'websites.empty': { EN: 'No websites match your search.', ZH: '未找到匹配的站点。' },

  // Images
  'images.title': { EN: 'Image Gallery', ZH: '图片库' },
  'images.subtitle': { EN: 'Browse high-quality visuals and creative assets.', ZH: '浏览高质量图像与创意视觉素材。' },
  'images.empty': { EN: 'No images match your search.', ZH: '未找到匹配的图片。' },

  // Audios
  'audios.title': { EN: 'Audio Gallery', ZH: '音频精选' },
  'audios.subtitle': { EN: 'Listen to curated music and audio content.', ZH: '播放精选的音乐与音频内容。' },
  'audios.empty': { EN: 'No audio items match your search.', ZH: '未找到匹配的音频。' },

  // Videos
  'videos.title': { EN: 'Video Gallery', ZH: '视频精选' },
  'videos.subtitle': { EN: 'Watch curated videos about technology and innovation.', ZH: '观看科技、产品与创意视频。' },
  'videos.empty': { EN: 'No videos match your search.', ZH: '未找到匹配的视频。' },

  // Files
  'files.title': { EN: 'File Library', ZH: '文件中心' },
  'files.subtitle': { EN: 'Download curated documents and resources.', ZH: '下载文档、资料与精选资源。' },
  'files.empty': { EN: 'No files match your search.', ZH: '未找到匹配的文件。' },

  // Search
  'search.placeholder': { EN: 'Search sites or tags', ZH: '搜索站点或标签' },

  // Toggles
  'toggle.theme.light': { EN: 'Switch to light', ZH: '切换到日间' },
  'toggle.theme.dark': { EN: 'Switch to dark', ZH: '切换到夜间' },
  'toggle.language.toChinese': { EN: 'Switch to Chinese', ZH: '切换为英文' },

  // Not found
  'notfound.title': { EN: 'Page Not Found', ZH: '页面未找到' },
  'notfound.subtitle': { EN: 'Sorry, the page you requested does not exist.', ZH: '抱歉，该页面不存在。' },
  'notfound.back': { EN: 'Back to home', ZH: '返回首页' },

  // Footer
  'footer.copy': { EN: '© {year} {company} · {appName} · v{version}', ZH: '© {year} {company} · {appName} · 版本 {version}' },
}

export const useT = () => {
  const { language } = useUIContext()

  const t = (key: string, vars?: Record<string, string | number>) => {
    const entry = translations[key]
    const lang: Lang = language
    let text = entry ? entry[lang] ?? entry.EN : key

    if (vars) {
      for (const k of Object.keys(vars)) {
        const v = String(vars[k])
        if (text.replaceAll) {
          text = text.replaceAll(`{${k}}`, v)
        } else {
          text = text.split(`{${k}}`).join(v)
        }
      }
    }

    return text
  }

  return t
}

export default translations
