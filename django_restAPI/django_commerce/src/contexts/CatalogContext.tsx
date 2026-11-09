import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { listProducts, type ProductListParams } from '../api/client'
import type { Product } from '../api/types'

const PAGE_SIZE = 24
const FILTER_DEBOUNCE_MS = 300

interface CatalogContextValue {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  loading: boolean
  error: string | null
  filters: ProductListParams
  activeFilterCount: number
  hasActiveFilters: boolean
  setPage: (page: number) => void
  applyFilters: (patch: Partial<ProductListParams>) => void
  resetFilters: () => void
  reload: () => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [page, setPageState] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductListParams>({})
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      listProducts(
        PAGE_SIZE,
        (page - 1) * PAGE_SIZE,
        filters,
        controller.signal,
      )
        .then((response) => {
          setProducts(response.results)
          setTotal(response.count)
          setLoading(false)
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return

          setError(
            cause instanceof Error
              ? cause.message
              : 'Impossible de charger le catalogue pour le moment.',
          )
          setLoading(false)
        })
    }, FILTER_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [filters, page, reloadToken])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState((currentPage) => {
        const clampedPage = Math.min(Math.max(1, nextPage), totalPages)
        return clampedPage === currentPage ? currentPage : clampedPage
      })
    },
    [totalPages],
  )

  const applyFilters = useCallback((patch: Partial<ProductListParams>) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...patch }))
    setPageState(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({})
    setPageState(1)
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0

    if (filters.search?.trim()) count += 1
    if (filters.minPrice?.trim()) count += 1
    if (filters.maxPrice?.trim()) count += 1
    if (filters.minRating !== undefined) count += 1
    if (filters.maxRating !== undefined) count += 1
    if (filters.inStock !== undefined) count += 1
    if (filters.isActive !== undefined) count += 1
    if (filters.categoryIds?.length) count += 1
    if (filters.tagIds?.length) count += 1

    return count
  }, [filters])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages,
      loading,
      error,
      filters,
      activeFilterCount,
      hasActiveFilters: activeFilterCount > 0,
      setPage,
      applyFilters,
      resetFilters,
      reload,
    }),
    [
      activeFilterCount,
      applyFilters,
      error,
      filters,
      loading,
      page,
      products,
      reload,
      resetFilters,
      setPage,
      total,
      totalPages,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext)

  if (!context) {
    throw new Error('useCatalog doit être utilisé dans un CatalogProvider.')
  }

  return context
}
