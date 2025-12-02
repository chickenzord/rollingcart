![RollingCart Icon](public/favicon.ico)

# RollingCart

A self-hostable shopping list app designed for recurring grocery runs. Opinionated: one list, one workflow, minimum complexity.

## Why RollingCart?

Most shopping apps let you create multiple lists. RollingCart takes a different approach: **one shopping list, always**. Your catalog organizes items by category. Sessions handle timing. No list management overhead.

- **One source of truth**: Everything lives in one list. No more "did I put eggs on the grocery list or the weekly list?"
- **Catalog as memory**: Items you've bought before are always a quick search away
- **Session-based workflow**: Start a trip, check off items, finish. Unchecked items roll over to next time.

Read the [User Guide](USER_GUIDE.md) to understand the full workflow and design philosophy.

**Live demo coming soon.**

## Features

- **Fuzzy search**: Find items quickly even with typos
- **Catalog system**: Organize items by category, reuse them anytime
- **Shopping trips**: Track what you bought, review past trips
- **Pre-seeded catalog**: Common grocery items ready to use
- **Mobile-friendly**: Responsive design for on-the-go use

## Quick Setup

RollingCart is built with **Ruby on Rails** and supports both **SQLite** (default) and **PostgreSQL**.

### Docker Compose

**Prerequisites:** Docker and Docker Compose

1. Clone and configure:
```bash
git clone https://github.com/chickenzord/rollingcart.git
cd rollingcart
cp .env.example .env
```

2. Edit `.env`:
```bash
RAILS_MASTER_KEY=<content-of-config/master.key>
DB_PASSWORD=your-secure-password
```

3. Start:
```bash
docker compose up -d
```

4. Create user and seed catalog:
```bash
docker compose exec app bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
docker compose exec app bin/rails catalog:seed EMAIL=you@example.com
```

5. Open http://localhost:3000

### User Management

```bash
# Create user
docker compose exec app bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword

# List users
docker compose exec app bin/rails user:list

# Delete user
docker compose exec app bin/rails user:delete EMAIL=you@example.com
```

### Catalog Seeding

```bash
# Seed all default catalogs
docker compose exec app bin/rails catalog:seed EMAIL=you@example.com

# Seed specific catalogs only
docker compose exec app bin/rails catalog:seed EMAIL=you@example.com FILES=grocery_fresh.yml,grocery_pantry.yml
```

Seeding is optional. You can start with zero catalog items and build your own from scratch.

## Configuration

### Environment Variables

**Rails environment variables:**

| Variable           | Description               | Default                      |
| ------------------ | ------------------------- | ---------------------------- |
| `RAILS_MASTER_KEY` | Rails credentials key     | Required                     |
| `DATABASE_URL`     | PostgreSQL connection URL | (uses SQLite if not set)     |
| `DATABASE_PATH`    | SQLite database file path | `storage/production.sqlite3` |
| `APP_HOST`         | Application hostname      | `localhost`                  |
| `CORS_ORIGINS`     | Allowed CORS origins      | `http://localhost:3000`      |
| `RAILS_LOG_LEVEL`  | Log verbosity             | `info`                       |

**Docker Compose convenience variables** (used to construct `DATABASE_URL`):

| Variable      | Description              | Default       |
| ------------- | ------------------------ | ------------- |
| `DB_HOST`     | PostgreSQL host          | `db`          |
| `DB_PORT`     | PostgreSQL port          | `5432`        |
| `DB_USERNAME` | PostgreSQL username      | `rollingcart` |
| `DB_PASSWORD` | PostgreSQL password      | `changeme`    |
| `DB_NAME`     | PostgreSQL database name | `rollingcart` |

**Database selection**: If `DATABASE_URL` is set, PostgreSQL is used. Otherwise, SQLite is used with the path from `DATABASE_PATH`.

## Development

```bash
# Quick start for development
bundle install && npm install
bin/rails db:setup
bin/rails user:create EMAIL=dev@example.com PASSWORD=password
foreman start -f Procfile.dev  # Starts Rails + Vite
```

## Tech Stack

- **Backend**: Rails 8, Rodauth (JWT auth), SQLite/PostgreSQL
- **Frontend**: React 19, Vite, Tailwind CSS, DaisyUI
- **Search**: Fuse.js

## License

MIT
