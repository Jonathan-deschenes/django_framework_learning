# AGENTS.md — django_restAPI

Standalone Django 6.1 + DRF project. Run all commands from this directory (`manage.py` and `db.sqlite3` live here). Dependencies are in the repo-root `requirements.txt` (`pip install -r ../requirements.txt`); the devcontainer installs them automatically.

## Commands
- `python manage.py check`
- `python manage.py migrate`
- `python manage.py runserver` — API is mounted at `/api/`
- `python manage.py test` — suite is currently empty (`api/tests.py` has no tests)
- `python manage.py makemigrations --check --dry-run` — verify models/migrations are in sync
- `python manage.py seed_data` — non-idempotent fixture: 500 users (password `test1234`), 100 categories, 10k products, 30k reviews, orders/items. Re-running duplicates data. It catches all exceptions and only logs them, so a run can look successful while having failed.

No lint, formatter, or typecheck config exists; do not invent commands.

## Wiring
- Settings: `django_restAPI.settings`; app: `api`; root URLconf includes `api.urls` at `/api/`.
- Custom user model is `api.User` (`AUTH_USER_MODEL`). Use `settings.AUTH_USER_MODEL`/`get_user_model`, never `django.contrib.auth.models.User`.
- DRF only configures `LimitOffsetPagination` with `PAGE_SIZE=100` (`?limit=&offset=`; list responses are `{count,next,previous,results}`). No default auth/permissions are set, so write endpoints are open.
- Views are DRF generics in `api/views.py`; serializers in `api/serializers.py`. Models: Category, Tag, Product, Review, Order, OrderItem.

## API quirks (verified)
- Routes use singular nouns. Most have trailing slashes, but `category/<pk>` and `review/<pk>` do not — preserve this when adding clients or tests.
- Orders/items are nested under the user: `/api/user/<user_pk>/order/...`. Querysets are filtered by URL kwargs (`user_pk`, `order_pk`), not query params.
- Order create accepts nested `items`; order update silently ignores `items`.
- `OrderItem.unit_price` is copied from the product price on create and is read-only through the API. Order items can be created/updated/deleted only while the order is `PENDING`.
- Product nested `categories`/`tags`/`reviews` are read-only, so they cannot be assigned via the product endpoint.
- `api/views.py` imports `ValidationError` from `environs`, which is actually marshmallow's exception, not `rest_framework.exceptions.ValidationError`; the non-PENDING guard therefore produces a 500 rather than a DRF 400. Fix when touching that code.

## Repo gotchas
- `db.sqlite3` (~25 MB, seeded) and `__pycache__/*.pyc` files are tracked in git. Avoid committing unintended changes to them, and never run `seed_data` against a database whose contents you need.
- Migrations are committed through `0008`; pair model changes with new migrations.

## Frontend (`django_commerce/`)
- Separate React 19 + Vite + TypeScript + Tailwind CSS v4 app. Frontend work must not modify the Django `api` app; data is read-only through the existing GET endpoints.
- Node 22 is installed via nvm: `source /usr/local/share/nvm/nvm.sh && nvm use 22`. Run `npm install`/`npm run dev` from `django_commerce/`.
- `npm run dev` serves on port 5173 and proxies `/api` to `http://127.0.0.1:8000`; start Django separately with `python manage.py runserver`.
- `npm run build` runs `tsc -b && vite build`; `npm run lint` uses oxlint (warnings are expected for context files).
- The API has no search/filter parameters, so the catalog only paginates with `limit`/`offset` (24 per page). Category/tag pages are informational; do not fake server-side filtering.
- Reviews expose only `user` IDs; the frontend resolves names through `/api/user/<id>/` with a cache in `UsersContext`. Prices are Decimal strings, formatted client-side.
