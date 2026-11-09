import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { retrieveProduct } from '../api/client'
import type { Product } from '../api/types'

interface ProductContextValue {
  fetchProduct: (id: number) => Promise<Product>
}

const ProductContext = createContext<ProductContextValue | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const cache = useRef(new Map<number, Product>())
  const inFlight = useRef(new Map<number, Promise<Product>>())

  const fetchProduct = useCallback((id: number) => {
    const cachedProduct = cache.current.get(id)
    if (cachedProduct) {
      return Promise.resolve(cachedProduct)
    }

    const pendingRequest = inFlight.current.get(id)
    if (pendingRequest) {
      return pendingRequest
    }

    const request = retrieveProduct(id)
      .then((product) => {
        cache.current.set(id, product)
        inFlight.current.delete(id)
        return product
      })
      .catch((cause: unknown) => {
        inFlight.current.delete(id)
        throw cause
      })

    inFlight.current.set(id, request)
    return request
  }, [])

  const value = useMemo<ProductContextValue>(() => ({ fetchProduct }), [fetchProduct])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProduct(): ProductContextValue {
  const context = useContext(ProductContext)

  if (!context) {
    throw new Error('useProduct doit être utilisé dans un ProductProvider.')
  }

  return context
}
