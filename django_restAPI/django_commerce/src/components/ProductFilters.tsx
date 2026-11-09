import { useMemo, useState } from 'react'
import { useCatalog } from '../contexts/CatalogContext'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { SearchIcon, StarIcon, XMarkIcon } from './icons'

const fieldClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const labelClassName =
  'text-xs font-semibold uppercase tracking-wide text-slate-500'

interface CheckboxListProps {
  items: Array<{ id: number; name: string }>
  selectedIds: number[]
  onToggle: (id: number) => void
  loading: boolean
  error: string | null
  emptyLabel: string
}

function CheckboxList({
  items,
  selectedIds,
  onToggle,
  loading,
  error,
  emptyLabel,
}: CheckboxListProps) {
  if (loading) {
    return <p className="px-2 py-1.5 text-xs text-slate-400">Chargement…</p>
  }

  if (error) {
    return <p className="px-2 py-1.5 text-xs text-rose-600">{error}</p>
  }

  if (items.length === 0) {
    return <p className="px-2 py-1.5 text-xs text-slate-400">{emptyLabel}</p>
  }

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

export function ProductFilters() {
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

  const [isOpen, setIsOpen] = useState(false)

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
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
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

        <div className="flex shrink-0 items-center gap-2">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
            >
              Réinitialiser
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            {isOpen ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      <div
        className={`border-t border-slate-100 p-5 pt-4 ${isOpen ? 'block' : 'hidden'} lg:block`}
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="product-search" className={labelClassName}>
              Recherche
            </label>
            <div className="relative mt-2">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="product-search"
                type="search"
                value={filters.search ?? ''}
                onChange={(event) => applyFilters({ search: event.target.value })}
                placeholder="Nom du produit…"
                className={`${fieldClassName} pl-9 pr-9`}
              />
              {filters.search ? (
                <button
                  type="button"
                  onClick={() => applyFilters({ search: '' })}
                  aria-label="Effacer la recherche"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <XMarkIcon />
                </button>
              ) : null}
            </div>
          </div>

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
            <legend className={labelClassName}>Catégories</legend>
            <div className="mt-2 max-h-48 space-y-0.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
              <CheckboxList
                items={sortedCategories}
                selectedIds={filters.categoryIds ?? []}
                onToggle={toggleCategory}
                loading={taxonomyLoading}
                error={taxonomyError}
                emptyLabel="Aucune catégorie disponible"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClassName}>Tags</legend>
            <div className="mt-2 max-h-48 space-y-0.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
              <CheckboxList
                items={sortedTags}
                selectedIds={filters.tagIds ?? []}
                onToggle={toggleTag}
                loading={taxonomyLoading}
                error={taxonomyError}
                emptyLabel="Aucun tag disponible"
              />
            </div>
          </fieldset>
        </div>
      </div>
    </aside>
  )
}
