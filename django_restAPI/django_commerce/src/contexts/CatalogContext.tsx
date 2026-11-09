import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { listProducts } from '../api/client'
import type { Product } from '../api/types'

const PAGE_SIZE = 24

interface CatalogContextValue {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  loading: boolean
  error: string | null
  setPage: (page: number) => void
  reload: () => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [page, setPageState] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    listProducts(PAGE_SIZE, (page - 1) * PAGE_SIZE, controller.signal)
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

    return () => controller.abort()
  }, [page, reloadToken])

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
      setPage,
      reload,
    }),
    [error, loading, page, products, reload, setPage, total, totalPages],
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
