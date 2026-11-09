import { CategoryTree } from '../components/CategoryTree'
import { ErrorState, PageLoading } from '../components/States'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'

export function CategoriesPage() {
  const { categories, loading, error, reload } = useTaxonomy()

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

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Arborescence
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              Explorer les catégories
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Développez une catégorie pour afficher ses sous-catégories.
          </p>
        </div>

        <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">
          <CategoryTree />
        </div>
      </section>
    </div>
  )
}
