import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, PageLoading } from '../components/States'
import { FolderIcon } from '../components/icons'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'

export function CategoriesPage() {
  const { categories, categoryById, loading, error, reload } = useTaxonomy()

  const childCounts = useMemo(() => {
    const counts = new Map<number, number>()
    categories.forEach((category) => {
      if (category.parent !== null) {
        counts.set(category.parent, (counts.get(category.parent) ?? 0) + 1)
      }
    })
    return counts
  }, [categories])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageLoading label="Chargement des catégories…" />
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
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Navigation
      </p>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Catégories
        </h1>
        <p className="text-sm text-slate-500">
          {formatNumber(categories.length)} catégories dans le catalogue
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const parent = category.parent !== null ? categoryById.get(category.parent) : undefined
          const childCount = childCounts.get(category.id) ?? 0

          return (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FolderIcon />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-slate-900 group-hover:text-indigo-700">
                  {category.name}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">
                  {parent ? `Sous-catégorie de ${parent.name}` : category.slug ?? 'Catégorie racine'}
                </span>
                {childCount > 0 ? (
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {formatNumber(childCount)} sous-catégorie{childCount > 1 ? 's' : ''}
                  </span>
                ) : null}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
