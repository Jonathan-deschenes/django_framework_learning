import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import type { CatalogOutletContext } from '../components/CatalogRouteLayout'
import { CategoryBrowser } from '../components/CategoryBrowser'
import { CategoryDrawer } from '../components/CategoryDrawer'
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb'
import { Drawer } from '../components/Drawer'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../components/ProductCard'
import { ProductFilters } from '../components/ProductFilters'
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/States'
import {
  ChevronRightIcon,
  FunnelIcon,
  MenuIcon,
  SearchIcon,
  XMarkIcon,
} from '../components/icons'
import { useCatalog } from '../contexts/CatalogContext'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'

export function CatalogPage() {
  const {
    products,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    setPage,
    applyFilters,
    resetFilters,
    reload,
    hasActiveFilters,
    activeFilterCount,
  } = useCatalog()
  const { scopedCategory } = useOutletContext<CatalogOutletContext>()
  const { categories } = useTaxonomy()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearchApplied = useRef(false)
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false)

  const initialSearch = searchParams.get('search') ?? ''
  const isScoped = scopedCategory !== null
  const showResults = isScoped || hasActiveFilters

  const childCategories = scopedCategory
    ? categories
        .filter((category) => category.parent === scopedCategory.id)
        .sort((left, right) => left.name.localeCompare(right.name, 'fr'))
    : []

  useEffect(() => {
    if (initialSearchApplied.current) return
    initialSearchApplied.current = true

    if (initialSearch) {
      applyFilters({ search: initialSearch })
    }
  }, [applyFilters, initialSearch])

  useEffect(() => {
    if (isScoped && filters.categoryIds?.length) {
      applyFilters({ categoryIds: [] })
    }
  }, [applyFilters, filters.categoryIds, isScoped])

  const updateSearchParams = (patch: {
    search?: string | null
    category?: number | null
  }) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (patch.search !== undefined) {
        if (patch.search) nextParams.set('search', patch.search)
        else nextParams.delete('search')
      }

      if (patch.category !== undefined) {
        if (patch.category === null) nextParams.delete('category')
        else nextParams.set('category', String(patch.category))
      }

      return nextParams
    })
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = (filters.search ?? '').trim()

    applyFilters({ search: query })
    updateSearchParams({ search: query || null })
  }

  const handleClearSearch = () => {
    applyFilters({ search: '' })
    updateSearchParams({ search: null })
  }

  const handleSelectCategory = (id: number | null) => {
    applyFilters({ categoryIds: [] })
    updateSearchParams({ category: id })
    setCategoryDrawerOpen(false)
    setFiltersDrawerOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToCategories = () => {
    resetFilters()
    updateSearchParams({ search: null, category: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    resetFilters()
    updateSearchParams({ search: null })
  }

  const searchPlaceholder = scopedCategory
    ? `Rechercher dans « ${scopedCategory.name} »…`
    : 'Rechercher un produit…'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-200 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Catalogue
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {scopedCategory
              ? scopedCategory.name
              : 'Que recherchez-vous aujourd’hui ?'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {scopedCategory
              ? 'Recherchez et filtrez les produits de cette catégorie et de ses sous-catégories.'
              : 'Lancez une recherche ou parcourez les rayons pour trouver votre produit.'}
          </p>

          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="mt-6 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-slate-950/20 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={filters.search ?? ''}
                onChange={(event) => applyFilters({ search: event.target.value })}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
              />
              {filters.search ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Effacer la recherche"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <XMarkIcon />
                </button>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
              >
                <MenuIcon className="size-4" />
                Catégories
              </button>
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:flex-none"
              >
                Rechercher
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {scopedCategory ? (
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
                <span className="truncate">Dans : {scopedCategory.name}</span>
                <button
                  type="button"
                  onClick={() => handleSelectCategory(null)}
                  aria-label="Rechercher dans toutes les catégories"
                  className="rounded-full p-0.5 text-indigo-200 transition hover:bg-white/10 hover:text-white"
                >
                  <XMarkIcon className="size-3.5" />
                </button>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Recherche dans toutes les catégories
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="catalog-title">
        {showResults ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                {scopedCategory ? (
                  <CategoryBreadcrumb category={scopedCategory} className="mb-3" />
                ) : (
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Résultats
                  </p>
                )}
                <h2
                  id="catalog-title"
                  className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
                >
                  {scopedCategory
                    ? scopedCategory.name
                    : filters.search?.trim()
                      ? `Résultats pour « ${filters.search.trim()} »`
                      : 'Produits filtrés'}
                </h2>
                {!loading && !error ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {formatNumber(total)} produit{total > 1 ? 's' : ''} · page {page} sur{' '}
                    {totalPages}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  <MenuIcon className="size-4" />
                  Changer de catégorie
                </button>
                <button
                  type="button"
                  onClick={handleBackToCategories}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  Tout parcourir
                </button>
              </div>
            </div>

            {childCategories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {childCategories.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => handleSelectCategory(child.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                  >
                    {child.name}
                    <ChevronRightIcon className="size-3" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setFiltersDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FunnelIcon className="size-4" />
                Filtres
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>

            <div className="mt-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
              <div className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <ProductFilters
                  scopedCategory={scopedCategory}
                  onOpenCategoryDrawer={() => setCategoryDrawerOpen(true)}
                />
              </div>

              <div className="min-w-0">
                {loading ? (
                  <ProductGridSkeleton />
                ) : error ? (
                  <ErrorState message={error} onRetry={reload} />
                ) : products.length === 0 ? (
                  <EmptyState
                    title="Aucun produit ne correspond aux filtres"
                    message={
                      scopedCategory
                        ? 'Essayez d’élargir vos filtres ou recherchez dans toutes les catégories.'
                        : 'Essayez d’élargir votre recherche ou réinitialisez les filtres pour explorer les catégories.'
                    }
                    action={
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Réinitialiser les filtres
                        </button>
                        {scopedCategory && filters.search?.trim() ? (
                          <button
                            type="button"
                            onClick={() => handleSelectCategory(null)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Rechercher dans toutes les catégories
                          </button>
                        ) : null}
                      </div>
                    }
                  />
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Explorer le catalogue
              </p>
              <h2
                id="catalog-title"
                className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
              >
                Choisissez une catégorie pour commencer
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Utilisez la recherche ci-dessus ou sélectionnez un rayon. Les filtres
                avancés (prix, note, stock, tags) apparaissent avec les résultats.
              </p>
            </div>

            <CategoryBrowser />
          </div>
        )}
      </section>

      <CategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        activeCategoryId={scopedCategory?.id}
        onSelectCategory={handleSelectCategory}
      />

      <Drawer
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        title="Filtres"
      >
        <div>
          <ProductFilters
            scopedCategory={scopedCategory}
            onOpenCategoryDrawer={() => {
              setFiltersDrawerOpen(false)
              setCategoryDrawerOpen(true)
            }}
            className="border-0 shadow-none"
            showHeader={false}
          />
        </div>
      </Drawer>
    </div>
  )
}
