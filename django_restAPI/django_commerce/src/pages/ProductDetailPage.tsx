import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../api/types'
import { ProductImage } from '../components/ProductImage'
import { RatingStars } from '../components/RatingStars'
import { ReviewList } from '../components/ReviewList'
import { EmptyState, ErrorState, PageLoading } from '../components/States'
import { ArrowLeftIcon } from '../components/icons'
import { useProduct } from '../contexts/ProductContext'
import {
  averageRating,
  formatPrice,
  formatReviewCount,
  formatDate,
} from '../lib/format'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { fetchProduct } = useProduct()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const numericProductId = Number(productId)

  useEffect(() => {
    let active = true

    if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
      setProduct(null)
      setError('Identifiant produit invalide.')
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    setError(null)
    setProduct(null)

    fetchProduct(numericProductId)
      .then((nextProduct) => {
        if (!active) return
        setProduct(nextProduct)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(
          cause instanceof Error
            ? cause.message
            : 'Impossible de charger ce produit pour le moment.',
        )
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [fetchProduct, numericProductId, reloadToken])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageLoading label="Chargement du produit…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          title="Produit introuvable"
          message={error}
          onRetry={() => setReloadToken((token) => token + 1)}
        />
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeftIcon />
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Produit introuvable"
          message="Ce produit n’existe pas ou n’est plus disponible."
          action={
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeftIcon />
              Retour au catalogue
            </Link>
          }
        />
      </div>
    )
  }

  const rating = averageRating(product.reviews)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Fil d’Ariane">
        <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-700">
          Catalogue
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-slate-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImage
          product={product}
          className="aspect-square w-full rounded-3xl shadow-sm"
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-100"
              >
                {category.name}
              </Link>
            ))}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.is_active && product.stock > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {!product.is_active
                ? 'Indisponible'
                : product.stock > 0
                  ? `En stock (${product.stock})`
                  : 'Rupture de stock'}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RatingStars rating={rating} />
            <span className="text-sm text-slate-500">
              {rating.toFixed(1)} / 5 · {formatReviewCount(product.reviews.length)}
            </span>
          </div>

          <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
            {formatPrice(product.price)}
          </p>

          <p className="mt-5 whitespace-pre-line text-base leading-7 text-slate-600">
            {product.description}
          </p>

          {product.tags.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tags
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-slate-400">
            Ajouté au catalogue le {formatDate(product.created_at)}
          </p>
        </div>
      </div>

      <ReviewList reviews={product.reviews} />
    </div>
  )
}
