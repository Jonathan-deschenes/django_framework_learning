import { Link } from 'react-router-dom'
import type { Product } from '../api/types'
import { averageRating, formatPrice, formatReviewCount } from '../lib/format'
import { ProductImage } from './ProductImage'
import { RatingStars } from './RatingStars'

export function ProductCard({ product }: { product: Product }) {
  const rating = averageRating(product.reviews)
  const category = product.categories[0]

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <ProductImage product={product} className="aspect-[4/3] w-full" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            {category?.name ?? 'Catalogue'}
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              product.stock > 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {product.stock > 0 ? 'En stock' : 'Épuisé'}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-slate-900 group-hover:text-indigo-700">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <RatingStars rating={rating} size="sm" />
            <p className="mt-1 text-xs text-slate-500">
              {formatReviewCount(product.reviews.length)}
            </p>
          </div>
          <p className="text-lg font-semibold tracking-tight text-slate-900">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}
