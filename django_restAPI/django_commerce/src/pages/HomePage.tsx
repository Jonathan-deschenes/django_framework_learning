import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CategoryProductRow } from '../components/CategoryProductRow'
import { EmptyState, ErrorState, PageLoading } from '../components/States'
import { ChevronRightIcon, SearchIcon } from '../components/icons'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { getDescendantCategoryIds } from '../lib/categoryTree'
import { formatNumber } from '../lib/format'

const HOME_CATEGORY_ROWS = 6

export function HomePage() {
  const navigate = useNavigate()
  const { categories, tags, loading, error, reload } = useTaxonomy()
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const roots = categories
      .filter((category) => category.parent === null)
      .sort((left, right) => left.name.localeCompare(right.name, 'fr'))
      .slice(0, HOME_CATEGORY_ROWS)

    return roots.map((category) => ({
      category,
      categoryIds: getDescendantCategoryIds(category.id, categories),
    }))
  }, [categories])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/catalogue?search=${encodeURIComponent(query)}` : '/catalogue')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageLoading label="Chargement de la boutique…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl shadow-slate-200 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Bienvenue sur Django Commerce
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Trouvez le produit qu’il vous faut.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Recherchez directement dans le catalogue ou explorez nos catégories
            pour découvrir une sélection de produits.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-slate-950/20 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit…"
                aria-label="Rechercher un produit"
                className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">{formatNumber(categories.length)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                Catégories
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">{formatNumber(tags.length)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Tags</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="home-categories-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Explorer
            </p>
            <h2
              id="home-categories-title"
              className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
            >
              Produits par catégorie
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

        {rows.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Aucune catégorie à afficher"
              message="Le catalogue ne contient pas encore de catégories."
            />
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            {rows.map(({ category, categoryIds }) => (
              <CategoryProductRow
                key={category.id}
                category={category}
                categoryIds={categoryIds}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
