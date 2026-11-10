import { Navigate, useParams } from 'react-router-dom'
import { categoryBrowsePath } from '../lib/routes'

export function CategoryDetailPage() {
  const { categoryId } = useParams()
  const numericCategoryId = Number(categoryId)

  if (!Number.isInteger(numericCategoryId) || numericCategoryId <= 0) {
    return <Navigate to="/catalogue" replace />
  }

  return <Navigate to={categoryBrowsePath(numericCategoryId)} replace />
}
