import { useEffect, useMemo, useState } from 'react'
import { searchCategories, searchTags } from '../api/client'
import type { Category } from '../api/types'
import { useCatalog } from '../contexts/CatalogContext'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { SearchIcon, StarIcon, XMarkIcon } from './icons'

const fieldClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const labelClassName =
  'text-xs font-semibold uppercase tracking-wide text-slate-500'

type CheckboxItem = { id: number; name: string }

const SEARCH_DEBOUNCE_MS = 300

async function searchCategoryItems(
  query: string,
  signal: AbortSignal,
): Promise<CheckboxItem[]> {
  const response = await searchCategories(query, 50, 0, signal)
  return response.results
}

async function searchTagItems(
  query: string,
  signal: AbortSignal,
): Promise<CheckboxItem[]> {
  const response = await searchTags(query, 50, 0, signal)
  return response.results
}

interface CheckboxItemsProps {
  items: CheckboxItem[]
  selectedIds: number[]
  onToggle: (id: number) => void
}

function CheckboxItems({ items, selectedIds, onToggle }: CheckboxItemsProps) {
  return (
    <>
      {items.map((item) => (
        <label
          key={item.id}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-white"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => onToggle(item.id)}
            className="size-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="truncate">{item.name}</span>
        </label>
      ))}
    </>
  )
}

interface SearchableCheckboxListProps {
  items: CheckboxItem[]
  selectedIds: number[]
  onToggle: (id: number) => void
  loading: boolean
  error: string | null
  emptyLabel: string
  searchPlaceholder: string
  search: (query: string, signal: AbortSignal) => Promise<CheckboxItem[]>
}

function SearchableCheckboxList({
  items,
  selectedIds,
  onToggle,
  loading,
  error,
  emptyLabel,
  searchPlaceholder,
  search,
}: SearchableCheckboxListProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CheckboxItem[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const trimmedQuery = query.trim()

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
      search(trimmedQuery, controller.signal)
        .then((nextResults) => {
          if (controller.signal.aborted) return
          setResults(nextResults)
          setSearching(false)
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return
          setSearchError(
            cause instanceof Error
              ? cause.message
              : 'Impossible de lancer la recherche.',
          )
          setSearching(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [search, trimmedQuery])

  const visibleItems = results ?? items
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  )
  const pinnedSelected = results
    ? selectedItems.filter(
        (selectedItem) =>
          !visibleItems.some((item) => item.id === selectedItem.id),
      )
    : []

  const activeLoading = trimmedQuery ? searching : loading
  const activeError = trimmedQuery ? searchError : error

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-8 text-xs text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Effacer la recherche"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
        {activeLoading ? (
          <p className="px-2 py-1.5 text-xs text-slate-400">Chargement…</p>
        ) : activeError ? (
          <p className="px-2 py-1.5 text-xs text-rose-600">{activeError}</p>
        ) : visibleItems.length === 0 && pinnedSelected.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-slate-400">
            {trimmedQuery ? 'Aucun résultat' : emptyLabel}
          </p>
        ) : (
          <>
            {pinnedSelected.length > 0 ? (
              <div className="mb-1 border-b border-slate-200 pb-1">
                <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Sélectionnées
                </p>
                <CheckboxItems
                  items={pinnedSelected}
                  selectedIds={selectedIds}
                  onToggle={onToggle}
                />
              </div>
            ) : null}
            <CheckboxItems
              items={visibleItems}
              selectedIds={selectedIds}
              onToggle={onToggle}
            />
          </>
        )}
      </div>
    </div>
  )
}

interface StarRatingFilterProps {
  label: string
  value?: number
  onChange: (value: number | undefined) => void
}

