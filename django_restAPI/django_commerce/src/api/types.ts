export interface Category {
  id: number
  name: string
  slug: string | null
  parent: number | null
}

export interface Tag {
  id: number
  name: string
}

export interface Review {
  id: number
  rating: number
  comment: string
  user: number
  product: number
  created_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  is_active: boolean
  categories: Category[]
  tags: Tag[]
  reviews: Review[]
  created_at: string
}

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
