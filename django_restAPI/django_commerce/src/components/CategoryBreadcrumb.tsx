import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../api/types'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { getCategoryPath } from '../lib/categoryTree'
import { categoryBrowsePath } from '../lib/routes'
import { ChevronRightIcon } from './icons'

interface CategoryPathProps {
  category: Category
  className?: string
  linkClassName?: string
  currentClassName?: string
  lastAsCurrent?: boolean
}

export function CategoryPath({
  category,
  className = 'flex flex-wrap items-center gap-1 text-xs font-medium text-indigo-700',
  linkClassName = 'transition hover:text-indigo-900 hover:underline',
  currentClassName = 'font-semibold text-slate-700',
  lastAsCurrent = true,
}: CategoryPathProps) {
  const { categoryById } = useTaxonomy()
  const path = getCategoryPath(category, categoryById)

  return (
    <span className={className}>
      {path.map((entry, index) => {
        const isLast = index === path.length - 1

        return (
          <Fragment key={entry.id}>
            {index > 0 ? (
              <ChevronRightIcon className="size-3 shrink-0 text-slate-300" />
            ) : null}
            {isLast && lastAsCurrent ? (
              <span className={currentClassName} aria-current="page">
                {entry.name}
              </span>
            ) : (
              <Link to={categoryBrowsePath(entry.id)} className={linkClassName}>
                {entry.name}
              </Link>
            )}
          </Fragment>
        )
      })}
    </span>
  )
}

interface CategoryBreadcrumbProps {
  category?: Category
  trailing?: string
  className?: string
}

export function CategoryBreadcrumb({
  category,
  trailing,
  className = '',
}: CategoryBreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d’Ariane"
      className={`flex flex-wrap items-center gap-1.5 text-sm text-slate-500 ${className}`}
    >
      <Link to="/catalogue" className="font-medium text-indigo-600 hover:text-indigo-700">
        Catalogue
      </Link>
      <ChevronRightIcon className="size-3 shrink-0 text-slate-300" />
      <Link
        to="/categories"
        className="font-medium text-indigo-600 hover:text-indigo-700"
      >
        Catégories
      </Link>

      {category ? (
        <>
          <ChevronRightIcon className="size-3 shrink-0 text-slate-300" />
          <CategoryPath
            category={category}
            lastAsCurrent={!trailing}
            className="flex flex-wrap items-center gap-1.5"
            linkClassName="font-medium text-indigo-600 transition hover:text-indigo-700"
            currentClassName="truncate text-slate-700"
          />
        </>
      ) : null}

      {trailing ? (
        <>
          <ChevronRightIcon className="size-3 shrink-0 text-slate-300" />
          <span className="truncate text-slate-700" aria-current="page">
            {trailing}
          </span>
        </>
      ) : null}
    </nav>
  )
}
