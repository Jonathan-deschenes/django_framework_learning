import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../api/client'
import type { Category, Product } from '../api/types'
import { categoryBrowsePath } from '../lib/routes'
import { ProductCard } from './ProductCard'
import { ProductGridSkeleton } from './States'
import { ArrowPathIcon, ChevronRightIcon } from './icons'

const PRODUCTS_PER_ROW = 4

interface CategoryProductRowProps {
  category: Category
  categoryIds: number[]
}

export function CategoryProductRow({
  category,
  categoryIds,
}: CategoryProductRowProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    listProducts(
      PRODUCTS_PER_ROW,
      0,
      { categoryIds },
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return
        setProducts(response.results)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(
          cause instanceof Error
            ? cause.message
            : 'Impossible de charger cette catégorie.',
        )
        setLoading(false)
      })

    return () => controller.abort()
  }, [categoryIds, reloadToken])

  if (!loading && !error && products.length === 0) {
    return null
  }

  return (
    <section aria-labelledby={`category-row-${category.id}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Catégorie
          </p>
          <h2
            id={`category-row-${category.id}`}
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
          >
            {category.name}
          </h2>
        </div>
        <Link
          to={categoryBrowsePath(category.id)}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Voir plus
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      <div className="mt-5">
        {loading ? (
          <ProductGridSkeleton count={PRODUCTS_PER_ROW} />
        ) : error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setReloadToken((token) => token + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              <ArrowPathIcon className="size-3.5" />
              Réessayer
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
