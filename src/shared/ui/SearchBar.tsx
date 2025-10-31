import type { ChangeEvent } from 'react'
import { useUIContext } from '../contexts/UIContext'

export const SearchBar = () => {
  const { searchQuery, setSearchQuery, language } = useUIContext()
  const placeholder = language === 'ZH' ? '搜索站点或标签' : 'Search sites or tags'

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  return (
    <input
      className="search-input"
      type="search"
      value={searchQuery}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  )
}
