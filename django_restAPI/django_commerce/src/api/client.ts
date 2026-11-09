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

export function listProducts(
  limit: number,
  offset: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Product>> {
  return request<PaginatedResponse<Product>>(
    `/api/product/?limit=${limit}&offset=${offset}`,
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
