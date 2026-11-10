import { useEffect, useId, type ReactNode } from 'react'
import { XMarkIcon } from './icons'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  side?: 'left' | 'right'
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: DrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 ${
          side === 'right' ? 'right-0' : 'left-0'
        } flex w-full max-w-sm flex-col bg-slate-50 shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <h2
            id={titleId}
            className="text-base font-semibold tracking-tight text-slate-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
