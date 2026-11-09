import { useCatalog } from '../contexts/CatalogContext'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { formatNumber } from '../lib/format'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../components/ProductCard'
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/States'

export function CatalogPage() {
  const { products, total, page, totalPages, loading, error, setPage, reload } = useCatalog()
  const { categories, tags } = useTaxonomy()

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl shadow-slate-200 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Catalogue connecté à l’API Django
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Des produits qui donnent envie.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Parcourez le catalogue, ouvrez une fiche produit et découvrez les avis laissés
            par les utilisateurs. Les images sont des placeholders générés localement.
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">{formatNumber(total)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Produits</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">{formatNumber(categories.length)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Catégories</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">{formatNumber(tags.length)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Tags</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="catalog-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Catalogue
            </p>
            <h2 id="catalog-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Tous les produits
            </h2>
          </div>
          {!loading && !error ? (
            <p className="text-sm text-slate-500">
              {formatNumber(total)} produits · page {page} sur {totalPages}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          {loading ? (
            <ProductGridSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Aucun produit à afficher"
              message="Le catalogue est vide pour le moment. Lancez la commande seed_data pour ajouter des produits de démonstration."
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </section>
    </div>
  )
}
