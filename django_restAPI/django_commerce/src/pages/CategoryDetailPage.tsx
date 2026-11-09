import { Link, useParams } from 'react-router-dom'
import { CategoryBreadcrumb } from '../components/CategoryBreadcrumb'
import { CategoryTree } from '../components/CategoryTree'
import { EmptyState, ErrorState, PageLoading } from '../components/States'
import { ArrowLeftIcon, FolderIcon } from '../components/icons'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'

export function CategoryDetailPage() {
  const { categoryId } = useParams()
  const { categories, categoryById, loading, error, reload } = useTaxonomy()

  const numericCategoryId = Number(categoryId)
  const category = categoryById.get(numericCategoryId)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageLoading label="Chargement de la catégorie…" />
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

  if (!Number.isInteger(numericCategoryId) || !category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Catégorie introuvable"
          message="Cette catégorie n’existe pas dans le catalogue."
          action={
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeftIcon />
              Toutes les catégories
            </Link>
          }
        />
      </div>
    )
  }

  const parent = category.parent !== null ? categoryById.get(category.parent) : undefined
  const children = categories.filter((entry) => entry.parent === category.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <CategoryBreadcrumb category={category} />

      <div className="mt-6 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:mb-0 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Arborescence
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                Toutes les catégories
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {formatNumber(categories.length)}
            </span>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto pr-1 lg:max-h-none">
            <CategoryTree activeCategoryId={category.id} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FolderIcon className="size-6" />
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Slug : <span className="font-mono text-slate-700">{category.slug ?? '—'}</span>
            </p>
            {parent ? (
              <p className="mt-2 text-sm text-slate-500">
                Sous-catégorie de{' '}
                <Link
                  to={`/categories/${parent.id}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {parent.name}
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Catégorie racine</p>
            )}
          </div>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Sous-catégories
              </h2>
              <span className="text-sm text-slate-500">{formatNumber(children.length)}</span>
            </div>

            {children.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                Cette catégorie n’a pas de sous-catégorie.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/categories/${child.id}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                        {child.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {child.slug ?? 'Sans slug'}
                      </span>
                    </span>
                    <span className="text-indigo-500" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeftIcon />
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