function StarRatingFilter({ label, value, onChange }: StarRatingFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-0.5" role="group" aria-label={label}>
        {Array.from({ length: 5 }, (_, index) => {
          const rating = index + 1
          const isFilled = value !== undefined && rating <= value

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(value === rating ? undefined : rating)}
              aria-label={`${rating} étoile${rating > 1 ? 's' : ''}`}
              aria-pressed={value === rating}
              className={`rounded p-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isFilled
                  ? 'text-amber-400'
                  : 'text-slate-200 hover:text-amber-300'
              }`}
            >
              <StarIcon className="size-5" />
            </button>
          )
        })}
        {value !== undefined ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={`Effacer ${label.toLowerCase()}`}
            className="ml-1 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

interface ProductFiltersProps {
  scopedCategory?: Category | null
  onOpenCategoryDrawer?: () => void
  className?: string
  showHeader?: boolean
}

export function ProductFilters({
  scopedCategory = null,
  onOpenCategoryDrawer,
  className = '',
  showHeader = true,
}: ProductFiltersProps) {
  const {
    filters,
    applyFilters,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useCatalog()
  const {
    categories,
    tags,
    loading: taxonomyLoading,
    error: taxonomyError,
  } = useTaxonomy()

  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.name.localeCompare(right.name, 'fr')),
    [categories],
  )

  const sortedTags = useMemo(
    () => [...tags].sort((left, right) => left.name.localeCompare(right.name, 'fr')),
    [tags],
  )

  const inStockValue = filters.inStock === undefined ? '' : String(filters.inStock)
  const isActiveValue = filters.isActive === undefined ? '' : String(filters.isActive)

  const toggleCategory = (id: number) => {
    const current = filters.categoryIds ?? []
    applyFilters({
      categoryIds: current.includes(id)
        ? current.filter((categoryId) => categoryId !== id)
        : [...current, id],
    })
  }

  const toggleTag = (id: number) => {
    const current = filters.tagIds ?? []
    applyFilters({
      tagIds: current.includes(id)
        ? current.filter((tagId) => tagId !== id)
        : [...current, id],
    })
  }

  return (
    <aside
      aria-label="Filtres des produits"
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Filtres
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {hasActiveFilters
                ? `${activeFilterCount} filtre${activeFilterCount > 1 ? 's' : ''} actif${activeFilterCount > 1 ? 's' : ''}`
                : 'Affinez votre recherche'}
            </p>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={`p-5 pt-4 ${showHeader ? 'border-t border-slate-100' : ''}`}
      >
        <div className="space-y-5">
          {scopedCategory ? (
            <fieldset>
              <legend className={labelClassName}>Catégorie</legend>
              <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <p className="truncate text-sm font-semibold text-indigo-900">
                  {scopedCategory.name}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-indigo-700/80">
                  Les filtres s’appliquent à cette catégorie et à ses sous-catégories.
                </p>
                {onOpenCategoryDrawer ? (
                  <button
                    type="button"
                    onClick={onOpenCategoryDrawer}
                    className="mt-2 inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                  >
                    Changer de catégorie
                  </button>
                ) : null}
              </div>
            </fieldset>
          ) : (
            <fieldset>
              <legend className={labelClassName}>
                Catégories
                {filters.categoryIds?.length ? ` (${filters.categoryIds.length})` : ''}
              </legend>
              <div className="mt-2">
                <SearchableCheckboxList
                  items={sortedCategories}
                  selectedIds={filters.categoryIds ?? []}
                  onToggle={toggleCategory}
                  loading={taxonomyLoading}
                  error={taxonomyError}
                  emptyLabel="Aucune catégorie disponible"
                  searchPlaceholder="Rechercher une catégorie…"
                  search={searchCategoryItems}
                />
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className={labelClassName}>Prix</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={filters.minPrice ?? ''}
                onChange={(event) => applyFilters({ minPrice: event.target.value })}
                placeholder="Min. €"
                aria-label="Prix minimum"
                className={fieldClassName}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={filters.maxPrice ?? ''}
                onChange={(event) => applyFilters({ maxPrice: event.target.value })}
                placeholder="Max. €"
                aria-label="Prix maximum"
                className={fieldClassName}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClassName}>Note moyenne</legend>
            <div className="mt-2 space-y-2">
              <StarRatingFilter
                label="Note minimale"
                value={filters.minRating}
                onChange={(value) => applyFilters({ minRating: value })}
              />
              <StarRatingFilter
                label="Note maximale"
                value={filters.maxRating}
                onChange={(value) => applyFilters({ maxRating: value })}
              />
            </div>
          </fieldset>

          <div>
            <label htmlFor="product-stock" className={labelClassName}>
              Disponibilité
            </label>
            <select
              id="product-stock"
              value={inStockValue}
              onChange={(event) => {
                const value = event.target.value
                applyFilters({
                  inStock: value === '' ? undefined : value === 'true',
                })
              }}
              className={`${fieldClassName} mt-2`}
            >
              <option value="">Tous les produits</option>
              <option value="true">En stock</option>
              <option value="false">Épuisé</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-status" className={labelClassName}>
              Statut
            </label>
            <select
              id="product-status"
              value={isActiveValue}
              onChange={(event) => {
                const value = event.target.value
                applyFilters({
                  isActive: value === '' ? undefined : value === 'true',
                })
              }}
              className={`${fieldClassName} mt-2`}
            >
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>

          <fieldset>
            <legend className={labelClassName}>
              Tags
              {filters.tagIds?.length ? ` (${filters.tagIds.length})` : ''}
            </legend>
            <div className="mt-2">
              <SearchableCheckboxList
                items={sortedTags}
                selectedIds={filters.tagIds ?? []}
                onToggle={toggleTag}
                loading={taxonomyLoading}
                error={taxonomyError}
                emptyLabel="Aucun tag disponible"
                searchPlaceholder="Rechercher un tag…"
                search={searchTagItems}
              />
            </div>
          </fieldset>
        </div>

        {!showHeader && hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>
    </aside>
  )
}
