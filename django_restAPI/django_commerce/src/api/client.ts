import type {
  Category,
  PaginatedResponse,
  Product,
  Tag,
  User,
} from './types'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError(
      `L'API a répondu avec le statut ${response.status}.`,
      response.status,
    )
  }

  return (await response.json()) as T
}

async function getAllPages<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const results: T[] = []
  let offset = 0

  while (true) {
    const separator = path.includes('?') ? '&' : '?'
    const page = await request<PaginatedResponse<T>>(
      `${path}${separator}limit=100&offset=${offset}`,
      signal,
    )

    results.push(...page.results)

    if (!page.next || page.results.length === 0 || offset + page.results.length >= page.count) {
      break
    }

    offset += page.results.length
  }

  return results
}

export interface ProductListParams {
  search?: string
  minPrice?: string
  maxPrice?: string
  minRating?: number
  maxRating?: number
  inStock?: boolean
  isActive?: boolean
  categoryIds?: number[]
  tagIds?: number[]
}

export function listProducts(
  limit: number,
  offset: number,
  params: ProductListParams = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  const search = params.search?.trim()
  if (search) searchParams.set('search', search)

  const minPrice = params.minPrice?.trim()
  if (minPrice) searchParams.set('min_price', minPrice)

  const maxPrice = params.maxPrice?.trim()
  if (maxPrice) searchParams.set('max_price', maxPrice)

  if (params.minRating !== undefined) {
    searchParams.set('min_rating', String(params.minRating))
  }

  if (params.maxRating !== undefined) {
    searchParams.set('max_rating', String(params.maxRating))
  }

  if (params.inStock !== undefined) {
    searchParams.set('in_stock', String(params.inStock))
  }

  if (params.isActive !== undefined) {
    searchParams.set('is_active', String(params.isActive))
  }

  params.categoryIds?.forEach((id) => searchParams.append('categories', String(id)))
  params.tagIds?.forEach((id) => searchParams.append('tags', String(id)))

  return request<PaginatedResponse<Product>>(
    `/api/product/?${searchParams.toString()}`,
    signal,
  )
}

export function retrieveProduct(id: number, signal?: AbortSignal): Promise<Product> {
  return request<Product>(`/api/product/${id}/`, signal)
}

export function listAllCategories(signal?: AbortSignal): Promise<Category[]> {
  return getAllPages<Category>('/api/category/', signal)
}

export function listAllTags(signal?: AbortSignal): Promise<Tag[]> {
  return getAllPages<Tag>('/api/tag/', signal)
}

export function retrieveUser(id: number, signal?: AbortSignal): Promise<User> {
  return request<User>(`/api/user/${id}/`, signal)
}
