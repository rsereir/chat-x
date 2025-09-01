# ChatX – Quick Start

This project contains:
- Symfony 7 backend (`api/` folder).
- Next.js 14+ frontend (`web/` folder).
- Platform.sh infrastructure (`.platform/` folder).

Below you will find:
- Prerequisites for each part (back, front, ops).
- A ready-to-use Docker Compose stack (Symfony + Caddy + Mercure + PostgreSQL + Next.js) to run the project without installing dependencies locally.
- Useful commands to operate on Platform.sh (deploy, view logs, etc.).


## 1) Prerequisites

You have two options to work:

- Option A (recommended): Docker + Docker Compose
  - Docker Desktop or equivalent
  - No local PHP/Node installation is required (dependencies are already in the repo: `api/vendor` and `web/node_modules`)

- Option B (native)
  - Back end: PHP >= 8.2, Composer, common PHP extensions (ctype, iconv, pdo_pgsql, intl…), a PostgreSQL 13 database
  - Front end: Node.js 20+, npm or yarn, Next.js

If you want to work with Platform.sh (deploy, production logs, etc..) you need `platform` CLI (Platform.sh) and configure your ssh key if you want to operate from your machine


## 2) Run the project locally (Docker Compose)

The `docker-compose.yml` at the repository root defines 5 services:
- `db`: PostgreSQL 13
- `api`: PHP-FPM (Symfony)
- `web`: Next.js (dev server on port 3000)
- `mercure`: Mercure Hub (embedded Caddy)
- `caddy`: Caddy reverse proxy unifying routing

Local routing (via Caddy on port 80):
- Front: http://localhost/
- API: http://localhost/api
- Mercure: http://localhost/.well-known/mercure

Commands:

1) Start

```
docker compose up --build
```

2) Stop

```
docker compose down
```

3) (Optional) Reset Postgres

```
docker compose down -v
```

Notes:
- The `api/` code is mounted into the `api` container and exposed to Caddy to serve `/api`
- The `web/` code is mounted into the `web` container and started via `npm run dev`
- Development Mercure JWT keys are set in `docker-compose.yml` (`MERCURE_PUBLISHER_JWT_KEY` and `MERCURE_SUBSCRIBER_JWT_KEY`). Change them for production
- The Symfony database connection is exposed via `DATABASE_URL` (adjust in `docker-compose.yml` if needed)


## 3) Proxy structure (Caddy)

`Caddyfile` (root):
- Reverse proxy to Next.js by default (route `/`)
- FastCGI to PHP-FPM for `/api`
- Proxy to Mercure for `/.well-known/mercure`

This provides a single entry point http://localhost/ for all components


## 4) Backend (Symfony)

- Version: Symfony 7.3 (`api/composer.json`).
- Required PHP: >= 8.2
- Extensions used: ctype, iconv, pdo_pgsql, intl (already installed in docker image)
- Public directory: `api/public`

Useful commands (run inside the API container):

```
# Open a shell in the PHP-FPM container
docker compose exec api sh

# Run a Symfony command
docker compose exec api php bin/console about
```

## 5) Frontend (Next.js)

- Folder: `web/`
- Uses Ant Design v5 for UI
- Dev server: port 3000

Run with Docker (recommended): see section 2 above

Run natively (without Docker):
```
cd web
yarn install
yarn run dev
```

Build and start (native):
```
cd web
yarn run build
yarn start
```

Useful commands (inside the `web` container):
```
# Open a shell in the Next.js container
docker compose exec web sh

# Run the build (if needed)
docker compose exec web yarn build

# Start in production mode (if you want to test without the dev server)
docker compose exec web yarn start -- -p 3000
```


## 6) OPS (Platform.sh)

The project is already configured for Platform.sh via `.platform/*`:
- `.platform/services.yaml`: PostgreSQL 13
- `.platform/applications.yaml`: three apps (`api` in PHP 8.2, `web` in Node.js 20 and `mercure` for notifications)
- `.platform/routes.yaml`: routing to `web` (site) and `api` (`/api` and `/bundles`)

Example commands with the Platform.sh CLI:

- Log in to the project:
```
platform auth:login
platform project:set-remote <PROJECT_ID>
```

- List environments:
```
platform environment:list
```

- Deploy (Git push triggers deployment):
```
git push platform <branch>
```

- View logs:
```
platform log --level=info
platform log access --app=web
platform log access --app=api
```

- Open a shell:
```
platform ssh --app=api
platform ssh --app=web
```

- Environment variables:
```
platform variable:list
platform variable:set --level=environment NAME value
```

Before use Platform.sh CLI you need to configure your ssh keys on Platform.sh account and must be invited on the project

References:
- Platform.sh docs: https://docs.platform.sh/
- Mercure: https://mercure.rocks/
- Caddy: https://caddyserver.com/docs/
- Project backlog: https://github.com/rsereir/chat-x/issues
