import { useEffect, useMemo } from 'react'
import type { Review } from '../api/types'
import { useUsers } from '../contexts/UsersContext'
import {
  averageRating,
  displayName,
  formatDate,
  formatReviewCount,
  getInitials,
} from '../lib/format'
import { RatingStars } from './RatingStars'
import { StarIcon } from './icons'

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const { users, getUser } = useUsers()

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (first, second) =>
          new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
      ),
    [reviews],
  )

  useEffect(() => {
    const reviewerIds = Array.from(new Set(sortedReviews.map((review) => review.user)))

    reviewerIds.forEach((reviewerId) => {
      void getUser(reviewerId).catch(() => undefined)
    })
  }, [getUser, sortedReviews])

  const rating = averageRating(reviews)
  const distribution = [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: reviews.filter((review) => review.rating === value).length,
  }))

  return (
    <section className="mt-12" aria-labelledby="reviews-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Avis clients
          </p>
          <h2 id="reviews-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Ce que les clients en pensent
          </h2>
        </div>
        <p className="text-sm text-slate-500">{formatReviewCount(reviews.length)}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-end gap-3">
            <p className="text-5xl font-semibold tracking-tight text-slate-900">
              {rating.toFixed(1)}
            </p>
            <span className="pb-1 text-sm text-slate-500">/ 5</span>
          </div>
          <div className="mt-3">
            <RatingStars rating={rating} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Basé sur {formatReviewCount(reviews.length)}
          </p>

          <div className="mt-6 space-y-3">
            {distribution.map((entry) => {
              const percentage =
                reviews.length > 0 ? Math.round((entry.count / reviews.length) * 100) : 0

              return (
                <div key={entry.value} className="flex items-center gap-3 text-sm">
                  <span className="flex w-8 items-center gap-1 font-medium text-slate-600">
                    {entry.value}
                    <StarIcon className="size-3.5 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-500">{entry.count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {sortedReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Aucun avis pour ce produit pour le moment.
            </div>
          ) : (
            sortedReviews.map((review) => {
              const reviewer = users[review.user]
              const name = reviewer ? displayName(reviewer) : `Utilisateur #${review.user}`
              const initials = getInitials(name)

              return (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                        {initials}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {review.comment}
                  </p>
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
