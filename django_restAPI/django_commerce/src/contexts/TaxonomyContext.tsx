import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { listAllCategories, listAllTags } from '../api/client'
import type { Category, Tag } from '../api/types'
import { buildCategoryTree, type CategoryTreeNode } from '../lib/categoryTree'

interface TaxonomyContextValue {
  categories: Category[]
  tags: Tag[]
  categoryById: Map<number, Category>
  tagById: Map<number, Tag>
  categoryTree: CategoryTreeNode[]
  loading: boolean
  error: string | null
  reload: () => void
}

const TaxonomyContext = createContext<TaxonomyContextValue | null>(null)

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    Promise.all([listAllCategories(controller.signal), listAllTags(controller.signal)])
      .then(([nextCategories, nextTags]) => {
        setCategories(nextCategories)
        setTags(nextTags)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return

        setError(
          cause instanceof Error
            ? cause.message
            : 'Impossible de charger les catégories et les tags.',
        )
        setLoading(false)
      })

    return () => controller.abort()
  }, [reloadToken])

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const tagById = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags],
  )

  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories],
  )

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const value = useMemo<TaxonomyContextValue>(
    () => ({
      categories,
      tags,
      categoryById,
      tagById,
      categoryTree,
      loading,
      error,
      reload,
    }),
    [
      categories,
      categoryById,
      categoryTree,
      error,
      loading,
      reload,
      tagById,
      tags,
    ],
  )

  return <TaxonomyContext.Provider value={value}>{children}</TaxonomyContext.Provider>
}

export function useTaxonomy(): TaxonomyContextValue {
  const context = useContext(TaxonomyContext)

  if (!context) {
    throw new Error('useTaxonomy doit être utilisé dans un TaxonomyProvider.')
  }

  return context
}
