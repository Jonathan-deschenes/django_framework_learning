import type { ReactNode } from 'react'
import { ProductProvider } from './ProductContext'
import { TaxonomyProvider } from './TaxonomyContext'
import { UsersProvider } from './UsersContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TaxonomyProvider>
      <ProductProvider>
        <UsersProvider>{children}</UsersProvider>
      </ProductProvider>
    </TaxonomyProvider>
  )
}
