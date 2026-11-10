import { useEffect, useState } from 'react'
import { searchCategories } from '../api/client'
import type { Category } from '../api/types'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { getCategoryPath } from '../lib/categoryTree'
import { CategoryTree } from './CategoryTree'
import { Drawer } from './Drawer'
import { ChevronRightIcon, FolderIcon, SearchIcon, XMarkIcon } from './icons'

const SEARCH_DEBOUNCE_MS = 300
const SEARCH_RESULT_LIMIT = 30

interface CategoryDrawerProps {
  open: boolean
  onClose: () => void
  activeCategoryId?: number
  onSelectCategory: (id: number | null) => void
}

export function CategoryDrawer({
  open,
  onClose,
  activeCategoryId,
  onSelectCategory,
}: CategoryDrawerProps) {
  const { categoryById, loading, error } = useTaxonomy()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Category[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedQuery = query.trim()

  useEffect(() => {
    if (!open || !trimmedQuery) {
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
        SEARCH_RESULT_LIMIT,
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
  }, [open, trimmedQuery])

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  const handleSelect = (id: number | null) => {
    onSelectCategory(id)
    handleClose()
  }

  const activeLoading = trimmedQuery ? searching : loading
  const activeError = trimmedQuery ? searchError : error

  return (
    <Drawer open={open} onClose={handleClose} title="Choisir une catégorie" side="left">
      <div className="space-y-4 p-4">
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          <FolderIcon className="size-4 text-indigo-500" />
          Toutes les catégories
          {activeCategoryId === undefined ? (
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
              Actif
            </span>
          ) : null}
        </button>

        <div className="relative">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-2">
          {activeLoading ? (
            <p className="px-3 py-6 text-sm text-slate-400">
              Chargement des catégories…
            </p>
          ) : activeError ? (
            <p className="px-3 py-6 text-sm text-rose-600">{activeError}</p>
          ) : trimmedQuery ? (
            results && results.length > 0 ? (
              <ul className="space-y-1">
                {results.map((category) => {
                  const path = getCategoryPath(category, categoryById)
                    .map((entry) => entry.name)
                    .join(' / ')

                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(category.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-indigo-50 ${
                          category.id === activeCategoryId
                            ? 'bg-indigo-50'
                            : ''
                        }`}
                      >
                        <FolderIcon className="size-4 shrink-0 text-indigo-500" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">
                            {category.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {path}
                          </span>
                        </span>
                        <ChevronRightIcon className="size-3.5 shrink-0 text-slate-300" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="px-3 py-6 text-sm text-slate-500">
                Aucune catégorie ne correspond à votre recherche.
              </p>
            )
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <CategoryTree
                activeCategoryId={activeCategoryId}
                onSelect={(id) => handleSelect(id)}
              />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
