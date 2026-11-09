import type { Category } from '../api/types'

export interface CategoryTreeNode {
  category: Category
  children: CategoryTreeNode[]
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodes = new Map<number, CategoryTreeNode>()
  categories.forEach((category) => {
    nodes.set(category.id, { category, children: [] })
  })

  const roots: CategoryTreeNode[] = []

  nodes.forEach((node) => {
    const parentId = node.category.parent
    const parent = parentId !== null ? nodes.get(parentId) : undefined

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (items: CategoryTreeNode[]) =>
    items.sort((left, right) => left.category.name.localeCompare(right.category.name, 'fr'))

  sortNodes(roots)
  nodes.forEach((node) => sortNodes(node.children))

  return roots
}

export function getCategoryPath(
  category: Category,
  categoryById: Map<number, Category>,
): Category[] {
  const path: Category[] = []
  const visited = new Set<number>()
  let current: Category | undefined = category

  while (current && !visited.has(current.id)) {
    path.unshift(current)
    visited.add(current.id)
    current = current.parent !== null ? categoryById.get(current.parent) : undefined
  }

  return path
}

export function getCategoryPathIds(
  category: Category,
  categoryById: Map<number, Category>,
): number[] {
  return getCategoryPath(category, categoryById).map((entry) => entry.id)
}
