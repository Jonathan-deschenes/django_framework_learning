# Django Commerce

Frontend React 19 + TypeScript + Tailwind CSS v4 pour l’API `django_restAPI`.

## Démarrage

```bash
source /usr/local/share/nvm/nvm.sh && nvm use 22
npm install
npm run dev
```

Le serveur Vite écoute sur `http://localhost:5173` et proxifie `/api` vers
`http://127.0.0.1:8000`. Démarrer Django dans un autre terminal :

```bash
cd ..
python manage.py runserver
```

## Scripts

- `npm run dev` : serveur de développement
- `npm run build` : typecheck TypeScript + build de production
- `npm run lint` : oxlint
- `npm run preview` : prévisualisation du build

## API utilisée

Lecture seule :

- `GET /api/product/?limit=&offset=`
- `GET /api/product/<id>/`
- `GET /api/category/?limit=100`
- `GET /api/tag/?limit=100`
- `GET /api/user/<id>/`

Le catalogue est paginé côté serveur (24 produits par page). L’API ne supporte
pas la recherche ni les filtres : les pages catégories/tags sont informatives.
