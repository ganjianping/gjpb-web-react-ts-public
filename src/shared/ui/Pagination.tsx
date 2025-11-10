interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalElements?: number
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
}

const createPageRange = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>()

  pages.add(1)
  pages.add(totalPages)

  for (let index = currentPage - 2; index <= currentPage + 2; index += 1) {
    if (index > 0 && index <= totalPages) {
      pages.add(index)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}

const PAGE_SIZE_OPTIONS = [50, 100, 500, 1000]

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalElements, 
  pageSize = 50, 
  onPageSizeChange 
}: PaginationProps) => {
  if (totalPages <= 1 && !totalElements) {
    return null
  }

  const range = createPageRange(currentPage, totalPages)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalElements ?? 0)

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    onPageSizeChange?.(newSize)
    onPageChange(1) // Reset to first page when changing page size
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      {totalElements !== undefined && (
        <div className="pagination__info">
          <span className="pagination__total">
            Total: {totalElements} {totalElements === 1 ? 'item' : 'items'}
          </span>
          {totalElements > 0 && (
            <span className="pagination__range">
              {startItem}-{endItem}
            </span>
          )}
        </div>
      )}

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <ul className="pagination__list">
          {range.map((page, index) => {
            const previousPage = range[index - 1]
            const shouldRenderEllipsis = previousPage && page - previousPage > 1

            return (
              <li key={page} className="pagination__item">
                {shouldRenderEllipsis ? <span className="pagination__ellipsis">...</span> : null}
                <button
                  type="button"
                  className={`pagination__button${page === currentPage ? ' pagination__button--active' : ''}`}
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {onPageSizeChange && (
        <div className="pagination__page-size">
          <label htmlFor="page-size-select" className="pagination__page-size-label">
            Per page:
          </label>
          <select
            id="page-size-select"
            className="pagination__page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  )
}
