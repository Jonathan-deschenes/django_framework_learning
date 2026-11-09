import type { ReactNode } from 'react'
import { CatalogProvider } from './CatalogContext'
import { ProductProvider } from './ProductContext'
import { TaxonomyProvider } from './TaxonomyContext'
import { UsersProvider } from './UsersContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CatalogProvider>
      <TaxonomyProvider>
        <ProductProvider>
          <UsersProvider>{children}</UsersProvider>
        </ProductProvider>
      </TaxonomyProvider>
    </CatalogProvider>
  )
}
