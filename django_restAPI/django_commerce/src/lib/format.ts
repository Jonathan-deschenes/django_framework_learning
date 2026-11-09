import type { User } from '../api/types'

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

export function formatPrice(value: string | number): string {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return priceFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date inconnue' : dateFormatter.format(date)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function averageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0
  return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
}

export function formatReviewCount(count: number): string {
  return count === 1 ? '1 avis' : `${formatNumber(count)} avis`
}

export function displayName(user: User): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || user.username
}

export function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || '?'
}
