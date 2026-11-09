import { ErrorState, PageLoading } from '../components/States'
import { TagIcon } from '../components/icons'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'

export function TagsPage() {
  const { tags, loading, error, reload } = useTaxonomy()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageLoading label="Chargement des tags…" />
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
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tags</h1>
        <p className="text-sm text-slate-500">
          {formatNumber(tags.length)} tags utilisés dans le catalogue
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
          >
            <TagIcon className="size-4 text-indigo-500" />
            #{tag.name}
          </span>
        ))}
      </div>
    </div>
  )
}
