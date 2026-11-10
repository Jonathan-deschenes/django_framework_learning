import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '../components/icons'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Erreur 404
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
        La page demandée n’existe pas ou a été déplacée. Revenez au catalogue pour
        continuer votre navigation.
      </p>
      <Link
        to="/catalogue"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <ArrowLeftIcon />
        Retour au catalogue
      </Link>
    </div>
  )
}
