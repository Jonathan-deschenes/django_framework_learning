import { useMemo } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import type { Category } from '../api/types'
import { CatalogProvider } from '../contexts/CatalogContext'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { getDescendantCategoryIds } from '../lib/categoryTree'

export interface CatalogOutletContext {
  scopedCategory: Category | null
  scopeCategoryIds: number[]
}

export function CatalogRouteLayout() {
  const [searchParams] = useSearchParams()
  const { categories, loading } = useTaxonomy()

  const rawCategoryId = searchParams.get('category')
  const numericCategoryId = rawCategoryId ? Number(rawCategoryId) : Number.NaN

  const scopedCategory = useMemo(() => {
    if (!Number.isInteger(numericCategoryId)) return null
    return categories.find((category) => category.id === numericCategoryId) ?? null
  }, [categories, numericCategoryId])

  const scopeCategoryIds = useMemo(
    () =>
      scopedCategory
        ? getDescendantCategoryIds(scopedCategory.id, categories)
        : [],
    [categories, scopedCategory],
  )

  const outletContext = useMemo<CatalogOutletContext>(
    () => ({ scopedCategory, scopeCategoryIds }),
    [scopedCategory, scopeCategoryIds],
  )

  return (
    <CatalogProvider scopeCategoryIds={scopeCategoryIds} scopeReady={!loading}>
      <Outlet context={outletContext} />
    </CatalogProvider>
  )
}
