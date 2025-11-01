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
  'websites.result_count': { EN: '{count} websites', ZH: '{count} 个网站' },
  'websites.sort_label': { EN: 'Sort', ZH: '排序' },
  'websites.sort.alpha': { EN: 'A → Z', ZH: '按字母' },
  'websites.sort.recency': { EN: 'Recently updated', ZH: '最近更新' },
  'websites.description_placeholder': { EN: 'Description coming soon.', ZH: '描述即将更新。' },
  'websites.tags_label': { EN: 'Tags', ZH: '标签' },
  'websites.tags_filter': { EN: 'Filter by tags', ZH: '按标签筛选' },
  'websites.filters.all': { EN: 'All', ZH: '全部' },
  'websites.search_clear': { EN: 'Clear search', ZH: '清除搜索' },
  'websites.show_description': { EN: 'Show description for {name}', ZH: '查看{name}的简介' },
  'websites.hide_description': { EN: 'Hide description for {name}', ZH: '收起{name}的简介' },
  'websites.description_label': { EN: '{name} description', ZH: '{name} 简介' },
  'websites.description_close': { EN: 'Close description', ZH: '关闭简介' },

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

  // Card actions & placeholders
  'website.visit': { EN: 'Visit', ZH: '访问' },
  'file.download': { EN: 'Download', ZH: '下载' },
  'common.source': { EN: 'Source', ZH: '来源' },
  'video.watch': { EN: 'Watch', ZH: '观看' },
  'image.preview': { EN: 'Preview', ZH: '预览' },
  'article.read_more': { EN: 'Read more', ZH: '阅读全文' },
  'article.read_on': { EN: 'Read on {source}', ZH: '在 {source} 阅读' },

  // Untitled / placeholder labels
  'untitled.video': { EN: 'Untitled video', ZH: '未命名视频' },
  'untitled.audio': { EN: 'Untitled audio', ZH: '未命名音频' },
  'untitled.image': { EN: 'Untitled image', ZH: '未命名图片' },
  'placeholder.video': { EN: 'Video', ZH: '视频' },
  'placeholder.audio': { EN: 'Audio', ZH: '音频' },
  'placeholder.image': { EN: 'Image', ZH: '图片' },
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
