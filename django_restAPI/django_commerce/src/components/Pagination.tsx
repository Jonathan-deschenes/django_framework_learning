import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageItems(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]

  if (page > 3) {
    items.push('ellipsis')
  }

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let current = start; current <= end; current += 1) {
    items.push(current)
  }

  if (page < totalPages - 2) {
    items.push('ellipsis')
  }

  items.push(totalPages)

  return items
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  const baseButton =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav
      aria-label="Pagination du catalogue"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${baseButton} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
        aria-label="Page précédente"
      >
        <ChevronLeftIcon />
        <span className="ml-1 hidden sm:inline">Précédent</span>
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-slate-400" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Aller à la page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${baseButton} ${
              item === page
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${baseButton} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
        aria-label="Page suivante"
      >
        <span className="mr-1 hidden sm:inline">Suivant</span>
        <ChevronRightIcon />
      </button>
    </nav>
  )
}
