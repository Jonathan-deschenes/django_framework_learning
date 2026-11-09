import { StarIcon } from './icons'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, size = 'md' }: RatingStarsProps) {
  const clampedRating = Math.max(0, Math.min(5, rating))
  const starClassName = size === 'sm' ? 'size-4' : 'size-5'
  const percentage = (clampedRating / 5) * 100

  const stars = Array.from({ length: 5 }).map((_, index) => (
    <StarIcon key={index} className={`${starClassName} flex-none`} />
  ))

  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`Note de ${clampedRating.toFixed(1)} sur 5`}
    >
      <span className="flex gap-0.5 text-slate-200">{stars}</span>
      <span
        className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${percentage}%` }}
        aria-hidden="true"
      >
        {stars}
      </span>
    </span>
  )
}
