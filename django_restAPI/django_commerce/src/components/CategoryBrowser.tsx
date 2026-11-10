import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchCategories } from '../api/client'
import type { Category } from '../api/types'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'
import { categoryBrowsePath } from '../lib/routes'
import { ChevronRightIcon, FolderIcon, SearchIcon, XMarkIcon } from './icons'

const BROWSE_CATEGORY_LIMIT = 12
const SEARCH_DEBOUNCE_MS = 300

function CategoryCard({
  category,
  childCount,
}: {
  category: Category
  childCount: number
}) {
  return (
    <Link
      to={categoryBrowsePath(category.id)}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <FolderIcon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
          {category.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">
          {childCount > 0
            ? `${formatNumber(childCount)} sous-catégorie${childCount > 1 ? 's' : ''}`
            : category.slug ?? 'Sans sous-catégorie'}
        </span>
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500" />
    </Link>
  )
}

export function CategoryBrowser() {
  const { categories, loading, error } = useTaxonomy()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Category[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedQuery = query.trim()

  const rootCategories = useMemo(
    () =>
      categories
        .filter((category) => category.parent === null)
        .sort((left, right) => left.name.localeCompare(right.name, 'fr'))
        .slice(0, BROWSE_CATEGORY_LIMIT),
    [categories],
  )

  const childCountByParent = useMemo(() => {
    const counts = new Map<number, number>()

    categories.forEach((category) => {
      if (category.parent === null) return
      counts.set(category.parent, (counts.get(category.parent) ?? 0) + 1)
    })

    return counts
  }, [categories])

  useEffect(() => {
    if (!trimmedQuery) {
      setResults(null)
      setSearching(false)
      setSearchError(null)
      return
    }

    const controller = new AbortController()
    setSearching(true)
    setSearchError(null)

    const timer = window.setTimeout(() => {
      searchCategories(
        trimmedQuery,
        BROWSE_CATEGORY_LIMIT,
        0,
        controller.signal,
      )
        .then((response) => {
          if (controller.signal.aborted) return
          setResults(response.results)
          setSearching(false)
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return
          setSearchError(
            cause instanceof Error
              ? cause.message
              : 'Impossible de rechercher une catégorie.',
          )
          setSearching(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmedQuery])

  const displayedCategories = results ?? rootCategories
  const activeLoading = trimmedQuery ? searching : loading
  const activeError = trimmedQuery ? searchError : error

  return (
    <section
      aria-labelledby="category-browser-title"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Rayons
          </p>
          <h2
            id="category-browser-title"
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
          >
            Parcourir par catégorie
          </h2>
        </div>
        <Link
          to="/categories"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          Toutes les catégories
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      <div className="relative mt-5 max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une catégorie…"
          aria-label="Rechercher une catégorie"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Effacer la recherche de catégorie"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon />
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {activeLoading ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-400">
            Chargement des catégories…
          </p>
        ) : activeError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {activeError}
          </p>
        ) : displayedCategories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            {trimmedQuery
              ? 'Aucune catégorie ne correspond à votre recherche.'
              : 'Aucune catégorie disponible.'}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                childCount={childCountByParent.get(category.id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
