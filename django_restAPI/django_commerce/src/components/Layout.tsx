import { Link, NavLink, Outlet } from 'react-router-dom'
import { SparklesIcon } from './icons'

function navClassName({ isActive }: { isActive: boolean }): string {
  return `rounded-full px-4 py-2 transition ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <SparklesIcon className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight text-slate-900">
                Django Commerce
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Catalogue produits
              </span>
            </span>
          </Link>

          <nav
            className="flex w-full items-center justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-sm font-medium sm:w-auto"
            aria-label="Navigation principale"
          >
            <NavLink to="/" end className={navClassName}>
              Catalogue
            </NavLink>
            <NavLink to="/categories" className={navClassName}>
              Catégories
            </NavLink>
            <NavLink to="/tags" className={navClassName}>
              Tags
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>Django Commerce — démonstration frontend React + Tailwind CSS.</p>
          <p>Données servies par l’API Django REST Framework.</p>
        </div>
      </footer>
    </div>
  )
}
