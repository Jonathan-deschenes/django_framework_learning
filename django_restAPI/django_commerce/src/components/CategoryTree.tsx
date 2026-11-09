import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTaxonomy } from '../contexts/TaxonomyContext'
import { getCategoryPathIds, type CategoryTreeNode } from '../lib/categoryTree'
import { ChevronRightIcon } from './icons'

interface CategoryTreeProps {
  activeCategoryId?: number
  className?: string
}

interface TreeNodeProps {
  node: CategoryTreeNode
  activeCategoryId?: number
  activePathIds: number[]
  expandedIds: Set<number>
  onToggle: (id: number) => void
}

function TreeNode({
  node,
  activeCategoryId,
  activePathIds,
  expandedIds,
  onToggle,
}: TreeNodeProps) {
  const { category, children } = node
  const hasChildren = children.length > 0
  const isActive = category.id === activeCategoryId
  const isExpanded = expandedIds.has(category.id) || activePathIds.includes(category.id)

  return (
    <li>
      <div
        className={`flex items-center gap-1 rounded-lg px-1 ${
          isActive ? 'bg-indigo-50' : ''
        }`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            aria-label={`${isExpanded ? 'Réduire' : 'Développer'} ${category.name}`}
            aria-expanded={isExpanded}
            className="flex size-6 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-white hover:text-slate-600"
          >
            <ChevronRightIcon
              className={`size-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden="true" />
        )}

        <Link
          to={`/categories/${category.id}`}
          aria-current={isActive ? 'page' : undefined}
          className={`flex-1 truncate py-1.5 pr-1 text-sm transition ${
            isActive
              ? 'font-semibold text-indigo-700'
              : 'text-slate-600 hover:text-indigo-700'
          }`}
        >
          {category.name}
        </Link>

        {hasChildren ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            {children.length}
          </span>
        ) : null}
      </div>

      {hasChildren && isExpanded ? (
        <ul className="ml-3 border-l border-slate-200 pl-2">
          {children.map((child) => (
            <TreeNode
              key={child.category.id}
              node={child}
              activeCategoryId={activeCategoryId}
              activePathIds={activePathIds}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CategoryTree({ activeCategoryId, className = '' }: CategoryTreeProps) {
  const { categoryTree, categoryById } = useTaxonomy()
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const activePathIds = useMemo(() => {
    if (activeCategoryId === undefined) return []

    const category = categoryById.get(activeCategoryId)
    return category ? getCategoryPathIds(category, categoryById) : []
  }, [activeCategoryId, categoryById])

  const toggle = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (categoryTree.length === 0) {
    return <p className="text-sm text-slate-500">Aucune catégorie disponible.</p>
  }

  return (
    <ul className={`space-y-0.5 ${className}`}>
      {categoryTree.map((node) => (
        <TreeNode
          key={node.category.id}
          node={node}
          activeCategoryId={activeCategoryId}
          activePathIds={activePathIds}
          expandedIds={expandedIds}
          onToggle={toggle}
        />
      ))}
    </ul>
  )
}
