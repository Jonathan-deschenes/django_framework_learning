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

- `GET /api/product/?limit=&offset=&search=&min_price=&max_price=&min_rating=&max_rating=&in_stock=&is_active=&categories=&tags=`
- `GET /api/product/<id>/`
- `GET /api/category/?limit=100`
- `GET /api/tag/?limit=100`
- `GET /api/user/<id>/`

Le catalogue est paginé côté serveur (24 produits par page) et filtré côté
serveur :

- `search` : recherche sur le nom du produit
- `min_price`, `max_price` : fourchette de prix
- `min_rating`, `max_rating` : fourchette de note moyenne (1 à 5)
- `in_stock=true|false` : produits en stock ou épuisés
- `is_active=true|false` : produits actifs ou inactifs
- `categories=<id>` et `tags=<id>` : répétables pour filtrer sur plusieurs
  catégories ou tags

La sidebar de filtres du catalogue utilise directement ces paramètres.

