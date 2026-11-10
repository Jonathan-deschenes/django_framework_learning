import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CatalogRouteLayout } from './components/CatalogRouteLayout'
import { Layout } from './components/Layout'
import { AppProviders } from './contexts/AppProviders'
import { CatalogPage } from './pages/CatalogPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryDetailPage } from './pages/CategoryDetailPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { TagsPage } from './pages/TagsPage'

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route element={<CatalogRouteLayout />}>
              <Route path="catalogue" element={<CatalogPage />} />
            </Route>
            <Route path="products/:productId" element={<ProductDetailPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:categoryId" element={<CategoryDetailPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
