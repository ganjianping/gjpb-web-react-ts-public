interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
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

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return null
  }

  const range = createPageRange(currentPage, totalPages)

  return (
    <nav className="pagination" aria-label="Pagination">
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
    </nav>
  )
}
